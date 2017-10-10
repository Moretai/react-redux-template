import App from 'containers/App'

export const errorLoading = err => console.error('Dynamic page loading failed', err)

const loadRoute = cb => (module) => {
  cb(null, module.default)
}

const loadIndexRoute = cb => (module) => {
  cb(null, { component: module.default })
}

const routes = {
  component: App,
  childRoutes: [
    {
      path: '/',
      getIndexRoute (location, cb) {
        import('containers/App/Home')
          .then(loadRoute(cb))
          .catch(errorLoading)
      }
    },
    {
      path: '/user',
      getIndexRoute (location, cb) {
        import('containers/App/User')
          .then(loadIndexRoute(cb))
          .catch(errorLoading)
      },
    },
    {
      path: '/about',
      getIndexRoute (location, cb) {
        import('containers/App/About')
          .then(loadIndexRoute(cb))
          .catch(errorLoading)
      },
    }
  ]
}

export default routes
