<template>
  <div class="wrap">
    <div
      v-for="(buzz, index) in buzzListData"
      :key="buzz.txId + index"
    >
      <quote-item
        v-if="buzz.protocol.toLowerCase() === 'simplerepost'"
        :buzz="buzz"
      />
      <buzz-item v-else :buzz="buzz" />
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
    buzzListData: Array
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

<style scoped lang="stylus">
.wrap {
  min-height: 300px;
}
</style>
