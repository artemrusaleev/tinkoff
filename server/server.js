const express = require('express')
const request = require('request')
// Create express instance
const app = express()
// config
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
    if (error) {
      res.status(500).send({
        error,
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
      const rows = table.rows.map(({ c }) => c.map((e) => (e ? e.v || '' : '')))
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

app.post('/sendJson', (req, res, next) => {
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
  request(options, function (error, response) {
    if (error) {
      res.status(500).send({
        error,
      })
      return
    }
    res.send({
      data: data,
      response: response.body,
    })
  })
})
// Create express router
const router = express.Router()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

// Export express app
module.exports = app

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`)
  })
}
