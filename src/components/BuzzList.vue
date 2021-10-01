<template>
  <div class="wrap">
    <div v-for="(buzz, index) in buzzListData" :key="buzz.txId + index">
      <buzz-item
        :buzz="buzz"
      />
    </div>
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
</style>
