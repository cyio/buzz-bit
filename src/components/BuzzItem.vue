<template>
  <div class="item">
    <div class="time">
      {{ buzz.timestamp | formatTime }}
    </div>
    <div class="content">
      {{ buzz.content }}
    </div>
    <div class="imgs">
      <div class="img-item" v-for="(metafile, index) in buzz.attachments" :key="index">
        <img
          :src="getImageUrl(metafile)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import AppConfig from '@/config/metasv-buzz'
import { formatTime } from '@/utils/index';

export default Vue.extend({
  name: "BuzzItem",
  props: {
    buzz: Object
  },
  data() {
    return {
    };
  },
  methods: {
    getImageUrl(src) {
      const srcArray = src.split('://')
      const fileId = srcArray[1]
      let url = src
      if (srcArray[0] === 'metafile') {
        url = fileId && fileId !== '' ? `${AppConfig.metaFileServiceUrl}/metafile/${fileId}` : null
      }
      return url
    }
  },
  filters: {
    formatTime(time) {
      return formatTime(time)
    }
  }
});
</script>

<style scoped lang="stylus">
.item {
  text-align: left;
  margin: 15px;
  border: 1px solid #d0c9c9;;
  padding: 10px 5px;
  .time {
    color: #909399;
    font-size: 12px;
    margin-bottom: 10px;
  }
  .imgs {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    .img-item {
      width: 130px;
      margin-right: 8px;
    }
    img { 
      width: 100%;
    }
  }
}
</style>
