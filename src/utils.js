import { Message, Notification } from 'element-ui'
const Decimal = require('decimal.js')

function showMessage(message, type) {
  Message({
    message: message,
    type: type
  })
}

function checkValueInRange(min, max, value) {
  const minValue = new Decimal(min)
  const maxValue = new Decimal(max)
  const decimalValue = new Decimal(value)
  return decimalValue.gte(minValue) && decimalValue.lte(maxValue)
}

function getCurrentDateWithoutSeparator() {
  const currentDate = new Date()
  
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  
  const formattedDate = `${year}${month}${day}`
  
  return formattedDate
}

function showNotification(message, type) {
  Notification({
    title: '通知',
    message: message,
    type: type,
    showClose: false,
    offset: 50
  })
}

export {
  showMessage, 
  checkValueInRange, 
  getCurrentDateWithoutSeparator,
  showNotification
}
