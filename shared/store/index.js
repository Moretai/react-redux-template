import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import { createLogger } from 'redux-logger'
import rootReducer from 'reducers'

export default function configure (initialState) {
  const create = (typeof window !== 'undefined' && window.devToolsExtension)
    ? window.devToolsExtension()(createStore)
    : createStore

  const sagaMiddleware = createSagaMiddleware()
  const createStoreWithMiddleware = applyMiddleware(sagaMiddleware, createLogger())(create)
  const store = createStoreWithMiddleware(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(require('../reducers').default)
    })
  }

  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  return store
}
