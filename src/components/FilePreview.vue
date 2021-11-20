<template>
  <div class="preview" v-if="url">
    <template v-if="type === 'application/pdf'">
      <iframe :src="url" frameborder="0" v-if="isSupportPDF()"></iframe>
      <a class="link" :href="url" target="_blank" v-else>下载文件</a>
    </template>
    <video
      v-else-if="type === 'video/mp4'"
      controls
      :src="url"
    />
    <audio
      v-else-if="type.includes('audio')"
      controls
      :src="url"
    />
    <img
      v-else-if="type.includes('image')"
      :src="url"
    />
  </div>
</template>

<script>
import { isSupportPDF } from '@/utils/'

export default ({
  name: "FilePreview",
  props: {
    url: String,
    type: String
  },
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
    isSupportPDF
  },
  computed: {
  }
});
</script>

<style scoped lang="scss">
.preview {
  height: 100%;
  img {
    width: 100%;
  }
  video {
    max-height: 100%;
  }
  iframe {
    width: 100%;
    min-height: 1000px;
    position: absolute;
    max-width: 1200px;
    transform: translateX(-15%);
  }
  .link {
    margin-top: 16px;
  }
}

</style>
