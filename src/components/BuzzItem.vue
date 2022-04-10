<template>
  <div v-if="mode === 'list' && isInBlackList" class="blacklist-wrap">已屏蔽用户内容</div>
  <div v-else class="buzz-item" :class="['mode-' + mode, isOriginal ? 'is-original' : '']">
    <div class="item-left">
      <buzz-side :avatarTxId="buzz.avatarTxId" :userTxId="buzz.metaId" />
    </div>
    <div class="item-main" @click="goDetail">
      <buzz-header :buzz="buzz" />
      <div v-if="mode === 'list' && buzz.encrypt === '1'">加密内容，进入查看</div>
      <template v-else>
        <van-loading v-show="loading">解密中</van-loading>
        <template v-if="!loading">
          <div class="note-content" v-if="buzz.protocol === 'metanote'">发布了笔记
            <a :href="`https://www.metanote.app/detail/${buzz.txId}`" target="_blank">《{{buzz.content || '无题'}}》</a>
          </div>
          <div class="content" v-else v-html="displayContent(buzzContent, mode === 'list')"></div>
          <div class="paid-wrap" v-if="buzz.metaAccessTxId">
            付费 buzz，请前往 showbuzz 查看
            <!-- <div class="paid-content">
              {{buzz.paidContent}}
            </div> -->
          </div>
        </template>
      </template>
      <div class="media">
        <div class="media-item" v-for="(metafile, index) in buzz.attachments" :key="index">
          <file-decode v-if="isShareFile(buzz, metafile)" :txId="buzz.attachments[0] | parseTxId"
            class="share-file"
            :mode="mode"
          />
          <template v-else-if="isVideo(metafile)">
            <div class="" v-if="mode === 'list' && !showVideoInFlow">
                <van-icon name="video-o" size="25" color="var(--theme-color)" />
            </div>
            <video
              v-else
              controls
              preload="metadata"
              :src="metafile | parseVideoUrl"
            />
          </template>
          <template v-else-if="isAudio(metafile)">
            <div class="" v-if="mode === 'list' && !showVideoInFlow">
                <van-icon name="video-o" size="25" color="var(--theme-color)" />
            </div>
            <audio
              v-else
              controls
              preload="metadata"
              :src="metafile | parseVideoUrl"
            />
          </template>
          <img
            v-else-if="isImg(metafile)"
            :src="getAssetUrl(metafile)"
            @click.stop="handlePreviewImg(buzz.attachments, index)"
            loading="lazy"
          />
          <div v-else>
            <a :href="dLink(metafile)" download>下载</a>
          </div>
        </div>
      </div>
      <div class="trans-wrap" v-if="showTranslateBtn">
        <van-loading v-if="isInTranslate && !translatedContent"></van-loading>
        <div class="translate" v-else @click.stop="toggleTranslate(buzz.content)">{{isInTranslate ? t('btn.translateOri') : t('btn.translate')}}</div>
      </div>
      <buzz-footer
        v-if="showFooter && buzz.txId && mode !== 'reply'"
        :buzz="buzz"
        v-on="$listeners"
      />
    </div>
    <van-image-preview
      v-model="show"
      :images="images" 
      :start-position="index"
      @change="onChange" closeable
      :swipeDuration="100"
    >
      <template v-slot:index>
        <div class="img-custom" v-show="images.length > 1">
          <div class="img-nums">{{ index + 1 }}/{{images.length}}</div>
          <div class="switch-btns" v-if="!$isMobile">
            <div class="btn prev" :class="{'disabled': index <= 0}" @click="index = Math.max(index - 1, 0)">
              {{index <= 0 ? '' : '上一个'}}
            </div>
            <div class="btn next" :class="{'disabled': index >= images.length - 1}" @click="index = Math.min(index + 1, images.length - 1)">
              {{index >= images.length - 1 ? '' : '下一个'}}
            </div>
          </div>
        </div>
      </template>
    </van-image-preview>
    <!-- <cool-light-box
      :items="images"
      :index="index"
      @close="index = null"
      closeOnClickOutsideMobile
      enableWheelEvent
    ></cool-light-box> -->
  </div>
</template>

