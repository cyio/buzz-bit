<template>
  <div class="item">
    <div class="attrs">
      <div class="username">{{ buzz.userName }}</div>
      <div class="time">{{ buzz.timestamp | formatTime }}</div>
      <div class="link-wrap">
        <a class="tx-link" :href="getTxUrl(buzz.txId)" target="_blank">tx</a>
        <a class="tx-link" :href="getShowBuzzUrl(buzz.txId)" target="_blank">showbuzz</a>
      </div>
      <div class="comment">评论[{{buzz.comment.length}}]</div>
      <div class="likes">喜欢[{{buzz.like.length}}]</div>
      <div class="likes">转发[{{buzz.rePost.length}}]</div>
    </div>
    <div class="content" v-html="displayContent(buzz.content)">
      <!-- {{ displayContent(buzz.content) }} -->
    </div>
    <div class="imgs">
      <div class="img-item" v-for="(metafile, index) in buzz.attachments" :key="index">
        <img
          :src="getImageUrl(metafile)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import AppConfig from '@/config/metasv-buzz'
import { formatTime } from '@/utils/index';

export default Vue.extend({
  name: "BuzzItem",
  props: {
    buzz: Object
  },
  data() {
    return {
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
.item {
  text-align: left;
  margin: 15px 0;
  border: 1px solid #d0c9c9;;
  padding: 10px 5px;
  max-height: 160px;
  overflow: hidden;
  .content {
    word-wrap: break-word;
  }
  .attrs {
    display: flex;
    justify-content: space-between;
    color: #909399;
    font-size: 12px;
    margin-bottom: 10px;
    a {
      color: inherit;
    }
    .tx-link {
      padding: 0 5px;
    }
  }
  .imgs {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    .img-item {
      width: 130px;
      margin-right: 8px;
    }
    img { 
      width: 100%;
    }
  }
}
</style>
