import { combineReducers } from 'redux'
import { reducer as reduxAsyncConnect } from 'redux-connect'
import { routerReducer as routing } from 'react-router-redux'
import { reducer as form } from 'redux-form/es/immutable'
import hello from './hello'
import intl from './intl'

export default combineReducers({
  form,
  routing,
  reduxAsyncConnect,
  hello,
  intl
})
