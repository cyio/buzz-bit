<template>
  <div class="buzz-detail">
    <!-- 主内容 -->
    <template v-if="buzz.protocol">
      <quote-item
        v-if="buzz.protocol.toLowerCase() === 'simplerepost'"
        :buzz="buzz"
      />
      <buzz-item
        v-else
        :buzz="buzz"
        @sent="onSent"
      />
    </template>
    <!-- 评论 -->
    <div class="title">
      <div class="left">评论：</div>
      <div class="right">
        <van-button color="var(--theme-color)" size="small" @click="showBatchTips = !showBatchTips">{{showBatchTips ? '收起批量打赏': '批量打赏'}}</van-button>
      </div>
    </div>
    <div class="batch-tips-wrap" v-if="showBatchTips">
      <div class="batch-title">批量打赏(BSV)</div>
      <div class="batch-body">
        <div class="total">
          <span class="label">评论用户数：</span>{{uniqCurBuzzListData.length}}</div>
        <van-field
          v-model="perTipNum"
          rows="2"
          autosize
          label="每位用户:"
          type="number"
          class="batch-tip-input"
          :placeholder="t('post.batchTipPlaceholder')"
        />
        <!-- <div class="unit">BSV</div> -->
        <van-button color="var(--theme-color)" @click="batchTipSend" size="small"
          :disabled='!isSDKLoaded || isSending' class="batch-tip-send-btn"
          :loading="!isSDKLoaded || isSending"
        >
          <van-icon name="guide-o" size="25" />
        </van-button>
      </div>
    </div>
    <van-loading v-show="curBuzzListData.loading" color="var(--theme-color)" class="loading" />
    <div v-show="!loading">
      <buzz-list v-if="curBuzzListData.length" :buzzListData="curBuzzListData" class="comment-wrap" />
      <div v-else class="no-comment">暂无评论</div>
    </div>
  </div>
</template>

<script>
import BuzzItem from "@/components/BuzzItem";
import FileDecode from '@/components/FileDecode'
import BuzzList from "@/components/BuzzList.vue";
import { getInteractiveBuzzList } from '@/api/buzz.ts'
import QuoteItem from "./QuoteItem";
import { mapState } from 'vuex'
import { Field } from 'vant'
import { useI18n } from 'vue-i18n-composable/src/index'
import { uniqBy } from 'lodash'

export default ({
  name: "BuzzDetail",
  props: {
    buzz: Object
  },
  components: {
    FileDecode,
    BuzzItem,
    QuoteItem,
    BuzzList,
    [Field.name]: Field,
  },
  data() {
    return {
      loading: false,
      curListType: 'comment',
      buzzListData: {
        comment: {
          data: [],
          loading: false
        }
      },
      perTipNum: 0.0001,
      isSending: false,
      showBatchTips: false
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    getInteractiveBuzzList(txId) {
      const params = {
        Protocols: ['PayComment'],
        buzzTxId: txId,
        // metaId: this.user.metaId,
        page: '1',
        pageSize: '500',
        timestamp: 0
      }
      this.buzzListData[this.curListType].loading = true
      getInteractiveBuzzList(params).then(res => {
        this.buzzListData[this.curListType].loading = false
        const { code, data } = res
        if (code === 0) {
          const items = data.results?.items || []
          this.$set(this.buzzListData[this.curListType], 'data', items)
          // 是否存在回复
          this.getReply(items)
        }
      })
    },
    getReply(items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.hasComment) {
          const params = {
            Protocols: ['PayComment'],
            buzzTxId: item.txId,
            page: '1',
            pageSize: '500',
            timestamp: 0
          }
          getInteractiveBuzzList(params).then(res => {
            const { code, data } = res
            if (code === 0) {
              this.$set(this.buzzListData[this.curListType].data[i], 'replyList_', data.results?.items || [])
            }
          })
        }
      }
    },
    onSent() {
      setTimeout(() => {
        this.getInteractiveBuzzList(this.buzz.txId)
      }, 300)
    },
    batchTipSend() {
      const _perTipNumSat = this.perTipNum * (10 ** 8)
      let appFee = this.uniqCurBuzzListData.length * _perTipNumSat * 0.1
      const payTo = this.uniqCurBuzzListData.map(item => ({
        address: item.zeroAddress,
        amount: _perTipNumSat
      }))
      // const payTo = uniqBy(oriPayTo, 'address')
      payTo.push({
        address: this.$chargeAddress.tipsFee,
        amount: appFee
      })
      // const data = this.curBuzzListData.map(item => ({
      //     createTime: +new Date(),
      //     amount: _perTipNumSat,
      //     recipientAddress: item.zeroAddress,
      //     recipientID: item.metaId,
      //     targetID: this.buzz.txId,
      // }))
      const data = {
        createTime: +new Date(),
        amount: _perTipNumSat,
        targetID: this.buzz.txId,
      }

      this.doDonate(payTo, data)
    },
    doDonate(payTo, data) {
      const accessToken = window.localStorage.getItem('access_token')
      const config = {
        nodeName: "SimpleArticleDonate",
        metaIdTag: "metaid",
        brfcId: "5c7afdb85de5",
        accessToken: accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo,
        dataType: 'applicaition/json',
        path: "/Protocols/SimpleArticleDonate",
        data: JSON.stringify(data),
        callback: (res) => {
          this.isSending = false
          this.$toast.clear()
          if (res.code === 200) {
            this.buzz.donate.push({})
            this.$toast('发送成功！');
          } else {
            new Error(res.data.message);
          }
        },
        onCancel: () => {
          this.isSending = false
          this.$toast.clear()
        }
      }
      console.log(config)
      this.isSending = true
      window.__metaIdJs.addProtocolNode_(config);
    },
  },
  computed: {
    ...mapState({
      isSDKLoaded: 'isSDKLoaded',
    }),
    curBuzzListData() {
      return this.buzzListData[this.curListType].data
    },
    uniqCurBuzzListData() {
      return uniqBy(this.curBuzzListData, 'zeroAddress')
    }
  },
  created() {
    this.getInteractiveBuzzList(this.buzz.txId)
  }
});
</script>

<style scoped lang="scss">
.buzz-detail {
  .comment-wrap {
    margin-left: 24px;
  }
  .no-comment {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    color: gray;
  }
  .title {
    display: flex;
    justify-content: space-between;
    padding-left: 60px;
    margin: 10px 0;
  }
  .batch-tips-wrap {
    margin: 20px 0 20px 60px;
    border: 1px dashed;
    padding: 10px;
    font-size: 14px;
    .batch-title {
      font-size: 12px;
      color: #646566;
    }
    .batch-body {
      .label {
        color: #646566;
      }
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .batch-tip-input {
      width: 240px;
    }
    .batch-tip-send-btn {
        width: 60px;
    }
  }
}
</style>
