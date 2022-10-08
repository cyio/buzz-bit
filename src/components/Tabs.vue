<template>
  <div>
    <div class="ui-tabs">
      <div class="tab__item"
        v-for="tabItem in tabOptions"
        :key="tabItem.key"
        :class="{ 'is-active': activeTab === tabItem.key }"
        @click="$emit('click', tabItem.key)"
      >{{tabItem.title}}
        <div class="tab__bottom-bar"></div>
      </div>
    </div>
    <div class="ui-tab__pane">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default ({
  name: "Tabs",
  props: {
    activeTab: String,
    tabOptions: Array
  },
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
    submit() {
      window.open(this.url)
    }
  },
  computed: {
    url() {
      return `https://www.google.com/search?q=site%3Ashowbuzz.app%2Fdetails+${this.keywords}`
    }
  }
});
</script>

<style scoped lang="scss">
$--color-primary: var(--theme-color);

.ui-tabs {
  display: flex;
  background: #fff;
  .tab__item {
    width: 176px;
    height: 56px;
    line-height: 56px;
    font-size: 16px;
    padding: 0 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
    &:first-child::after {
      content: '';
      height: 32px;
      width: 1px;
      background: #F1F2F4;
      position: absolute;
      right: 0;
      top: 12px;
    }
    .tab__bottom-bar {
      width: 64px;
      height: 3px;
      margin-top: -3px;
    }
    &.is-active {
      color: $--color-primary;
      .tab__bottom-bar {
        background: $--color-primary;
      }
    }
  }
}

</style>
