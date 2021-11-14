export const queryHexFromWOC = async txId => {
  let url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txId}/out/0/hex`  // index 不一定是 0，怎么判断？
  let res = await fetch(url)
  let hex = await res.text()
  return hex
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
