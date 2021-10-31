<template>
  <div class="item-container">
    <div class="item-head">
      <div class="left">
        <div class="avatar"></div>
        <div class="userinfo">
          <div class="username">{{ buzz.userName }}</div>
          <div class="attrs">
            <div class="time">{{ buzz.timestamp | formatTime }}</div>
          </div>
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
        />
      </div>
    </div>
    <div class="item-bottom">
      <div class="left"></div>
      <div class="right">
        <div class="item likes">转发[{{buzz.rePost.length}}]</div>
        <div class="item comment">评论[{{buzz.comment.length}}]</div>
        <div class="item likes">喜欢[{{buzz.like.length}}]</div>
        <div class="item donate">打赏[{{buzz.donate.length}}]</div>
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
      .attrs {
        color: #909399;
        font-size: 12px;
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
}
</style>
