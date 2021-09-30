<template>
  <div class="wrap">
    <div
      class="select-area"
      @change="change"
      @dragover="dragover"
      @drop="drop"
      @paste="onPaste"
    > 
      <button>
        <label class="text-primary"
          >选择图片...
          <input
            type="file"
            class="sr-only"
            id="file"
            accept="image/*"
            multiple="multiple"
            ref="input"
          />
        </label>
      </button>
      <span> 共 {{previewImages.length}} 个 </span>
      <button @click="clear">清除图片</button>
    </div>
    <div class="image-preview">
      <div class="item" v-for="(image, index) in previewImages" :key="index">
        <div class="info">
            原图：{{image.input.size|formatSize}} 压缩后：{{image.output.size|formatSize}} 压缩率：{{(image.output.size/image.input.size)|formatPercent}}</div>
        <img :src="image.url" :alt="image.input.name" />
        <button @click="removeImg(index)" class="remove-btn">X</button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Compressor from "compressorjs";
import { formatBytes } from '@/utils/index'

// 需求 blob => hex
export default Vue.extend({
  name: "Uploader",
  props: {
    msg: String,
  },
  data() {
    return {
      images: [],
      previewImages: [],
      // useOrigin: false,
    };
  },
  methods: {
    removeImg(index) {
      this.images.splice(index, 1)
      this.previewImages.splice(index, 1)
    },
    clear() {
      this.images = []
      this.previewImages = []
      this.$refs.input.value = ''
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
      console.log(files);
      this.handleFiles(files);
    },
    optimizeOptions(file) {
      const options = {}
      // 仅大图需要转 webp，小图延用原格式
      if (file.size < 10 * 1024) return options
      const commonOptions = {
        maxWidth: 1080,
        mimeType: 'image/webp',
      }
      return commonOptions
    },
    processImage(file) {
      const self = this
      const options = this.optimizeOptions(file)
      return new Promise((resolve, reject) => {
        const options = {
          ...options,
          success: async (result) => {
            console.log("Output: ", result);
            // console.timeEnd('compress')
            // debugger
            const blobUrl = URL.createObjectURL(result)
            const binary = await this.blobToBinary(result);

            const imageObj = {
              fileName: result.name,
              fileType: result.type,
              // url: blobUrl,
              // binary: result,
              data: binary.toString("hex"),
            };
            const previewObj = {
              url: blobUrl,
              input: file,
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
        new Compressor(file, options);
      });
    },
    async handleFiles(files) {
      for (let i = 0; i < files.length && i < 9; i++) {
        const {imageObj, previewObj} = await this.processImage(files[i]);
        this.images.push(imageObj);
        this.previewImages.push(previewObj);
      }
      this.$emit("change", this.images);
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
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
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
  justify-content: center;

  .select-area {
    padding: 1.25rem;
    margin-right: 15px;
    background-color: #f8f9fa;
    height: 150px;
    border: 2px dashed #d8d2d2;
    input {
      visibility: hidden;
    }
  }
  .image-preview {
    width: 530px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .item {
      width: 48%;
      margin-top: 10px;
      position: relative;
      img {
        width: 100%;
      }
      .remove-btn {
        position: absolute;
        right: 10px;
        bottom: 10px;
      }
    }
  }
}
</style>
