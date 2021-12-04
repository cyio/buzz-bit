<template>
  <div class="item-footer">
    <!-- <div class="left"></div> -->
    <div class="right" v-if="buzz.comment">
      <div class="item comment" @click.stop="showCommentBox = true;doType = 'comment'">
        <!-- {{t('post.comment')}} -->
        <inline-svg :src="require('@/assets/icons/comment.svg')"/>
        <div class="num">{{buzz.comment.length}}</div>
      </div>
      <div class="item forward" @click.stop="showCommentBox = true;doType = 'forward'">
        <inline-svg :src="require('@/assets/icons/forward.svg')"/>
        <div class="num">{{buzz.rePost.length}}</div>
      </div>
      <div class="item like" @click.stop="doHandle('doLike')">
        <inline-svg :src="require('@/assets/icons/like.svg')"/>
        <div class="num">{{buzz.like.length}}</div>
      </div>
      <div class="item donate" @click.stop="showTipsPopup = true">
        <inline-svg :src="require('@/assets/icons/bitcoin2.svg')"/>
        <div class="num">{{buzz.donate.length}}</div>
      </div>
    </div>
    <!-- 搜索页数据不一致 -->
    <div class="right" v-else>
      <div class="item forward" @click.stop="showCommentBox = true;doType = 'forward'">{{t('post.forward')}}</div>
      <div class="item comment" @click.stop="showCommentBox = true;doType = 'comment'">{{t('post.comment')}}</div>
    </div>
    <van-popup
      v-model="showCommentBox"
      closeable
      :duration="0"
      class="forward-popup"
      @click.stop=""
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
              <van-field
                v-model="content"
                rows="2"
                autosize
                label=""
                type="textarea"
                :placeholder="t('post.inputPlaceholder')"
                clearable
                @keydown="handleCmdEnter($event)"
              />
              <!-- <div class="word-count">{{content.length || ''}}</div> -->
            </div>
          </div>
          <!-- <div class="forward-buzz">
            <buzz-item
              v-if="showCommentBox"
              :buzz="buzz"
              :show-footer="false"
              :show-relation="false"
            />
          </div> -->
        </div>
        <div class="card-footer">
          <van-button color="var(--theme-color)"
            @click="send" size="small"
            class="send"
          >
            <van-icon name="guide-o" size="25" />
          </van-button>
        </div>
      </div>
    </van-popup>
    <van-popup
      v-model="showTipsPopup"
      closeable
      :duration="0"
      class="tips-popup"
      @click.stop=""
    >
      <buzz-tips @amount-selected="handleAmountSelected" />
    </van-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useI18n } from 'vue-i18n-composable/src/index'
import { Popup, Field } from 'vant';
import BuzzTips from '@/components/BuzzPart/BuzzTips.vue'

export default ({
  name: "BuzzFooter",
  props: {
    buzz: Object
  },
  components: {
    [Popup.name]: Popup,
    [Field.name]: Field,
    BuzzTips
  },
  data() {
    return {
      showCommentBox: false,
      showTipsPopup: false,
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
    doHandle(func, ...rest) {
      if (this.isSDKLoaded) {
        this[func](...rest)
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
    handleAmountSelected(amount) {
      this.showTipsPopup = false
      this.doHandle('doDonate', amount)
    },
    doDonate(amount) {
      const accessToken = window.localStorage.getItem('access_token')
      const config = {
        nodeName: "SimpleArticleDonate",
        metaIdTag: "MetaId",
        brfcId: "5c7afdb85de5",
        accessToken: accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo: [
          { amount, address: this.buzz.zeroAddress },
          { amount: amount * 0.1, address: this.$chargeAddress.tipsFee },
        ],
        dataType: 'applicaition/json',
        path: "/Protocols/SimpleArticleDonate",
        data: JSON.stringify({
          createTime: +new Date(),
          amount: "" + amount,
          recipientAddress: this.buzz.zeroAddress,
          recipientID: this.buzz.metaId,
          targetID: this.buzz.txId,
          // message: "hi" // showapp 消息目前不支持
        }),
        callback: (res) => {
          if (res.code === 200) {
            this.buzz.donate.push({})
            this.$toast('发送成功！');
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
      this.$emit('sent')
    },
    handleCmdEnter(e) {
      if (e && (e.metaKey || e.ctrlKey) && e.keyCode == 13) {
        this.send()
      }
    },
    send() {
      this.doType === 'forward' ? this.doHandle('doForward') : this.doHandle('doComment')
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
  margin-top: 5px;
  a {
    color: inherit;
  }
  .right {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  .item  {
    margin-right: 6px;
    display: flex;
    align-items: center;
    padding: 6px;
    transition-duration: 0.2s;
    transition-property: background-color, box-shadow;
    svg {
      width: 19px;
      margin-right: 10px;
    }
    &:hover {
      background-color: rgb(198 130 48 / 20%);
      border-radius: 30px;
    }
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
  .van-field {
    border: 1px solid #e4e0e0;
    border-radius: 6px;
    margin-bottom: 16px;
  }
}
</style>