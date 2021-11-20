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

export {
  formatBytes,
  isProd,
  formatTime,
  Storage,
  getUrlParameterByName,
  hexToBase64Img,
  isSupportPDF,
  isMobile
}