<template>
  <div class="item-container">
    <div class="item-head">
      <div class="left">
        <div class="avatar"></div>
        <div class="userinfo">
          <div class="username">{{ buzz.userName || buzz.name}}</div>
          <div class="time">{{ buzz.timestamp | formatTime }}</div>
        </div>
      </div>
      <div class="right">
        <a class="tx-link" :href="getTxUrl(buzz.txId)" target="_blank">tx</a>
        <a class="tx-link" :href="getShowBuzzUrl(buzz.txId)" target="_blank">showbuzz</a>
      </div>
    </div>
    <div class="content" v-html="displayContent(buzz.content)">
      <!-- {{ displayContent(buzz.content) }} -->
    </div>
    <div class="imgs">
      <div class="img-item" v-for="(metafile, index) in buzz.attachments" :key="index">
        <img
          :src="getImageUrl(metafile)"
          @click="handlePreviewImg(buzz.attachments, index)"
        />
      </div>
    </div>
    <div class="item-bottom">
      <div class="left"></div>
      <div class="right" v-if="buzz.comment">
        <div class="item likes">转发[{{buzz.rePost.length}}]</div>
        <div class="item comment">评论[{{buzz.comment.length}}]</div>
        <div class="item likes">喜欢[{{buzz.like.length}}]</div>
        <div class="item donate">打赏[{{buzz.donate.length}}]</div>
      </div>
    </div>
    <van-image-preview v-model="show" :images="images" 
      :start-position="index"
      @change="onChange" closeable
    >
      <template v-slot:index>
        <div class="img-custom" v-show="images.length > 1">
          <div class="img-nums">{{ index + 1 }}/{{images.length}}</div>
          <div class="switch-btns">
            <div class="left" @click="index = Math.max(index - 1, 0)">上一个</div>
            <div class="left" @click="index = Math.min(index + 1, images.length - 1)">下一个</div>
          </div>
        </div>
      </template>
    </van-image-preview>
  </div>
</template>

<script>
import Vue from "vue";
import AppConfig from '@/config/metasv-buzz'
import { formatTime } from '@/utils/index';
import { ImagePreview } from 'vant';

export default Vue.extend({
  name: "BuzzItem",
  components: {
    [ImagePreview.Component.name]: ImagePreview.Component,
  },
  props: {
    buzz: Object
  },
  data() {
    return {
      show: false,
      index: 0,
      images: [],
    };
  },
  methods: {
    getImageUrl(src) {
      const srcArray = src.split('://')
      const fileId = srcArray[1]
      let url = src
      if (srcArray[0] === 'metafile') {
        url = fileId && fileId !== '' ? `${AppConfig.metaFileServiceUrl}/metafile/${fileId}` : null
      }
      return url
    },
    getTxUrl(txId) {
      return 'https://whatsonchain.com/tx/' + txId
    },
    getShowBuzzUrl(txId) {
      return 'https://www.showbuzz.app/details/' + txId
    },
    displayContent(content = '') {
      content = this.handleHashTags(content)
      return content.replace(/(?:\r\n|\r|\n|\\n)/g, '<br />')
    },
    handleHashTags(val) {
      const html = val.replace(/#([\u4e00-\u9fa5_\w-]+)#/g, '<a href="' + this.$router.options.base + 'list?tag=$1">$&</a> ')
      return html
    },
    handlePreviewImg(arr, index) {
      const images =  arr.map(i => this.getImageUrl(i))
      this.images = images
      this.index = index
      this.show = !this.show
    },
    onChange(index) {
      this.index = index
    }
  },
  filters: {
    formatTime(time) {
      return formatTime(time)
    }
  }
});
</script>

<style scoped lang="stylus">
.item-container {
  text-align: left;
  margin: 15px 0;
  border: 1px solid #d0c9c9;;
  padding: 10px 5px;
  // max-height: 160px;
  overflow: hidden;
  .content {
    word-wrap: break-word;
  }
  .item-head {
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    .userinfo {
      display: flex;
      align-items: center;
      .time {
        color: #909399;
        font-size: 12px;
        margin-left 6px;
      }
    }
    .tx-link {
      padding: 0 5px;
      color: #909399;
      font-size: 12px;
    }
  }
  .sub-text {
    color: #909399;
    font-size: 12px;
  }
  .item-bottom {
    display: flex;
    justify-content: space-between;
    color: #666667;
    font-size: 12px;
    display: flex;
    a {
      color: inherit;
    }
    .right {
      display: flex;
    }
    .item  {
      margin-right: 6px;
    }
  }
  .imgs {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    .img-item {
      width: 130px;
      margin-right: 8px;
      max-height: 281.25px;
      overflow: hidden;
    }
    img { 
      width: 100%;
    }
  }
  .switch-btns {
    width: 98vw;
    display: flex;
    justify-content: space-between;
    margin-top: 42vh;
  }
}
</style>
