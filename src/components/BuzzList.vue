<template>
  <div class="wrap">
    <buzz-item
      v-for="(buzz, index) in buzzListData" 
      :buzz="buzz"
      :key="buzz.txId + index"
    />
  </div>
</template>

<script>
import Vue from "vue";
import BuzzItem from "./BuzzItem";

export default Vue.extend({
  name: "BuzzList",
  props: {
    buzzListData: Array
  },
  components: {
    BuzzItem
  },
  data() {
    return {
      // buzzListData: []
    };
  },
});
</script>

<style scoped lang="stylus">
.wrap {
  min-height: 300px;
}
</style>
