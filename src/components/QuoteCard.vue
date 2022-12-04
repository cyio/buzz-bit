<template>
    <!-- https://codepen.io/jimmycow/pen/LmjVaz -->
    <blockquote class="otro-blockquote" v-if="selectTweet.content">
      <div class="content">{{selectTweet.content}}</div>
      <div class="author">{{selectTweet.author}}</div>
    </blockquote>
</template>

<script>
// import tweetsData from '@/api/tweets.json'
import { random } from '@/utils/'
import { getQuotes } from '@/api/index'

export default ({
  name: "BuzzAvatar",
  props: {
  },
  components: {
  },
  data() {
    return {
      selectTweet: {}
    };
  },
  methods: {
  },
  computed: {
  },
  created() {
    if (!this.$isDev) {
      getQuotes().then(res => {
        const list = res.list
        const selectIndex = random(0, res.list.length - 1)
        this.selectTweet = list[selectIndex]
      })
    }
  }
});
</script>

<style scoped lang="scss">
  .otro-blockquote{
    font-size: 1.1em;
    margin:50px auto;
    color: var(--theme-color);
    padding: 1.2em 20px 1.2em 45px;
    border-left:8px solid;
    line-height:1.6;
    position: relative;
    background:#EDEDED;
    text-align: left;
  }

  .otro-blockquote::before{
    font-family:Arial;
    content: "\201C";
    // color:#78C0A8;
    font-size:4em;
    position: absolute;
    left: 10px;
    top:-10px;
  }

  .otro-blockquote::after{
    content: '';
  }

  .otro-blockquote .content {
    color:#333333;
    font-weight: bold;
  }

  .otro-blockquote .author {
    color: #454545;
    font-style: normal;
    margin-top:1em;
  }
</style>