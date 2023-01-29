import { Script } from 'bsv'
import { hexToUtf8 } from '@/utils/index'
import { getHexByTxId } from '@/utils/convert'

export const queryHexFromWOC = async (txId, index = 0) => {
  let url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txId}/out/${index}/hex`  // index 不一定是 0，怎么判断？
  let res = await fetch(url)
  let hex = await res.text()
  return hex
}

// https://api.whatsonchain.com/v1/bsv/main/tx/hash/2d571ea27fc1340e329e6f98612bfe6ca853423bef1117496a75a4ae324853a9

// 
export const queryBuzzFromWOC = async (txId) => {
  let url = `https://api.whatsonchain.com/v1/bsv/main/tx/hash/${txId}`  // index 不一定是 0，怎么判断？
  let res = await fetch(url)
  let json = await res.json()
  let target = json.vout.find(item => item.value === 0 && item.scriptPubKey?.opReturn)
  let ret = null
  try {
    ret = JSON.parse(target.scriptPubKey.opReturn.parts[4])
  } catch (e) {
    console.error(e)
  }
  console.log('buzz', ret, target.scriptPubKey.opReturn)
  return ret
}

export const queryBinaryFromWOC = async (txId) => {
  let url = `https://api.whatsonchain.com/v1/bsv/main/tx/hash/${txId}`  // index 不一定是 0，怎么判断？
  let res = await fetch(url)
  let json = await res.json()
  let target = json.vout.find(item => item.value === 0 && item.scriptPubKey?.opReturn)
  let ret = null
  try {
    ret = target.scriptPubKey.opReturn.parts
  } catch (e) {
    console.error(e)
  }
  console.log('binary', ret, target.scriptPubKey.opReturn)
  return ret
}

export const queryBuzzFromShow = async (txId) => {
  const hex = await getHexByTxId(txId, 'showMANDB')
  let ret = null
  if (hex.length <= 30) {
    console.log('文件未取到')
    return ret
  }
  try {
    let script = new Script().fromHex(hex)
    let asm = script.toAsmString()
    let arr = asm.split(' ')
    let res = arr.map(i => i.length <= 100000 ? i : 'too long')
      .map(i => hexToUtf8(i))
    if (res[6].includes('SimpleMicroblog') || res[6].includes('MetaAccessContent')) {
      ret = JSON.parse(res[7])
    }
  } catch (e) {
    console.error(e)
  }
  return ret
}

export const queryHexFromShow = async txId => {
  let url = `https://api.showmoney.app/showMANDB/api/v1/metanet/getParts/${txId}`
  let res = await fetch(url)
  let json = await res.json()
  if (json.code === 200) {
    return json.result.raw
  }
  return json.error
}

export const queryHex = {
  'showMANDB': queryHexFromShow,
  'whatsonchain': queryHexFromWOC
}

export const queryBuzz = {
  'showMANDB': queryBuzzFromShow,
  'whatsonchain': queryBuzzFromWOC
}

export const queryBinary = {
  'whatsonchain': queryBinaryFromWOC
}

export const getQuotes = async () => {
  let url = `https://api.oaker.bid/api/bsv/quotes`
  let res = await fetch(url)
  let json = await res.json()
  return json
}