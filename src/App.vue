<template>
  <div id="app">
    <div class="nav">
      <h3>BuzzBit</h3>
      <div class="links">
        <router-link to="/">首页</router-link> |
        <router-link to="/about">关于</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<style lang="stylus" scoped>
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  margin-top 10px

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 15px;
}
</style>
