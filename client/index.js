/* @jsx */

import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { match, Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { ReduxAsyncConnect } from 'redux-connect'
import Transit from 'transit-immutable-js'
import Provider from 'components/Provider'
import routes, { errorLoading } from 'routes'
import configure from 'store'
import sagas from 'sagas'

const preloadedState = window.__PRELOADED_STATE__ && Transit.fromJSON(window.__PRELOADED_STATE__)
const store = configure(preloadedState)
const history = syncHistoryWithStore(browserHistory, store)
const { pathname, search, hash } = window.location
const location = `${pathname}${search}${hash}`

store.runSaga(sagas)

const renderApp = (routesConfig) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Router
          onUpdate={() => window.scrollTo(0, 0)}
          render={props => <ReduxAsyncConnect {...props} />}
          history={history}
          routes={routesConfig}
        />
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  )
}

async function runApp() {
  try {
    if (!window.Intl) {
      await import('intl')
      await Promise.all([
        import('intl/locale-data/jsonp/en.js'),
        import('intl/locale-data/jsonp/zh.js')
      ])
      console.log('using intl polyfill')
    }
  } catch (error) {
    errorLoading(error)
  }

  match({ routes, location }, () => {
    renderApp(routes)
  })
}

if (module.hot) {
  module.hot.accept()
}

runApp()
