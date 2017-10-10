import { handleActions } from 'redux-actions'
import Immutable from 'immutable'
import * as actions from 'actions/hello'

const initialState = Immutable.fromJS({
  data: "",
  loading: false,
  loaded: false,
  error: null
})

export default handleActions({
  [actions.sayHello] (state, action) {
    return state.set('loaded', false).set('data', action.payload)
  }
}, initialState)
