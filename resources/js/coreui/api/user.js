import { APP_CONFIG } from '../../config.js';

export default {
  /*
  GET /api/user
  To get user information
  */
  getUser: function() {
    const instance = axios.create({
      baseURL: APP_CONFIG.API_URL,
      timeout: 1000,
      headers: {'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')}
    });

    return instance.get('/auth/getUser');
  },
}
