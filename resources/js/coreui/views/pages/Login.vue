<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card
            no-body
            class="p-4"
            >
            <b-card-body>
              <h1>Login</h1>
              <p class="text-muted">
                Sign In to your account
              </p>
              <div class="alert alert-danger" id="message" v-if="this.validation.message" role="alert">{{ this.validation.message }}</div>
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
              <b-input-group class="mb-4">
                <b-input-group-prepend>
                  <b-input-group-text>
                    <i class="icon-lock" />
                  </b-input-group-text>
                </b-input-group-prepend>
                <b-input
                v-model="form.password"
                :state="$v.form.password | state"
                type="password"
                class="form-control"
                placeholder="Password"
                v-on:keyup.enter="submit"
                />
                <div class="invalid-feedback d-block" v-if="$v.form.password.$invalid && validation.errors.password">
                  {{ validation.errors.password[0] }}
                </div>
              </b-input-group>
              <b-row>
                <b-col cols="6">
                  <b-button
                  variant="primary"
                  class="px-4"
                  @click="submit"
                  >
                  Login
                </b-button>
              </b-col>
              <b-col
              cols="6"
              class="text-right"
              >
              <b-button
              variant="link"
              class="px-0"
              >
              Forgot password?
            </b-button>
            <button type="button" class="btn px-0 btn-link" @click="goToHome()">
              Back to Home
            </button>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
    <b-card
    no-body
    class="text-white bg-primary py-5 d-md-down-none"
    style="width:44%"
    >
    <b-card-body class="text-center">
      <div>
        <h2>Sign up</h2>
        <p>If you don't have an account yet, you can register one here.</p>
        <b-button
        variant="primary"
        class="active mt-3"
        @click="$router.push({ name: 'Register' })"
        >
        Register Now!
      </b-button>
    </div>
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
  name: 'Login',
  created () {
    if (window.localStorage.getItem('access_token')){
      this.$store.dispatch('user/getUser')
    }
  },
  data () {
    return {
      form: {
        email: '',
        password: '',
      },
      validation: {
        message: '',
        errors: {}
      }
    }
  },
  validations () {
    return {
      form: {
        email: { required, email },
        password: { required },
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
      // if(this.$v.form.$error) return

      this.login(this.form.email, this.form.password)
    },

    login (email, password) {
      var vueComponent = this;
      // Reset validation
      this.validation.message = '';
      this.validation.errors = {};
      // Get the access token
      AuthAPI.getAccessToken(email, password)
      .then(response => {
        if (response.data && response.data.success) {
          // Store token into localStorage
          window.localStorage.setItem('access_token', response.data.data.access_token);
          // Move to dashboard
          vueComponent.$router.push({ name: "Dashboard" })
        } else {
          // Show message error
          vueComponent.validation.message = message
        }
      })
      .catch(error => {
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
