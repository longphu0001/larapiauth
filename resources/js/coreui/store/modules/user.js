import { defaultMutations } from 'vuex-easy-access'
import { APP_CONFIG } from '../../../config.js';

const state = {
    get: {},
    loadStatus: 0,
    updateStatus: 0
}

// add generate mutation vuex easy access
// https://mesqueeb.github.io/vuex-easy-access/setup.html#setup
const mutations = { ...defaultMutations(state) }

const actions = {
  getUser ({ commit }) {
      commit('loadStatus', 1);

      const instance = axios.create({
          baseURL: APP_CONFIG.API_URL,
          timeout: 1000,
          headers: {'Authorization': 'Bearer ' + window.localStorage.getItem(location.host + '_accesstoken')}
        });

    return new Promise((resolve, reject) => {
      instance.get('/auth/getUser')
        .then((response) => {
          commit('loadStatus', 2)

          resolve(response)
        })
        .catch(reject)
    })
  },
}

export default {
  state,
  mutations,
  actions
}
