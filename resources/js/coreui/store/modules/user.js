import { defaultMutations } from 'vuex-easy-access'
import { APP_CONFIG } from '../../../config.js'
import UserAPI from '../../api/user.js'

const state = {
  user: {},
  userLoadStatus: 0,
  userUpdateStatus: 0
}

// add generate mutation vuex easy access
// https://mesqueeb.github.io/vuex-easy-access/setup.html#setup
const mutations = { ...defaultMutations(state) }

const getters = {
  getUser: state => () => state.user
}

const actions = {
  getUser ({ commit }) {
    commit('userLoadStatus', 1)

    UserAPI.getUser()
    .then((response) => {
      commit('userLoadStatus', 2)
      commit('user', response.data.data)
    })
    .catch( function( e ) {
      if (e.request && e.request.status && e.request.status == 401) {
        // Load done
        commit('userLoadStatus', 2)
      } else {
        // Load failed
        commit('userLoadStatus', 3)
      }
      commit('user', {})
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
