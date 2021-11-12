<template>
  <div class="pub-list">
    <buzz-list-container />
  </div>
</template>

<script>
import BuzzListContainer from "@/components/BuzzListContainer.vue";

export default ({
  name: "PubList",
  components: {
    BuzzListContainer
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

<style lang="scss" scoped>
.pub-list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
