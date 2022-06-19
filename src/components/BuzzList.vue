<template>
  <div class="list-wrap" :class="['mode-' + mode]">
    <div
      v-for="(buzz, index) in buzzListData"
      :key="buzz.txId + index"
    > 
      <quote-item
        v-if="buzz.protocol && buzz.protocol.toLowerCase() === 'simplerepost'"
        :buzz="buzz"
        mode="list"
      />
      <buzz-item v-else :buzz="buzz" :mode="mode" />
      <div class="reply-list" v-if="buzz.replyList_ && buzz.replyList_.length">
        <buzz-list :buzzListData="buzz.replyList_" class="comment-wrap" mode="reply" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import BuzzItem from "./BuzzItem";
import QuoteItem from "./QuoteItem";

export default Vue.extend({
  name: "BuzzList",
  props: {
    buzzListData: Array,
    mode: {
      type: String,
      default: 'list'
    }
  },
  components: {
    BuzzItem,
    QuoteItem,
    BuzzList: () => import('@/components/BuzzList')
  },
  data() {
    return {
    };
  },
});
</script>

<style scoped lang="scss">
.list-wrap {
  // min-height: calc(100vh - 300px);
  border: 1px solid #eae7e7;
  border-top: 0;
  border-bottom: 0;
  .reply-list {
    margin-left: 60px;
  }
  &.mode-reply {
    min-height: initial;
  }
}
</style>
