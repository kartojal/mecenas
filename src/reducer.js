import { combineReducers } from 'redux'
import { drizzleReducers } from 'drizzle'

const reducer = combineReducers({
  ...drizzleReducers
})

export default reducer