<script>
import Vue from "vue";
import AppConfig from '@/config/'
import BuzzHeader from './BuzzPart/BuzzHeader.vue'
import BuzzSide from './BuzzPart/BuzzAvatar.vue'
import BuzzFooter from './BuzzPart/BuzzFooter.vue'
import FileDecode from '@/components/FileDecode'
import mixin from './BuzzPart/mixin'
import { mapState } from 'vuex'
import { useI18n } from 'vue-i18n-composable/src/index'
import SDKInit from '@/utils/sdk';
import { hexToBase64Img, assetUrl, getExtension } from '@/utils/'
// import CoolLightBox from 'vue-cool-lightbox'
// import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import { ImagePreview } from 'vant';
import { getImageMetaFile } from '@/api/buzz.ts'
// import {md5} from 'pure-md5';

function imgFix(str) {
  str = str.split('.')
  const last = str[str.length - 1]
  return /webp|jpg|jpeg|gif|png/.test(last) ? str.slice(0, -1) : str
}
function isImg(str) {
  const ext = getExtension(str);
  let ans = ext === '' || /webp|jpg|jpeg|png|gif/.test(ext);
  return ans
}
export default Vue.extend({
  name: "buzz-item",
  mixins: [mixin],
  components: {
    BuzzHeader,
    BuzzSide,
    BuzzFooter,
    FileDecode,
    // CoolLightBox,
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  props: {
    buzz: Object,
    showFooter: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: 'detail'
    },
    isOriginal: {
      type: Boolean,
      default: false
    },
    // classList: {
    //   type: Array,
    //   default: () => ([])
    // }
  },
  data() {
    return {
      show: false,
      index: 0,
      // index: null,
      images: [],
      loading: false,
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    isImg: isImg,
    dLink(str) {
      str = str.replace('metafile://', '')
      return `https://filecdn.showpay.top/metaChunkFile/original/${str}`
    },
    getAssetUrl(src) {
      if (src.startsWith('data:image/')) {
        return src
      }
      const srcArray = src.split('://')
      if (!srcArray[1]) {
        // 无效输入
        return ''
      }
      let fileId = imgFix(srcArray[1])
      let url = src
      if (srcArray[0] === 'metafile') {
        url = fileId && fileId !== '' ? `${AppConfig.metaFileServiceUrl}/metafile/${fileId.join('.')}` : null
      } else if (srcArray[0] === 'sensible') {
        url = fileId && fileId !== '' ? `${AppConfig.metaFileServiceUrl}/metafile/sensible/${fileId.join('.')}` : null
      }
      return assetUrl(url)
    },
    handleHashTags(val) {
      const html = val.replace(/#([\u4e00-\u9fa5_\w-]+)#/g, '<a href="' + this.$router.options.base + 'list?tag=$1">$&</a> ')
      return html
    },
    handlePreviewImg(arr, index) {
      const images = arr.map(i => this.getAssetUrl(i))
      this.images = images
      this.index = index
      this.show = !this.show
    },
    onChange(index) {
      this.index = index
    },
    isShareFile(buzz, metafile) {
      return buzz.content.includes('#分享文件') && !metafile.endsWith('.mp4')
    },
    goDetail() {
      if (this.mode === 'list' || (this.mode === 'detail' && this.isOriginal)) {
        this.$router.push({ path: `/detail/${this.buzz.txId}` })
        if (this.buzz.comment) {
          localStorage.setItem('buzz', JSON.stringify(this.buzz))
        }
      }
    },
    handleAttachments(attachments) {
      this.buzz.attachments = this.buzz.attachments || []
      // this.buzz.attachments = ret.attachments
      // 1. 请求图片数据
      // 2. 解密
      console.log('handleAttachments', attachments)
      if (attachments && attachments.length) {
        const txIds = attachments.map(item => {
          const srcArray = item.split('://')
          let fileId = imgFix(srcArray[1])
          console.log(fileId)
          return fileId[0]
        })
        console.log(txIds)
        getImageMetaFile({
          txIds
        }).then(res => {
          console.log('img meta: ', res)
          if (res.code === 0) {
            res.data.results.items.forEach(i => {
              const config = {
                accessToken: this.accessToken,
                data: i.data,
                callback: (res) => {
                  // this.loading = false
                  console.log('img de: ', res)
                  if ((res.code === 200 && res.data?.data) || this.$isInShowApp) {
                    const raw = this.$isInShowApp ? res : res.data.data
                    console.log('img raw: ', raw)
                    const base64 = hexToBase64Img(raw, i.dataType)
                    console.log('img push: ', base64)
                    this.buzz.attachments.push(base64)
                  }
                }
              }
              window.__metaIdJs.eciesDecryptData_(config, true);
            })
          }
        })
      }
    },
    isAudio(str) {
      let s =  /mp3|ogg|aac|wav/.test(getExtension(str));
      return s
    },
    isVideo(str) {
      let s =  /mp4|webm/.test(getExtension(str));
      return s
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      showVideoInFlow: 'showVideoInFlow',
      isSDKLoaded: 'isSDKLoaded',
      accessToken: 'accessToken'
    }),
    avatarUrl() {
      return `${this.$AppConfig.metaFileServiceUrl}/metafile/avatar/${this.buzz.avatarTxId}?timestamp=${+new Date()}`
    },
    isInBlackList() {
      const socialList = this.user.socialList
      let value = false
      if (socialList) {
        value = socialList.blackList.includes(this.buzz.metaId)
      }
      return value
    },
  },
  filters: {
    parseVideoUrl(t) {
      const base = `${AppConfig.metaFileServiceUrl}/metafile/`
      // const base = 'https://metafile.id/download/'
      return t ? base.concat(t.replace("metafile://", "")) : ""
    },
    parseTxId(str) {
      let arr = str.split('/')
      return arr[arr.length - 1]
    }
  },
  async created() {
    // const self = this
    if (this.buzz.encrypt === '1' && this.mode !== 'list') {
      // console.log(this.buzz.data || this.buzz.content)
      this.loading = true
      const config = {
        accessToken: this.accessToken,
        data: this.buzz.data,
        callback: (res) => {
          this.loading = false
          // showapp 返回
          if (res.content) {
            this.buzz.content = res.content
            this.handleAttachments(res.attachments)
            return
          }
          if (res.code === 200) {
            let ret = JSON.parse(res.data.data)
            this.buzz.content = ret.content
            this.handleAttachments(ret.attachments)
          } else {
            console.error('解析异常', res)
          }
        }
      }
      await SDKInit()
      window.__metaIdJs.eciesDecryptData_(config);
    }
    // if (this.buzz.metaAccessTxId) {
    //   const {
    //     metaAccessMetanetId,
    //     metaAccessPayTx,
    //     serverCode,
    //     serverPublicKey,
    //     txId
    //   } = this.buzz
    //   const params = {
    //     metaAccessMetanetID: metaAccessMetanetId,
    //     metaAccessPayTx,
    //     metaId: this.user.metaId,
    //     serverCode: md5(serverCode),
    //     serverPublicKey,
    //     txId
    //   }
    //   getMetaAccessContent(params)
    // }
  }
});
</script>

<style scoped lang="scss">
.buzz-item {
  text-align: left;
  border-top: 1px solid #eae7e7;
  padding: 10px 8px;
  overflow: hidden;
  display: flex;
  &.mode-list, &.is-original {
    :hover {
      cursor: pointer;
      // background-color: #f7f7f7;
    }
    .media {
      max-height: 200px;
      overflow: hidden;
    }
  }
  &.mode-reply {
    border-bottom: 1px solid #eae7e7;
  }
  &.is-original {
    border-top: none;
  }
  .content {
    word-wrap: break-word;
  }
  .sub-text {
    color: #909399;
    font-size: 12px;
  }
  .media {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    .media-item {
      margin-right: 8px;
      // max-height: 281.25px;
      overflow: hidden;
    }
    img { 
      width: 130px;
      min-height: 90px;
      min-width: 130px;
      background-color: #eee;
    }
    video {
      height: 210px;
      max-width: 100%;
      min-width: 290px;
    }
  }
  .switch-btns {
    width: 98vw;
    display: flex;
    justify-content: space-between;
    margin-top: 42vh;
    .btn {
      cursor: pointer;
      background: rgba(128, 128, 128, 0.6);
      padding: 4px 6px;
      border-radius: 4px;
      &.disabled {
        color: gray;
      }
    }
  }
  img {
    width: 100%;
    // margin-top: 10px;
  }
  .item-main {
    margin-left: 12px;
    width: 100%;
    overflow: hidden;
  }
  .item-left {
    width: 40px;
  }
}
.blacklist-wrap {
  height: 30px;
  text-align: center;
  font-size: 14px;
  color: #706d6d;
  line-height: 30px;
}
.paid-wrap {
  padding: 10px;
  font-size: 12px;
  color: var(--theme-color);
}
.translate {
  font-size: 12px;
  color: #565454;
  width: 30px;
  padding: 2px 4px;
  cursor: pointer;
}
</style>
