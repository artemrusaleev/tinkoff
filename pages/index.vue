<template>
  <div class="main-page">
    <v-form v-show="step === 1" ref="form" v-model="valid">
      <v-text-field
        v-model="login"
        :rules="loginRules"
        label="Login"
        required
      ></v-text-field>
      <v-text-field
        v-model="password"
        :rules="passwordRules"
        label="Password"
        required
      ></v-text-field>
      <v-btn :disabled="!valid" color="success" class="mr-4" @click="submit">
        Submit
      </v-btn>
      <v-btn color="error" class="mr-4" @click="reset"> Reset Form </v-btn>
    </v-form>
    <v-form v-show="step === 2" ref="form" v-model="valid">
      <v-text-field
        v-model="tableId"
        :rules="tableIdRules"
        label="Tinkoff JSON DATA"
        required
      ></v-text-field>
      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="checkJsonData"
      >
        Check JSON DATA
      </v-btn>
      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="sendJsonData"
      >
        Send JSON DATA
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import { postData } from '~/utils/postData'
export default {
  data: () => ({
    token: '',
    valid: false,
    login: '',
    loginRules: [(v) => !!v || 'Login is required'],
    password: '',
    passwordRules: [(v) => !!v || 'Password is required'],
    tableId: '',
    tableIdRules: [(v) => !!v || 'Table ID is required'],
    step: 1,
    resultArray: [],
  }),

  methods: {
    async submit() {
      try {
        const { token } = await postData('/auth', {
          login: this.login,
          password: this.password,
        })
        this.token = token
        this.step++
      } catch (err) {
        alert(err)
      }
    },
    async checkJsonData() {
      window.open(`/getJson?tableId=${this.tableId}`, '_blank').focus()
    },
    async sendJsonData() {
      try {
        const req = await fetch(`/getJson?tableId=${this.tableId}`)
        const data = await req.json()
        if (data) {
          data.forEach(async (el) => {
            const req = await postData('/sendJson', { ...el })
            const response = await req.json()
            if (response) {
              this.resultArray.push(response)
              console.log(response)
            }
          })
        }
      } catch (err) {
        alert(err)
      }
    },
    reset() {
      this.$refs.form.reset()
    },
  },
}
</script>
