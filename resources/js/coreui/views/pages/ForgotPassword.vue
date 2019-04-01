<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="4">
          <b-card-group>
            <b-card
            no-body
            class="p-4"
            >
            <b-card-body>
              <h2>Forgot password</h2>
              <p class="text-muted">
                Request to reset password
              </p>
              <div v-bind:class="{'alert alert-success': this.successRequest, 'alert alert-danger': !this.successRequest}" id="message" v-if="this.validation.message" role="alert">{{ this.validation.message }}</div>
              <b-input-group class="mb-3">
                <b-input-group-prepend>
                  <b-input-group-text>
                    <i class="icon-envelope-open" />
                  </b-input-group-text>
                </b-input-group-prepend>
                <b-input
                v-model="form.email"
                :state="$v.form.email | state"
                type="text"
                class="form-control"
                placeholder="Email"
                v-on:keyup.enter="submit"
                />
                <div class="invalid-feedback d-block" v-if="$v.form.email.$invalid && validation.errors && validation.errors.email">
                  {{ validation.errors.email[0] }}
                </div>
              </b-input-group>
              <b-row>
                <b-col cols="6">
                  <b-button
                  variant="primary"
                  class="px-4"
                  @click="submit"
                  >
                  Request
                </b-button>
              </b-col>
              <b-col
              cols="6"
              class="text-right"
              >
              <b-button
              variant="link"
              class="px-0"
              @click="$router.push({ name: 'Login' })"
              >
              Login
            </b-button>
            <button type="button" class="btn px-0 btn-link" @click="goToHome()">
              Back to Home
            </button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
  </b-card-group>
</b-col>
</b-row>
</div>
</div>
</template>

<script>
import { required, email } from 'validators'
import AuthAPI from '../../api/auth.js'

export default {
  name: 'ForgotPassword',
  data () {
    return {
      form: {
        email: '',
      },
      validation: {
        message: '',
        successRequest: false,
        errors: {}
      }
    }
  },
  validations () {
    return {
      form: {
        email: { required, email }
      },
    }
  },
  methods: {
    goToHome() {
      window.location.href = "/"
    },
    submit () {
      // Validation
      this.$v.$touch()

      this.requestPasswordReset(this.form.email)
    },

    requestPasswordReset (email) {
      var vueComponent = this;
      // Reset validation
      this.validation.message = ''
      this.validation.errors = {}
      // Get the access token
      AuthAPI.createPasswordResetToken(email)
      .then(response => {
        debugger
        if (response.data && response.data.success) {
          vueComponent.successRequest = true
          vueComponent.validation.message = response.data.message
        } else {
          // Show message error
          vueComponent.validation.message = response.data.message
          vueComponent.successRequest = false
        }
      })
      .catch(error => {
        debugger
        vueComponent.successRequest = false
        if (error.response && error.response.data) {
          vueComponent.validation.message = error.response.data.message
          vueComponent.validation.errors = error.response.data.errors
        } else {
          console.log(JSON.stringify(error))
        }
      })
    }
  },
}
</script>
