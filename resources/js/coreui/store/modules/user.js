import { defaultMutations } from 'vuex-easy-access'
import { APP_CONFIG } from '../../../config.js'
import UserAPI from '../../api/user.js'

const state = {
  get: {},
  loadStatus: 0,
  updateStatus: 0
}

// add generate mutation vuex easy access
// https://mesqueeb.github.io/vuex-easy-access/setup.html#setup
const mutations = { ...defaultMutations(state) }

const getters = {
  getUser: state => () => state.get
}

const actions = {
  getUser ({ commit }) {
    commit('loadStatus', 1)

    UserAPI.getUser()
    .then((response) => {
      commit('loadStatus', 2)
      commit('get', response.data.data)
    })
    .catch( function( e ) {
      if (e.request && e.request.status && e.request.status == 401) {
        // Load done
        commit('loadStatus', 2)
      } else {
        // Load failed
        commit('loadStatus', 3)
      }
      commit('get', {})
    })

    const instance = axios.create({
      baseURL: APP_CONFIG.API_URL,
      timeout: 1000,
      headers: {'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')}
    })
  },
}

export default {
  state,
  mutations,
  actions,
  getters
}
