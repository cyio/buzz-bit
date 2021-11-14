function convertImgs(input) {
  const dogefiles = /(https?:\/\/)dogefiles.twetch\S*/g;
  const common = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  const rules = []
  rules.push(dogefiles, common)
  let res = input
  for (let rule of rules) {
    res = res.replace(rule, (t) => {
      if (t.includes('sinaimg.cn')) {
        t = 'https://cnbeta.leanapp.cn/api/image?url=' + t
      }
      return `<img src="${t}" style="width: 100%" />`
    })
  }
  return res
}



function convertRawText(text) {
  // 以空格开头
  const href = /[\s|：|:](https?:\/\/\S*)/g;
  text = convertImgs(text)
  return text
    .replace(href, (e, t) => `<a target="_blank" href="${t}">${t}</a>`)
    .replace(/(?:\r\n|\r|\n|\\n)/g, '<br />')
}

export {
  convertRawText
}