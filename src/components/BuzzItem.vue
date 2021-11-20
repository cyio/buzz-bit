<template>
  <div class="item-container" :class="['mode-' + mode]">
    <div class="item-inner" @click="goDetail">
      <buzz-header :buzz="buzz" />
      <div class="content" v-html="displayContent(buzz.content, mode === 'list')"></div>
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
      <div class="item-bottom" v-if="showFooter">
        <div class="left"></div>
        <div class="right" v-if="buzz.comment">
          <div class="item forward" @click.stop="showCommentBox = true;doType = 'forward'">转发[{{buzz.rePost.length}}]</div>
          <div class="item comment" @click.stop="showCommentBox = true;doType = 'comment'">评论[{{buzz.comment.length}}]</div>
          <div class="item like" @click.stop="doHandle('doLike')">喜欢[{{buzz.like.length}}]</div>
          <div class="item donate">打赏[{{buzz.donate.length}}]</div>
        </div>
        <!-- 搜索页数据不一致 -->
        <div class="right" v-else>
          <div class="item forward" @click="showCommentBox = true;doType = 'forward'">转发</div>
          <div class="item comment" @click="showCommentBox = true;doType = 'comment'">评论</div>
        </div>
      </div>
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
    <van-popup v-model="showCommentBox" closeable
      duration="0"
      class="forward-popup"
    >
      <div class="card forward-card">
        <div class="card-header">
          <h4>{{doType === 'forward' ? '转发' : '评论'}}</h4>
        </div>
        <div class="card-body">
          <div class="forward-form">
            <!-- <avatar :src="hexToBase64Img(userInfo.headUrl)" :size="40" /> -->
            <!-- <avatar :tx="userInfo.avatarTxId" :size="40" /> -->
            <div class="field">
              <textarea v-model="content" placeholder="添加评论" autofocus />
            </div>
          </div>
          <div class="forward-buzz">
            <buzz-item
              v-if="showCommentBox"
              :buzz="buzz"
              :show-footer="false"
              :show-relation="false"
            />
          </div>
        </div>
        <div class="card-footer">
          <van-button color="#1989fa"
            @click="doType === 'forward' ? doHandle('doForward') : doHandle('doComment')" size="small"
            class="send"
          >
            发送
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import Vue from "vue";
import AppConfig from '@/config/'
import { ImagePreview, Popup } from 'vant';
import BuzzHeader from './BuzzPart/BuzzHeader.vue'
import FileDecode from '@/components/FileDecode'
import mixin from './BuzzPart/mixin'
import { mapState } from 'vuex'

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
    [Popup.name]: Popup,
    BuzzHeader,
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
      showCommentBox: false,
      content: '',
      doType: 'forward'
    };
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
    doForward() {
      if (!window.__metaIdJs) {
        this.$toast('请先切到主页登录');
        return
      }
      const accessToken = window.localStorage.getItem('access_token')
      const config = {
        nodeName: 'SimpleRePost',
        metaIdTag: "metaid",
        brfcId: "9e73d8935669",
        accessToken: accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo: [
          { amount: 1000, address: '18H4SRi4nh9yg6Tr8M24CTtsveqzmFmJxM' },
        ],
        dataType: 'applicaition/json',
        path: '/Protocols/SimpleRePost',
        data: JSON.stringify({
          createTime: new Date().getTime(),
          rePostTx: this.buzz.txId,
          rePostProtocol: '', // this.dialogData.nodeName,
          rePostComment: this.content // 评论内容
        }),
        callback: this.handleForward
      }
      console.log(config)
      window.__metaIdJs.addProtocolNode(config);
    },
    doComment() {
      if (!window.__metaIdJs) {
        this.$toast('请先切到主页登录');
        return
      }
      const accessToken = window.localStorage.getItem('access_token')
      const config = {
        nodeName: 'PayComment',
        metaIdTag: "metaid",
        brfcId: 'ff515b313d27',
        accessToken: accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo: [
          { amount: 1000, address: '18H4SRi4nh9yg6Tr8M24CTtsveqzmFmJxM' },
        ],
        dataType: 'applicaition/json',
        path: '/Protocols/PayComment',
        data: JSON.stringify({
          createTime: +new Date(),
          content: this.content, // 评论内容
          contentType: 'text/plain',
          commentTo: this.buzz.txId, // tx
        }),
        callback: this.handleForward
      }
      console.log(config)
      window.__metaIdJs.addProtocolNode(config);
    },
    doHandle(func) {
      if (this.isSDKLoaded) {
        this[func]()
      } else {
        this.$toast('请等待 MetaID框架 加载完成');
      }
    },
    doLike() {
      const accessToken = window.localStorage.getItem('access_token')
      const config = {
        nodeName: 'PayLike',
        metaIdTag: "metaid",
        brfcId: '5c7afdb85de5',
        accessToken: accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo: [
          { amount: 1000, address: this.buzz.zeroAddress },
          { amount: 100, address: this.$chargeAddress.likeFee },
        ],
        dataType: 'applicaition/json',
        path: '/Protocols/PayLike',
        data: JSON.stringify({
          createTime: +new Date(),
          isLike: '1',
          pay: '1000',
          payTo: this.buzz.zeroAddress
        }),
        callback: (res) => {
          if (res.code === 200) {
            this.buzz.like.push({})
          } else {
            new Error(res.data.message);
          }
        }
      }
      console.log(config)
      window.__metaIdJs.addProtocolNode(config);
    },
    handleForward(res) {
      this.content = ''
      this.showCommentBox = false
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
      isSDKLoaded: 'isSDKLoaded'
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
    .forward:hover , .comment:hover, .like:hover {
      cursor: pointer;
      color: var(--theme-color);
    }
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
  .forward-popup {
    padding: 16px;
    min-width: 300px;
    textarea {
      width: 100%;
      border: 1px solid gray;
    }
    .card-footer {
      display: flex;
      justify-content: flex-end;
    }
    .send {
      width: 80px;
    }
  }
  img {
    width: 100%;
    // margin-top: 10px;
  }
}
</style>
