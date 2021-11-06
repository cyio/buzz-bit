<template>
  <div class="preview" v-if="url">
    <video
      v-if="type === 'video/mp4'"
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
  },
  computed: {
  }
});
</script>

<style scoped lang="stylus">
.preview {
  height: 100%;
}
video {
  max-height: 100%;
}
</style>
