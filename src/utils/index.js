import dayjs from 'dayjs';

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const isProd = process.env.NODE_ENV !== 'development'

function addZero(value) {
  if (value > 9) {
    return value
  }
  return `0${value}`
}

export function formatTime(time) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = addZero(date.getDate())
  const hour = addZero(date.getHours())
  const minute = addZero(date.getMinutes())
  return `${month}-${day} ${hour}:${minute}`
}

export function convertRawText(text) {
  const e = /(https?:\/\/)\S*/g;
  return text
    .replace(e, (t, e) => '<a target="_blank" href='.concat(t, ">").concat(t, "</a>"))
    .replace(/(?:\r\n|\r|\n|\\n)/g, '<br />')
}

export const hexToBase64Img = (hexStr, type) => {
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