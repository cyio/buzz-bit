function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const isProd = process.env.NODE_ENV !== 'development'

function addZero(value) {
  if (value > 9) {
    return value
  }
  return `0${value}`
}

function formatTime(time) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = addZero(date.getDate())
  const hour = addZero(date.getHours())
  const minute = addZero(date.getMinutes())
  return `${month}-${day} ${hour}:${minute}`
}

const hexToBase64Img = (hexStr, type) => {
  if (!hexStr) {
    return ''
  }
  const a = []
  for (let i = 0, len = hexStr.length; i < len; i += 2) {
    a.push(parseInt(hexStr.substr(i, 2), 16))
  }
  let binary = ''
  const bytes = new Uint8Array(a)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const imgBtoa = window.btoa(binary)
  type = type || 'image/jpeg'
  return 'data:' + type + ';base64,' + imgBtoa
}

/**
 * localStorage 存取 Object 封装
 * setItem 支持传入过期时间（分钟）
 * 带过期时间存储 {"data":{"a":1},"timestamp":1547536618350}
 * 获取时如果没过期会取出 data，否则返回 false
 */
 const Storage = {
  setItem(key, value, expirationMin) {
    if (expirationMin) {
      const expirationMS = expirationMin * 60 * 1000;
      const record = {
        data: value,
        timestamp: new Date().getTime() + expirationMS,
      };
      return localStorage.setItem(key, JSON.stringify(record));
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return localStorage.setItem(key, value);
  },

  getObj(key) {
    const record = JSON.parse(localStorage.getItem(key));
    if (!record) {
      return null;
    }
    // if (record.timestamp) {
    //   // 过期返回false, 没有过期返回数据
    //   return new Date().getTime() < record.timestamp && record.data;
    // }
    return record;
  },

  getItem(key) {
    const record = localStorage.getItem(key)
    return record || null
  },
};

function getUrlParameterByName(name, url) {
  if (!url) url = window.location.href;
  // name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function isSupportPDF() {
  var hasPDFViewer = false;
  try {
    var pdf =
      navigator.mimeTypes &&
        navigator.mimeTypes["application/pdf"]
        ? navigator.mimeTypes["application/pdf"].enabledPlugin
        : 0;
    if (pdf) hasPDFViewer = true;
  } catch (e) {
    if (navigator.mimeTypes["application/pdf"] != undefined)
      hasPDFViewer = true;
  }

  return hasPDFViewer;
}


function isMobile(){
  const isMobile = (/iphone|ipod|android|ie|blackberry|fennec/).test
       (navigator.userAgent.toLowerCase());
  return isMobile;
}

const shared = {
  isZh: /zh/.test(window.navigator.language || window.navigator.userLanguage),
}

function getExtension(str = '') {
  let arr = str.split('.')
  if (arr.length <= 1) return ''
  let ans = arr[arr.length - 1]
  return ans.toLowerCase()
}

const sliceFile = (fileBlob, chunkSize = 1024) => {
  let chunks = []
  const chunksAmount = Math.ceil(fileBlob.size / chunkSize)

  for (let i = 0; i < chunksAmount; i += 1) {
     const start = chunkSize * i
     const end = chunkSize * (i + 1)

     const chunk = fileBlob.slice(start, end, fileBlob.type)
     chunks.push(chunk)
  }

  return chunks
}

const hexStringToImageByte = function(t) {
  if (!t)
    return "https://showjob.oss-cn-hangzhou.aliyuncs.com/index/img_photo_default.png";
  for (var e = [], a = 0, o = t.length; a < o; a += 2)
    e.push(parseInt(t.substr(a, 2), 16));
  for (var s = "", n = new Uint8Array(e), i = n.byteLength, r = 0; r < i; r++)
    s += String.fromCharCode(n[r]);
  var c = window.btoa(s)
    , l = "image/jpeg";
  return "data:" + l + ";base64," + c
}

function hasChinese (str) {
  const reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
  return reg.test(str)
}

const proxy = 'https://qcbor7.api.cloudendpoint.cn/image-proxy?url='
const useProxy = 0
function assetUrl(url) {
  return useProxy ? proxy + url : url
}

function random(lower, higher) {
  return lower + Math.floor(Math.random() * (higher - lower + 1)) // 左闭右闭
}


export {
  formatBytes,
  isProd,
  formatTime,
  Storage,
  getUrlParameterByName,
  hexToBase64Img,
  isSupportPDF,
  isMobile,
  shared,
  getExtension,
  sliceFile,
  hasChinese,
  assetUrl,
  random
}