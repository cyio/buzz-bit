// var SHA256 = require("crypto-js/sha256"); // 返回的不是字串
// import sha256 from "fast-sha256";
// const { createHash } = require('crypto');
// How to generate a SHA-256 hash with JavaScript - remarkablemark - Medium https://remarkablemark.medium.com/how-to-generate-a-sha-256-hash-with-javascript-d3b2696382fd
import {createHash} from 'crypto'

function sha256(string) {
  return createHash('sha256').update(string).digest('hex');
}

const spec1 = {
  title: 'Test2021',
  author: 'Oaker',
  version: '1.0.0'
}

function createBrfcId(spec) {
  // Test2021Oaker1.0.0
  let str = spec.title.trim() +
  (spec.author || '').trim() +
  (spec.version || '').trim()

  let hash = sha256(str);

  // console.log(sha256('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')

  console.log(str, hash)

  let bitcoinDisplayHash = hash
    .split('').reverse().join('')
    // .toString('hex');

  console.log('display: ', bitcoinDisplayHash)

  // let hex = Buffer.from(bitcoinDisplayHash, 'utf8').toString('hex');

  // console.log('hex: ', hex)

  let brfcId = bitcoinDisplayHash.substring(0, 12);

  console.log('brfcId: ', brfcId)

  return brfcId
}

const test1 = {
  title: 'BRFC Specifications',
  author: 'andy (nChain)',
  version: '1'
}

// 57dd1f54fc67
createBrfcId(spec1)