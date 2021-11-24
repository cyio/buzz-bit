import { convertRawText } from '@/utils/convert';

export default {
  created: function () {
    // this.hello()
  },
  methods: {
    displayContent(content = '', isBrief = false) {
      // content = this.handleHashTags(content)
      let val = content
      if (isBrief) {
        val = content?.length > 140 ? content?.substring(0, 140) + '...<span class="more">全文</span>' : content
      }
      // console.log(content)
      let res = convertRawText(val)
      // console.log(res)
      return res
    }
  },
  filters: {
  }
}