<template>
  <div class="wrap">
    <div
      class="select-area"
      @change="change"
      @dragover="dragover"
      @drop="drop"
      @paste="onPaste"
    > 
      <button class="select-btn btn-reverse">
        <label class="text-primary"
          >选择...
          <input
            type="file"
            class="select-input"
            id="file"
            accept="*"
            ref="selectInput"
          />
        </label>
      </button>
      <button @click="clear" class="clear-btn btn-medium">清除选择</button>
      <div class="file-options">
        <div class="file-option-item">
          <label for="useLargeFile">文件分片(支持 > 10MB)</label>
          <input type="checkbox" id="useLargeFile" v-model="useLargeFile">
          <span class="slice-about" v-show="useLargeFile">说明：会分割成 1MB 大小上传，信息流不可见、不可预览。仅用于测试。
            上传大于 10MB 的文件，点击发送后，可能需要等待 1 分钟以上时间
          </span>
        </div>
      </div>
      <div class="file-list" v-if="files && files.length">
        <van-loading v-show="files.length !== totalFilesNum">处理中</van-loading>
        文件列表：{{files.length}}/{{totalFilesNum}} 大小：{{files | computeSize}}
        <div class="item" v-for="(file, index) in files" :key="index">
            <div class="size">文件名：{{file.name}} {{index}} 类型：{{file.type}} 大小：{{file.size}}byte</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { formatBytes, getExtension, sliceFile } from '@/utils/index'

export default Vue.extend({
  name: "FileUploader",
  props: {
    msg: String,
  },
  data() {
    return {
      files: [],
      totalFilesNum: 0,
      previewImages: [],
      useOriginal: false,
      useOriginalWidth: false,
      useLargeFile: false
    };
  },
  methods: {
    removeImg(index) {
      this.files.splice(index, 1)
      this.previewImages.splice(index, 1)
      this.$refs.selectInput.value = ''
    },
    clear() {
      this.files = []
      this.previewImages = []
      this.$refs.selectInput.value = ''
      this.totalFilesNum = 0
      this.$emit('clear')
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
    // 文件转换成 附件要求 格式，hex
    processFile(input, {name, chunkIndex, chunkSize} = {}) {
      const self = this
      return new Promise(async (resolve, reject) => {
        const binary = await this.blobToBinary(input); // Buffer
        const fileObj = {
          name: name || input.name,
          type: input.type || getExtension(input.name),
          hex: binary.toString("hex"),
          size: input.size
        };
        if (chunkIndex > -1) {
          fileObj.chunkIndex = chunkIndex
        }
        console.log(fileObj.hex.length)
        resolve({fileObj});
      });
    },
    async handleFiles(files) {
      if (!files) {
        this.$toast('请选择文件')
        return
      }
      this.totalFilesNum = files.length
      for (let i = 0; i < files.length; i++) {
        // 单文件大于 10MB'
        const file = files[i]
        if (this.useLargeFile) {
        // if (files[i].size > 1024) {
          // console.log(files[i] instanceof Blob)
          const chunkSize = 1024 * 1024 * 1
          let chunks = sliceFile(file, chunkSize)
          this.totalFilesNum = chunks.length
          // console.log('chunks: ', chunks.length)
          for (let j = 0; j < chunks.length; j++) {
            const {fileObj} = await this.processFile(chunks[j], {
              name: file.name,
              chunkIndex: j,
              chunkSize
            });
            this.files.push(fileObj);
          }
          // console.log(this.files)
        } else {
          const {fileObj, previewObj} = await this.processFile(file);
          this.files.push(fileObj);
        }
        // this.previewImages.push(previewObj);
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
    computeSize(files) {
      const fileSize = files.reduce((acc, cur) => acc + cur.size, 0)
      return formatBytes(fileSize)
    }
  },
  watch: {
    'files': {
        handler: function(newValue) {
          this.$emit("change", {
            files: this.files
          });
        },
        deep: true
    },
    'useLargeFile': function(val) {
      if (val) {
        this.clear()
        this.$toast('请选择文件')
      }
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

  .select-area {
    padding: 1.25rem;
    margin-right: 15px;
    background-color: #f8f9fa;
    height: 150px;
    border: 2px dashed #d8d2d2;
    overflow-y: scroll;
    max-width: 100%;
    .select-input {
      visibility: hidden;
    }
    .select-btn {
      margin-bottom: 10px;
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
  .file-options {
    display: flex;
    .file-option-item {
      margin-right: 10px;
    }
  }
  .slice-about {
    color: #4e4d4d;
    font-size: 12px;
    margin-left: 10px;
    margin-top: 10px;
  }
  .file-list {
    color: #4e4d4d;
    margin-left: 10px;
    margin-top: 10px;
    font-size: 12px;
  }
  .clear-btn {
    margin-left: 10px;
  }
}
</style>
