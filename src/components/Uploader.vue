<template>
  <div class="wrap">
    <!-- <van-uploader
      v-model="previewImages"
      multiple
      :after-read="res => handleFiles([...res].map(i => i.file))"
    /> -->
    <div v-if="$isMobile" class="mobile-selector" @change="change">
      <input
        type="file"
        class="select-input"
        id="m-file"
        accept="image/*"
        multiple="multiple"
        ref="selectInput"
      />
      <van-icon name="photograph" />
    </div>
    <div
      v-else
      class="select-area"
      @change="change"
      @dragover="dragover"
      @drop="drop"
      @paste="onPaste"
    > 
      <div class="select-btn btn-reverse">
        <label class="text-primary"
          >      
          <van-icon name="photograph" />
          <input
            type="file"
            class="select-input"
            id="file"
            accept="image/*"
            multiple="multiple"
            ref="selectInput"
          />
        </label>
      </div>
      <div class="tips">拖拽或粘贴至此</div>
      <!-- <span> 共 {{previewImages.length}} 个 </span> -->
    </div>
    <div class="options">
      <div class="item">
        <input type="checkbox" id="useOriginal" v-model="useOriginal">
        <label for="useOriginal">{{t('btn.useOriginal')}}</label>
      </div>
      <div class="item">
        <input type="checkbox" id="useOriginalWidth" v-model="useOriginalWidth">
        <label for="useOriginalWidth">{{t('btn.keepWidthAndHeight')}}</label>
      </div>
      <!-- <button class="btn-clear btn-medium" @click="clear" v-show="previewImages.length">清除图片</button> -->
    </div>
    <div class="image-preview">
      <div class="item" v-for="(image, index) in previewImages" :key="index">
        <div class="info" v-if="!$isMobile">
            原图：{{image.input.size|formatSize}} 压缩后：{{image.output.size|formatSize}} 压缩率：{{(image.output.size/image.input.size)|formatPercent}}</div>
        <div class="img-wrap">
          <img :src="image.url" :alt="image.input.name" />
          <button @click="removeImg(index)" class="remove-btn">
            <van-icon name="cross" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Compressor from "compressorjs";
import { formatBytes } from '@/utils/index'
import { Uploader } from 'vant';
import { useI18n } from 'vue-i18n-composable'

// 需求 blob => hex
export default Vue.extend({
  name: "Uploader",
  props: {
    msg: String,
  },
  components: {
    [Uploader.name]: Uploader,
  },
  data() {
    return {
      images: [],
      previewImages: [],
      useOriginal: false,
      useOriginalWidth: false,
      testArr: []
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    removeImg(index) {
      this.images.splice(index, 1)
      this.previewImages.splice(index, 1)
      this.$refs.selectInput.value = ''
    },
    clear() {
      this.images = []
      this.previewImages = []
      this.$refs.selectInput.value = ''
    },
    change: function (e) {
      this.handleFiles(e.target.files);
    },
    dragover: function (e) {
      e.preventDefault();
    },
    drop: function (e) {
      e.preventDefault();
      this.handleFiles(e.dataTransfer.files);
    },
    onPaste(e) {
      const {
        clipboardData: { files },
      } = e;
      this.handleFiles(files);
    },
    optimizeOptions(file) {
      const options = {}
      // 仅大图需要转 webp，小图延用原格式
      if (file.size < 10 * 1024) return options
      const commonOptions = {
        maxWidth: this.useOriginalWidth ? Infinity : 1080,
        mimeType: 'image/webp',
      }
      return commonOptions
    },
    processImage(input) {
      const self = this
      const _options = this.optimizeOptions(input)
      return new Promise(async (resolve, reject) => {
        if (self.useOriginal) {
          const blobUrl = URL.createObjectURL(input)
          const binary = await this.blobToBinary(input);
          const imageObj = {
            name: input.name,
            type: input.type,
            hex: binary.toString("hex"),
          };
          const previewObj = {
            url: blobUrl,
            input,
            output: input
          }
          resolve({imageObj, previewObj});
        } else {
          const options = {
            ..._options,
            success: async (result) => {
              if (result.size >= input.size) {
                result = input
              }
              const blobUrl = URL.createObjectURL(result)
              const binary = await this.blobToBinary(result);

              const imageObj = {
                name: result.name,
                type: result.type,
                hex: binary.toString("hex"),
              };
              const previewObj = {
                url: blobUrl,
                input,
                output: result
              }
              console.log('压缩对比：', previewObj)
              resolve({imageObj, previewObj});
              // self.output.push();
              // vm.$refs.input.value = '';
            },
            error: function (err) {
              reject(error.message);
            },
          };
          new Compressor(input, options);
        }
      });
    },
    async handleFiles(files) {
      if (!files) {
        this.$toast('请选择文件')
        return
      }
      for (let i = 0; i < files.length && i < 9; i++) {
        const {imageObj, previewObj} = await this.processImage(files[i]);
        this.images.push(imageObj);
        this.previewImages.push(previewObj);
      }
    },
    blobToBinary(fileBlob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result;
          if (arrayBuffer) {
            resolve(Buffer.from(arrayBuffer));
          } else {
            reject(new Error("File error"));
          }
        };
        reader.readAsArrayBuffer(fileBlob);
      });
    },
  },
  filters: {
    formatSize(size) {
      return formatBytes(size);
    },
    formatPercent(percent) {
      return (percent * 100).toFixed(2) + '%';
    },
  },
  watch: {
    'images': {
        handler: function(newValue) {
          this.$emit("change", {
            files: this.images
          });
        },
        deep: true
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.wrap {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
  margin-bottom: 30px;

  .select-area {
    padding: 1.25rem;
    margin: 10px 0;
    background-color: #f8f9fa;
    // height: 150px;
    border: 2px dashed #d8d2d2;
    width: 100%;
    display: flex;
    align-items: center;
    .select-input {
      visibility: hidden;
    }
    .tips {
      margin-left: 30%;
      color: gray;
    }
    .select-btn {
      width: 80px;
      height: 80px;
      margin: 0 8px 8px 0;
      background-color: #f7f8fa;
      color: #dcdee0;
      font-size: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      border: 1px solid #c5c3c3;
      cursor: pointer;
      i {
        cursor: pointer;
      }
      input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        cursor: pointer;
        opacity: 0;
      }
    }
  }
  .image-preview {
    width: 530px;
    min-height: 100px;
    display: flex;
    flex-wrap: wrap;
    .item {
      width: 25%;
      margin-top: 10px;
      margin-right: 10px;
      position: relative;
      .info {
        font-size: 12px;
      }
      .img-wrap {
        position: relative;
      }
      img {
        width: 100%;
      }
      .remove-btn {
        position: absolute;
        right: 0;
        top: 0;
        background-color: rgba(128, 128, 128, 0.6);
        width: 30px;
        border-radius: 2px;
        color: #fff;
        border: none;
        :hover {
          cursor: pointer;
        }
      }
    }
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    .img-option-item {
      margin-right: 10px;
    }
    .item {
      margin-right: 6px;
    }
    label {
      margin-left: 4px;
    }
  }
  .btn-clear {
    margin: 5px;
  }
  .mobile-selector {
    width: 80px;
    height: 80px;
    margin: 0 8px 8px 0;
    background-color: #f7f8fa;
    color: #dcdee0;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: 1px solid #c5c3c3;
    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: pointer;
      opacity: 0;
    }
  }
}
</style>
