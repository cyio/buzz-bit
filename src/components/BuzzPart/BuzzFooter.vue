<template>
  <div class="item-footer">
    <div class="left"></div>
    <div class="right" v-if="buzz.comment">
      <div class="item forward" @click.stop="showCommentBox = true;doType = 'forward'">{{t('post.forward')}}[{{buzz.rePost.length}}]</div>
      <div class="item comment" @click.stop="showCommentBox = true;doType = 'comment'">{{t('post.comment')}}[{{buzz.comment.length}}]</div>
      <div class="item like" @click.stop="doHandle('doLike')">{{t('post.like')}}[{{buzz.like.length}}]</div>
      <div class="item donate">{{t('post.tip')}}[{{buzz.donate.length}}]</div>
    </div>
    <!-- 搜索页数据不一致 -->
    <div class="right" v-else>
      <div class="item forward" @click.stop="showCommentBox = true;doType = 'forward'">{{t('post.forward')}}</div>
      <div class="item comment" @click.stop="showCommentBox = true;doType = 'comment'">{{t('post.comment')}}</div>
    </div>
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
import { mapState } from 'vuex'
import { useI18n } from 'vue-i18n-composable/src/index'
import { Popup } from 'vant';

export default ({
  name: "BuzzHeader",
  props: {
    buzz: Object
  },
  components: {
    [Popup.name]: Popup,
  },
  data() {
    return {
      showCommentBox: false,
      content: '',
      doType: 'forward'
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    doForward() {
      const config = {
        nodeName: 'SimpleRePost',
        metaIdTag: "metaid",
        brfcId: "9e73d8935669",
        accessToken: this.accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo: [
          { amount: 1000, address: '18H4SRi4nh9yg6Tr8M24CTtsveqzmFmJxM' },
          { amount: 500, address: this.buzz.zeroAddress },
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
      const config = {
        nodeName: 'PayComment',
        metaIdTag: "metaid",
        brfcId: 'ff515b313d27',
        accessToken: this.accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo: [
          { amount: 1000, address: '18H4SRi4nh9yg6Tr8M24CTtsveqzmFmJxM' },
          { amount: 500, address: this.buzz.zeroAddress },
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
          payTo: this.buzz.zeroAddress,
          likeTo: this.buzz.txId
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
    formatTime(time) {
      const useTimeago = (new Date()) - time < 86400000
      return useTimeago ? timeagoFormat(time, shared.isZh ? 'zh_CN' : 'en_US') : formatTime(time)
    }
  }
});
</script>

<style scoped lang="scss" scoped>
.item-footer {
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
}
</style>