import { getNewNodePath } from '@/api/buzz.ts'
import { Storage } from '@/utils/index';

const newNodePathUtils = {}
// 作用：本地计算 new node path
// 1. init set storage
// 2. 消费后 pop
// 3. 发帖前更新

newNodePathUtils.init = function ({ xpub, parentTxId }) {
  this.xpub = xpub
  this.parentTxId = parentTxId
  this.update()
}

newNodePathUtils.get = async function () {
  const data = await this.checkUpdate()
  console.log('get', data)
  // const data = Storage.getItem('node-path')
  const select = data.shift()
  Storage.setItem('node-path', data)
  console.log({data})
  return select
}

newNodePathUtils.update = async function () {
  const { xpub, parentTxId } = this
  const data = await getNewNodePath({
    xpub,
    parentTxId,
    count: 10
  })
  Storage.setItem('node-path', data, 10)
  return data
}

newNodePathUtils.checkUpdate = async function () {
  // 数据大于 10 min 分钟则更新
  const data = Storage.getObj('node-path')
  // console.log('checkUpdate', data)
  if (data) {
    return data
  }
  const res = await this.update()
  return res
}

export default newNodePathUtils