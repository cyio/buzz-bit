# buzz-bit

一个支持 metaid/SimpleMicroblog 的 PWA 应用 [BuzzBit](https://buzzbit.vercel.app/)

## 主要特性

- 常规功能：信息流、评论、转发、搜索
- 节省图片上链费用（默认压缩成 webp，平均节省 30%-50% 费用）
- metafile 交易解码
- 上传支持各种文件类型

前置条件：
1. 到 showmoney 获取 clientId、clientSecret
2. `cp private-config.template.json private-config.json`，填入第 1 步拿到的信息

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

