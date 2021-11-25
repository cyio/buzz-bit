<template>
  <div class="item-container" :class="['mode-' + mode]">
    <div class="item-inner" @click="goDetail">
      <buzz-header :buzz="buzz" />
      <div v-if="mode === 'list' && buzz.encrypt === '1'">私密内容，进入查看</div>
      <template v-else>
        <van-loading v-show="loading">解密中</van-loading>
        <div class="content" v-if="!loading" v-html="displayContent(buzz.content, mode === 'list')"></div>
      </template>
      <div class="media">
        <div class="media-item" v-for="(metafile, index) in buzz.attachments" :key="index">
          <file-decode v-if="isShareFile(buzz)" :txId="buzz.attachments[0] | parseTxId"
            class="share-file"
            :mode="mode"
          />
          <template v-else-if="metafile.endsWith('.mp4')">
            <div class="" v-if="mode === 'list' && !showVideoInFlow">视频</div>
            <video
              v-else
              controls
              :src="metafile | parseVideoUrl"
            />
          </template>
          <img
            v-else
            :src="getAssetUrl(metafile)"
            @click.stop="handlePreviewImg(buzz.attachments, index)"
            loading="lazy"
          />
        </div>
      </div>
      <buzz-footer :buzz="buzz" v-if="showFooter && buzz.txId" />
    </div>
    <van-image-preview v-model="show" :images="images" 
      :start-position="index"
      @change="onChange" closeable
      swipeDuration="100"
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
    <!-- :overlay="false" -->
  </div>
</template>

<script>
import Vue from "vue";
import AppConfig from '@/config/'
import { ImagePreview } from 'vant';
import BuzzHeader from './BuzzPart/BuzzHeader.vue'
import BuzzFooter from './BuzzPart/BuzzFooter.vue'
import FileDecode from '@/components/FileDecode'
import mixin from './BuzzPart/mixin'
import { mapState } from 'vuex'
import { useI18n } from 'vue-i18n-composable/src/index'
import SDKInit from '@/utils/sdk';

function imgFix(str) {
  str = str.split('.')
  const last = str[str.length - 1]
  return /webp|jpg|jpeg|git/.test(last) ? str.slice(0, -1) : str
}

export default Vue.extend({
  name: "BuzzItem",
  mixins: [mixin],
  components: {
    [ImagePreview.Component.name]: ImagePreview.Component,
    BuzzHeader,
    BuzzFooter,
    FileDecode
  },
  props: {
    buzz: Object,
    showFooter: {
      type: Boolean,
      default: true
    },
    mode: String
  },
  data() {
    return {
      show: false,
      index: 0,
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
    getAssetUrl(src) {
      const srcArray = src.split('://')
      let fileId = imgFix(srcArray[1])
      let url = src
      if (srcArray[0] === 'metafile') {
        url = fileId && fileId !== '' ? `${AppConfig.metaFileServiceUrl}/metafile/${fileId}` : null
      }
      return url
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
    isShareFile(buzz) {
      return buzz.content.includes('#分享文件')
    },
    goDetail() {
      if (this.mode === 'list') {
        this.$router.push({ path: `/detail/${this.buzz.txId}` })
        if (this.buzz.comment) {
          localStorage.setItem('buzz', JSON.stringify(this.buzz))
        }
      }
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      showVideoInFlow: 'showVideoInFlow',
      isSDKLoaded: 'isSDKLoaded',
      accessToken: 'accessToken'
    }),
  },
  filters: {
    parseVideoUrl: function(t) {
      return t ? "https://metafile.id/download/".concat(t.replace("metafile://", "")) : ""
    },
    parseTxId(str) {
      let arr = str.split('/')
      return arr[arr.length - 1]
    }
  },
  async created() {
    const self = this
    if (this.buzz.encrypt === '1' && this.mode !== 'list') {
      // console.log(this.buzz.data || this.buzz.content)
      this.loading = true
      const config = {
        accessToken: this.accessToken,
        data: this.buzz.data,
        callback: (res) => {
          self.loading = false
          if (res.code === 200) {
            let ret = JSON.parse(res.data.data)
            self.buzz.content = ret.content
          } else {
            console.error('解析异常', res)
          }
        }
      }
      await SDKInit()
      window.__metaIdJs.eciesDecryptData(config);
    }
  }
});
</script>

<style scoped lang="scss">
.item-container {
  text-align: left;
  border-top: 1px solid #eae7e7;
  padding: 10px 8px;
  overflow: hidden;
  &.mode-list:hover {
    cursor: pointer;
    background-color: #f7f7f7;
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
      // width: 100%;
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
      &.disabled {
        color: gray;
      }
    }
  }
  img {
    width: 100%;
    // margin-top: 10px;
  }
}
</style>
