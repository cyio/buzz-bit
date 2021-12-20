import { convertRawText } from '@/utils/convert';
import { queryTranslate } from '@/api/buzz.ts'
import { hasChinese } from '@/utils/'

export default {
  data() {
    return {
      isInTranslate: false,
      translatedContent: '',
    }
  },
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
    },
    toggleTranslate(str) {
      if (this.isInTranslate) {
        this.isInTranslate = false
      } else {
        this.isInTranslate = true
        this.translate(str)
      }
    },
    translate(str) {
      const params = {
        query: str,
        to: hasChinese(str) ? 'en' : 'zh'
      }
      queryTranslate(params).then(res => {
        if (res.code === 0) {
          this.translatedContent = res.result.transResult
        }
      })
    }
  },
  computed: {
    showTranslateBtn() {
      let ret = false
      let content = this.buzz.content || this.buzz.publicContent
      if (!content) return ret
      let hasC = hasChinese(content)
      if (this.$shared.isZh && !hasC) {
        ret = true
      } else if (!this.$shared.isZh && hasC) {
        ret = true
      }
      return ret
    },
    buzzContent() {
      let str = this.buzz.content || this.buzz.publicContent
      if (this.isInTranslate) {
        if (this.translatedContent) {
          str = this.translatedContent
        }
      }
      return str
    }
  }
}