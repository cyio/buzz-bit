<template>
  <div class="wrap">
    <div
      v-for="(buzz, index) in buzzListData"
      :key="buzz.txId + index"
    >
      <quote-item
        v-if="buzz.protocol && buzz.protocol.toLowerCase() === 'simplerepost'"
        :buzz="buzz"
        mode="list"
      />
      <buzz-item v-else :buzz="buzz" mode="list" />
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
  },
  components: {
    BuzzItem,
    QuoteItem
  },
  data() {
    return {
    };
  },
});
</script>

<style scoped lang="scss">
.wrap {
  min-height: 300px;
  border: 1px solid #eae7e7;
  border-top: 0;
}
</style>
