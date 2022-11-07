const express = require('express')
const request = require('request')
const mongoose = require('mongoose')
const app = express()
const Restaurant = require('./schemas/rest')
const RestErrors = require('./schemas/resErrors')
mongoose.connect(
  'mongodb+srv://mongo:db64ce15345@cluster0.8sysxit.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    app.use(express.json({ limit: '20mb' }))

    // Import API Routes
    app.post('/auth', (req, res, next) => {
      const { login, password } = req.body
      if (!login || !password) {
        res.status(401).send({
          error: 'No cred detected',
        })
        return
      }
      const options = {
        method: 'POST',
        url: 'https://sm-register.tinkoff.ru/oauth/token',
        json: true,
        auth: {
          user: 'partner',
          pass: 'partner',
        },
        formData: {
          grant_type: 'password',
          username: login,
          password: password,
        },
      }
      request(options, function (error, response) {
        if (response.body.error) {
          res.status(418).send({
            error: response.body.error,
          })
          return
        }
        res.send({
          token: response.body['access_token'],
        })
      })
    })

    app.get('/getJSON', (req, res, next) => {
      const { tableId } = req.query
      if (!tableId) {
        res.status(401).send({
          error: 'No table id detected',
        })
        return
      }
      const options = {
        method: 'GET',
        url: `https://docs.google.com/spreadsheets/d/${tableId}/gviz/tq?tqx=out:json`,
        json: true,
      }
      request(options, function (error, response) {
        if (error) {
          res.status(500).send({
            error,
          })
          return
        }
        const r = response.body.match(
          /google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/
        )
        if (r && r.length == 2) {
          const obj = JSON.parse(r[1])
          const table = obj.table
          const rows = table.rows.map(({ c }) =>
            c.map((e) => (e ? e.v || '' : ''))
          )
          const resultRows = rows.map((el) => {
            for (let key in el) {
              if (typeof el[key] === 'string') {
                el[key] = el[key].replaceAll('\n', '').replaceAll('`', '')
              }
            }
            return {
              billingDescriptor: el[1],
              fullName: el[2],
              name: el[3],
              inn: el[4],
              kpp: el[5],
              ogrn: el[6],
              addresses: [
                {
                  type: 'legal',
                  zip: el[7],
                  country: el[8],
                  city: el[9],
                  street: el[10],
                },
              ],
              email: el[11],
              founders: {
                individuals: [
                  {
                    firstName: el[12],
                    lastName: el[13],
                    citizenship: el[14],
                    address: el[15],
                  },
                ],
              },
              ceo: {
                address: el[16],
                firstName: el[17],
                lastName: el[18],
                middleName: el[19],
                phone: el[20],
                country: el[21],
              },
              siteUrl: el[22],
              bankAccount: {
                account: el[23],
                korAccount: el[24],
                bankName: el[25],
                bik: el[26],
                details: el[27],
                tax: el[28],
              },
              fiscalization: {
                company: el[29],
                notifyUrl: '',
              },
            }
          })
          res.send(resultRows)
        } else {
          res.status(500).send({
            error: 'Something went wrong',
          })
        }
      })
    })

    app.post('/sendJson', async (req, res, next) => {
      const { token, data } = req.body
      if (!token || !data) {
        res.status(401).send({
          error: 'No token or data detected',
        })
        return
      }
      const options = {
        method: 'POST',
        url: 'https://sm-register.tinkoff.ru/register',
        json: true,
        auth: {
          bearer: token,
        },
        headers: { 'content-type': 'application/json' },
        body: data,
      }
      request(options, async function (error, response) {
        if (error) {
          res.status(500).send({
            error,
          })
          return
        }
        if (response.body.errors) {
          const exist = await RestErrors.findOne({ inn: req.body.data.inn })
          if (exist) {
            await RestErrors.updateOne(
              { inn: req.body.data.inn },
              { tinkoffErrors: JSON.stringify(response.body) }
            )
          } else {
            await RestErrors.create({
              inn: req.body.data.inn,
              tinkoffErrors: JSON.stringify(response.body),
            })
          }
          res.status(418).send({ errors: response.body.errors })
          return
        } else {
          const exist = await Restaurant.findOne({ inn: req.body.data.inn })
          if (exist) {
            await Restaurant.updateOne(
              { inn: req.body.data.inn },
              { data: JSON.stringify(response.body) }
            )
          } else {
            await Restaurant.create({
              inn: req.body.inn,
              data: JSON.stringify(response.body),
            })
          }
          res.send({ status: 'Loaded into db and tinkoff', ...response.body })
        }
      })
    })

    app.get('/restData', async (req, res, next) => {
      const rest = await Restaurant.findOne({ inn: req.query.inn })
      res.send({
        rest,
      })
    })

    app.get('/restErrors', async (req, res, next) => {
      const errors = await RestErrors.findOne({ inn: req.query.inn })
      res.send({
        errors,
      })
    })
  }
)
module.exports = app

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`)
  })
}
