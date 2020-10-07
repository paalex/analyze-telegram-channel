import express from "express";
import { run as runTelegram } from "./services/telegramService";
import {config as dotenv_config} from "dotenv"
import {getPhonesFromMsg} from "./helpers/extractionHelper"
import _ from 'lodash'
import messages from './outputs/messages.json';
import fs from "fs"
dotenv_config()

// runTelegram().catch(e => console.log('init err', e));

// const allMessagesWithNumbers = _.map(messages.messages, m => ({
//   ...m, phones: getPhonesFromMsg(m)
// }))
//
// const onlyMessagesWithNumbers = _.filter(allMessagesWithNumbers, m => m.phones.length > 0)
// const onlyNumbers = _.flatten(_.map(onlyMessagesWithNumbers, m => m.phones))
// fs.writeFileSync("outputs/messages_with_numbers.json", JSON.stringify(onlyMessagesWithNumbers, null, 2))
// fs.writeFileSync("outputs/numbers_only.json", JSON.stringify(onlyNumbers, null, 2))
// console.log('done')


