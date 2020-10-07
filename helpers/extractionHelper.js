import {findPhoneNumbersInText} from 'libphonenumber-js'
import _ from 'lodash'

export function getPhonesFromMsg(message) {
 const phoneNumbers = findPhoneNumbersInText(message.message)
 const numbers = _.map(phoneNumbers, n => n.number.number)
 // if (numbers.length === 0) {
 //  console.log('message.message without phone',message.message)
 // }
 return numbers
}
