import { fork } from 'redux-saga/effects'
import helloSage from './hello'

const sagas = [
  fork(helloSage)
]

export default function* rootSaga () {
  yield sagas
}
