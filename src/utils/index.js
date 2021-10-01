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
