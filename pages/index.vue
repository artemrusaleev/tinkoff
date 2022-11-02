<template>
  <div class="main-page">
    <v-form ref="form" v-model="valid">
      <v-text-field
        v-model="token"
        :rules="tokenRules"
        label="Token"
        required
      ></v-text-field>
      <v-btn :disabled="!valid" color="success" class="mr-4" @click="submit">
        Submit
      </v-btn>
    </v-form>
  </div>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    token: '',
    tokenRules: [(v) => !!v || 'Login is required'],
  }),

  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        const myHeaders = new Headers()
        myHeaders.append(
          'Authorization',
          'Bearer 9c8e141c701a488f1c86cb9c782e17a0'
        )
        myHeaders.append(
          'Cookie',
          'JSESSIONID=97F3D89C7B9CE220D138B413694E3756'
        )
        const body = {
          billingDescriptor: 'narodsushi',
          fullName: 'ИП ЛАЕР ПАВЕЛ ПАВЛОВИЧ',
          name: 'ИП ЛАЕРПАВЕЛ ПАВЛОВИЧ',
          inn: 190701090299,
          kpp: '-',
          ogrn: 322190000015390,
          addresses: [
            {
              type: 'legal',
              zip: '655350',
              country: 'RUS',
              city: 'с. Знаменка',
              street: 'УЛ НАГОРНАЯ, дом 24',
            },
          ],
          email: 'laer_1981@mail.ru',
          founders: {
            individuals: [
              {
                firstName: 'ПАВЕЛ',
                lastName: 'ЛАЕР',
                citizenship: 'С ЗНАМЕНКА',
                address: 'УЛ НАГОРНАЯ, дом 24',
              },
            ],
          },
          ceo: {
            address: 'УЛ НАГОРНАЯ, дом 24',
            firstName: 'ПАВЕЛ',
            lastName: 'ЛАЕР',
            middleName: '',
            phone: '79833728965',
            country: 'RUS',
          },
          siteUrl: 'https://narodsushi.ru',
          bankAccount: {
            account: '40802810700003555415',
            korAccount: '30101810145250000974',
            bankName: 'АО «Тинькофф Банк»',
            bik: 44525974,
            details: '',
            tax: 1,
          },
          fiscalization: {
            company: 'АТОЛ онлайн',
            notifyUrl: '',
          },
        }
        const fetchOptions = {
          method: 'POST',
          headers: myHeaders,
          body: JSON.stringify(body),
        }
        const req = await fetch(
          'https://sm-register.tinkoff.ru/register',
          fetchOptions
        )
        const response = await req.text()
        console.log(response)
      }
    },
  },
}
</script>
