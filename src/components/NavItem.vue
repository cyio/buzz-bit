<template>
  <div class="nav-item">
    <van-icon :name="iconName" size="24" :color="color" />
  </div>
</template>

<script>
export default ({
  name: "NavItem",
  props: {
    name: String,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  components: {
  },
  data() {
    return {
      map: {
        'User': 'wap-home-o',
        'PubList': 'fire-o',
        'Search': 'search',
        'Setting': 'setting-o',
        "bsv123": 'location-o'
      }
    };
  },
  methods: {
  },
  computed: {
    color() {
      return this.isActive ? 'var(--theme-deeper-color)' : 'var(--theme-color)'
    },
    iconName() {
      const str = this.map[this.name]
      if (this.isActive) {
        return this.name !== 'Search' ? str.slice(0, str.length - 2) : str
      }
      return str
    }
  },
  filters: {
  }
});
</script>

<style scoped lang="scss">
</style>