import {queryHex} from '@/api/'

const proxy = 'https://vercel-server-bit.vercel.app/api/proxy/image?url='

function convertImgs(input) {
  const dogefiles = /(https?:\/\/)dogefiles.twetch\S*/g;
  const common = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  const rules = []
  rules.push(dogefiles, common)
  let res = input
  for (let rule of rules) {
    res = res.replace(rule, (t) => {
      if (t.includes('sinaimg.cn')) {
        t = `${proxy}${t}`
        return t
      }
      return getImgTag(t)
    })
  }
  return res
}

function convertRawText(text) {
  const href = /https?:\/\/\S*/g;
  let oriUrl = '';
  return text
    .replace(href, (t) => {
      const dogefiles = /(https?:\/\/)dogefiles.twetch\S*/g;
      const common = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;    
      if (common.test(t)) {
        oriUrl = t
        if (t.includes('sinaimg.cn')) {
          t = `${proxy}${t}`
          // return t
        }
        return getProxyImgTag(t, oriUrl)
      }
      if (dogefiles.test(t)) {
        return getImgTag(t)
      }
      return `<a target="_blank" href="${t}">${t}</a>`
    })
    .replace(/(?:\r\n|\r|\n|\\n)/g, '<br />')
}

// 不要使用等待图片方式降级，可以在 img 上挂事件，出错后，替换为 alt
function getProxyImgTag(url) {
  // const res = await fetch(url)
  // if (res.ok) {
  //   return getImgTag(url)
  // }
  return getImgTag(url)
}

function getImgTag(url, alt) {
  return `<img src="${url}" style="width: 100%; margin-top: 10px;" alt="${alt}" loading="lazy" />`
}

async function getHexByTxId(txId, apiService) {
  if (txId.includes('.')) {
    txId = txId.split('.')[0]
  }
  let hex = await queryHex[apiService](txId)
  // show 文件服务不即时 error: "Has no this node"，降级转用其他服务
  if (apiService === 'showMANDB' && hex.length < 80) {
    // 有多个 output，woc 支持选择，选择哪个一个？这里按 index 依次尝试
    hex = await queryHex['whatsonchain'](txId)
    if (hex.length < 80) {
      hex = await queryHex['whatsonchain'](txId, 1)
      if (hex.length < 80) {
        hex = await queryHex['whatsonchain'](txId, 2)
      }
    }
  }
  return hex
}

function parseHighlight(str) {
  let tmp = ''
  try {
    if (str.includes('SimpleMicroblog-')) {
      let arr = str.split(' ')
      tmp = arr[arr.length - 1]
      if (!tmp.endsWith('\"\}')) {
        tmp += '\"\}'
      }
    } else {
      return
    }
    return JSON.parse(tmp)
  } catch (err) {
    console.error(err)
  }
}

export {
  convertRawText,
  getHexByTxId,
  parseHighlight,
}