import Immutable from 'immutable'
import cookie from 'react-cookie'

export const getInitialLang = () => Immutable.fromJS({
  locale: cookie.load('btcchina_lang') || 'zh'
})
