import { APP_CONFIG } from '../../config.js';

export default {
  /*
      POST /api/user
      Get access token
  */
  getAccessToken: function(email, password) {
    return axios.post(APP_CONFIG.API_URL + '/auth/login',
    {
      email: email,
      password: password
    });
  },

  /*
      GET /api/auth/password/token/create
      Generate password reset token and send that token to user through mail
  */
  createPasswordResetToken: function(email) {
    return axios.post(APP_CONFIG.API_URL + '/auth/password/token/create',
    {
      email: email,
    });
  },
}
