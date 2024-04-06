<template>
  <div class="avatar" :class="size" @click.stop="goUserDetail">
    <img :src="avatarUrl" v-if="0 && avatarUrl" loading="lazy" />
    <div class="default" v-else></div>
  </div>
</template>

<script>
const time = +new Date()
import { assetUrl } from '@/utils/'

export default ({
  name: "BuzzAvatar",
  props: {
    avatarTxId: String,
    userTxId: String,
    size: String
  },
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
    goUserDetail() {
      const id = this.userTxId
      this.$router.push({ path: `/user/${id}` })
    }
  },
  computed: {
    avatarUrl() {
      const url = `${this.$AppConfig.metaFileServiceUrl}/metafile/avatar/${this.userTxId}?timestamp=${time}`
      return this.userTxId
        ? assetUrl(url)
        : ''
      // return `https://buzz-api.metasv.com/api/metafile/${this.avatarTxId}`
    }
  },
  filters: {
  }
});
</script>

<style scoped lang="scss">
.avatar {
  width: 40px;
  height: 40px;
  background-color: #e6e1e1;
  border-radius: 20%;
  img, .default {
    border-radius: 20%;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &.large {
    width: 64px;
    height: 64px;
  }
}
</style>