import { convertRawText } from '@/utils/index';

export default {
  created: function () {
    // this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    },
    displayContent(content = '', isBrief = false) {
      // content = this.handleHashTags(content)
      let val = content
      if (isBrief) {
        val = content?.length > 140 ? content?.substring(0, 140) + '...<span class="more">全文</span>' : content
      }
      return convertRawText(val)
    }
  },
  filters: {
  }
}