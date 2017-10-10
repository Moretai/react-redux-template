import fetch from 'isomorphic-fetch'
import cookie from 'react-cookie'
import { GATEWAY_API_URL } from 'constants/env'

export const fetchBase = (method = 'GET', endPoint = '/hello', params = {}, customeHeaders = {}) => {
  let url = GATEWAY_API_URL + endPoint
  const token = cookie.load('dae_crm_t') ? `Bearer ${cookie.load('dae_crm_t')}` : null

  const headers = Object.assign({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: token
  }, customeHeaders)

  const options = { method, headers }

  if (method === 'GET') {
    const queryString = `?${Object.keys(params).map(k => [k, params[k]].map(encodeURIComponent).join('=')).join('&')}`
    url += queryString
  } else if (method === 'POST' || method === 'PUT') {
    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      options.body = `${Object.keys(params).map(k => [k, params[k]].join('=')).join('&')}`
    } else if (headers['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type']
      const formData = new FormData()
      Object.keys(params).forEach(key => formData.append(key, params[key]))
      options.body = formData
    } else {
      options.body = JSON.stringify(params)
    }
  }

  console.warn(options.body)
  console.warn('request url is', url)

  return fetch(url, options).then((res) => {
    if (!res.ok) {
      return res.json().then(e => Promise.reject({ message: e.error }))
    }

    const contentType = res.headers.get('content-type')

    if (/json/.test(contentType)) {
      return res.json().then((values) => {
        console.warn(values)
        return values
      })
    }

    return null
  })
}
