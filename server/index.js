/* @jsx */
/* global __webpack_hash__ */

import path from 'path'
import Express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import SSRCaching from 'electrode-react-ssr-caching'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import cookie from 'react-cookie'
import { match, createMemoryHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect'
import { flushTitle } from 'react-title-component'
import serialize from 'serialize-javascript'
import Transit from 'transit-immutable-js'
import { getInitialLang } from 'selectors/intl'
import { getInitialBalance } from 'selectors/balance'
import Provider from 'components/Provider'
import configure from 'store'
import routes from 'routes'
import sagas from 'sagas'
import cacheConfig from './cacheConfig'

const renderFullPage = (root, title, state) => `
  <!DOCTYPE html>
  <!--[if lt IE 7 ]> <html class="ie6"> <![endif]-->
  <!--[if IE 7 ]>    <html class="ie7"> <![endif]-->
  <!--[if IE 8 ]>    <html class="ie8"> <![endif]-->
  <!--[if IE 9 ]>    <html class="ie9"> <![endif]-->
  <!--[if (gt IE 9)|!(IE)]><!--> <html> <!--<![endif]-->
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">
    <link rel="shortcut icon" href="https://static.btcc.com/assets/favicon.png">
    <link href="/styles/bundle.css?v=${__webpack_hash__}" rel="stylesheet">
  </head>
  <body>
    <div id="app">${root}</div>
    <script>window.__PRELOADED_STATE__ = ${serialize(Transit.toJSON(state), { isJSON: true })}</script>
    <script src="/scripts/vendor.bundle.js?v=${__webpack_hash__}"></script>
    <script src="/scripts/bundle.js?v=${__webpack_hash__}"></script>
  </body>
  </html>
`

const port = 9999
const app = new Express()

app.use(cookieParser())
app.use(compression())
app.use('/fonts', Express.static(path.join(__dirname, '/fonts')))
app.use('/images', Express.static(path.join(__dirname, '/images')))
app.use('/styles', Express.static(path.join(__dirname, '/styles')))
app.use('/scripts', Express.static(path.join(__dirname, '/scripts')))

SSRCaching.enableCaching()
SSRCaching.setCachingConfig(cacheConfig)

app.use((req, res) => {
  cookie.plugToRequest(req, res)
  const memoryHistory = createMemoryHistory(req.url)
  const store = configure({
    intl: getInitialLang(),
    balance: getInitialBalance(),
    ...memoryHistory
  })
  const history = syncHistoryWithStore(memoryHistory, store)

  match({ history, routes, location: req.url },
    (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message)
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search)
      } else if (renderProps) {
        const rootTask = store.runSaga(sagas)
        loadOnServer({ ...renderProps, store }).then(() => {
          store.close()
          rootTask.done.then(() => {
            const html = ReactDOMServer.renderToString(
              <Provider store={store}>
                <ReduxAsyncConnect {...renderProps} />
              </Provider>
            )
            const title = flushTitle()
            const preloadedState = store.getState()
            res.status(200).send(renderFullPage(html, title, preloadedState))
          })
        })
      } else {
        res.redirect('/')
      }
    }
  )
})

console.log(`Listening on port ${port}`)
app.listen(port)
