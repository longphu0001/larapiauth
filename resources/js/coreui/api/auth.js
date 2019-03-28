import { APP_CONFIG } from '../../config.js';

export default {
    /*
        POST /api/user
        Get access token
    */
    getAccessToken: function(email, password) {
        return axios.post( APP_CONFIG.API_URL + '/auth/login',
        {
            email: email,
            password: password
        });
    },
}
