const { MTProto } = require('@mtproto/core');

const {TELEGRAM_API_ID, TELEGRAM_API_HASH} = process.env;
const api_id = TELEGRAM_API_ID;
const api_hash = TELEGRAM_API_HASH;



export function init(expressApp) {
  const mtproto = new MTProto({
    api_id,
    api_hash,
  });

  mtproto.updateInitConnectionParams({
    app_version: '10.0.0',
  });

  mtproto.call('help.getNearestDc').then(result => {
    console.log(`country:`, result.country);
  });
}
