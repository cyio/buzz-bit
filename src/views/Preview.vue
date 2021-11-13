<template>
  <div class="pub-list">
    <file-decode v-if="txId" :txId="txId" />
  </div>
</template>

<script>
import FileDecode from '@/components/FileDecode.vue'

export default ({
  name: "Preview",
  components: {
    FileDecode
  },
  data() {
    return {
      txId: ''
    };
  },
  methods: {
  },
  computed: {
  },
  created() {
    console.log(this.$route)
    this.txId = this.$route.params.txId
  }
});
</script>

<style scoped lang="scss">
.pub-list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
