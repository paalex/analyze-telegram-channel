import {config as dotenv_config} from "dotenv"
import { MTProto } from '@mtproto/core';
import update from 'immutability-helper';
import _ from 'lodash'
import * as fastcsv from 'fast-csv';
import fs from 'fs';
const wsCSV = fs.createWriteStream("outputs/messages.csv");


dotenv_config()
const {TELEGRAM_API_ID, TELEGRAM_API_HASH, PHONE, PHONE_CODE_HASH, CODE, CHANNEL_ACCESS_HASH, CHANNEL_ID} = process.env;

const mtproto = new MTProto({
  api_id: TELEGRAM_API_ID,
  api_hash: TELEGRAM_API_HASH,
  // test: true
});
mtproto.updateInitConnectionParams({
  app_version: '10.0.0',
});

const defaultOptions = {dcId: 4, syncAuth: true}
export async function run() {
  // #1 - Get PHONE_CODE_HASH, CODE
  // const sendCodeRes = await sendSignInCode({phone_number: PHONE})
  // console.log('sendCodeRes', sendCodeRes)

  // #2 - Sign in
  // const signInRes = await signIn({phone_number: PHONE, phone_code: CODE, phone_code_hash: PHONE_CODE_HASH})
  // console.log('signInRes', signInRes)

  // #3 - Get CHANNEL_ACCESS_HASH, CHANNEL_ID
  // const channelRes = await channelSearch({channelName: 'BlackBookBelarus'})
  // console.log('channelRes:', channelRes);

  // #4 - Get channel messages
  // In a Telegram client right-click on a message and select 'copy message link' to get the message id
  // const startIdx = 1259;
  // const endIdx = 1774;
  // const messages = await getAllChannelMessages({startIdx, endIdx})
  //   .catch(e => console.log('err in getAllChannelMessages', e))
  // let dataToStore = JSON.stringify({messages}, null, 2);
  // // console.log('dataToStore', dataToStore)
  // fs.writeFileSync("outputs/messages.json", dataToStore)
  // console.log('done')
  // fastcsv
  //   .write(messages, { headers: true })
  //   .pipe(ws);
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAllChannelMessages({startIdx, endIdx}) {
  let messagesArr = []
  const pagination = 200;
  const rangeSize = endIdx - startIdx + 1;
  const pagesAmount = _.ceil( rangeSize / pagination);
  const pages = _.map(new Array(pagesAmount), (p, pIdx) => {
    const pageEnd = (pIdx + 1) * pagination + startIdx - 1;
    return {
      fromIdx: pIdx * pagination + startIdx,
      toIdx: pageEnd >= endIdx ? endIdx : pageEnd}
  })
  await asyncForEach(pages, async (p, idx, arr) => {
    const {fromIdx, toIdx} = p;
    const result = await getMessagesInPage({fromIdx, toIdx})
    if (!result) throw new Error('no result')
    const data = _.map(result.messages, m => update(m, {$unset: ['media', 'to_id', "out","mentioned",
        "media_unread","silent","post","from_scheduled","legacy","edit_hide"]}))
    const filteredMsgs = _.filter(data, m => m._ !== 'messageEmpty' && m.message);
    messagesArr = _.concat(messagesArr, filteredMsgs)
    console.log(`Page ${idx + 1} done, out of ${arr.length} pages`)
    if (idx !== arr.length - 1) await sleep(14000)
  })
  return messagesArr
}

async function getMessagesInPage({fromIdx, toIdx}) {
  const rangeSize = toIdx - fromIdx + 1;
  const messageIds = _.map(new Array(rangeSize), (val, idx) => ({id: fromIdx + idx,  _: 'inputMessageID'}))
  const messagesParams = {
    channel: {channel_id: CHANNEL_ID, access_hash: CHANNEL_ACCESS_HASH, _: 'inputChannel'},
    id: messageIds
  }
  // console.log('messagesParams',messagesParams)
  return mtproto.call('channels.getMessages', messagesParams, defaultOptions).catch(error => {
    // console.log('error', error);
    console.log('error.error_code:', error.error_code);
    console.log('error.error_message:', error.error_message);
  });
}

function channelSearch({channelName}) {
  const channelParams = {
    q: channelName
  }
  return mtproto.call('contacts.search', channelParams, defaultOptions).catch(error => {
    console.log('contacts.search error', error);
    console.log('error.error_message:', error.error_message);
  });
}

function sendSignInCode({phone_number}) {
  return mtproto.call('auth.sendCode', {
    phone_number,
    settings: {
      _: 'codeSettings',
    }
  }, defaultOptions).catch(e => console.log('err sendCode', e))
}

function signIn({phone_code, phone_number, phone_code_hash}) {
  return mtproto.call('auth.signIn', {
    phone_code: CODE,
    phone_number: PHONE,
    phone_code_hash: PHONE_CODE_HASH,
  }, defaultOptions);
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
