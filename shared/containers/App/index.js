import React, { Component } from 'react'
import { IntlProvider } from 'react-intl'
import cookie from 'react-cookie'
import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import style from './style.css'

export default class App extends Component {

  render () {
    return (
      <IntlProvider locale="en">
        <div className={style.wrap}>
          App
          {this.props.children}
        </div>
      </IntlProvider>
    )
  }
}
