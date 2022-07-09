<template>
  <div class="wallet" v-if="check()">
    <van-popover v-model="showPopover" trigger="hover">
      <div class="address">{{address ? address.slice(0, 6) + '...' : ''}}</div>
      <template #reference>
        <van-button type="primary" @click="connect">connect</van-button>
      </template>
    </van-popover>
    <!-- <div class="row"> -->
      <!-- <button class="tip" @click="disconnect" v-else>disconnect</button> -->
      <!-- <span class="address">{{address ? address.slice(0, 6) + '...' : ''}}</span> -->
    <!-- </div> -->
    <!-- <div class="row">
      <input type="number" placeholder="金额(以最小单位)" v-model="amount" min="0">  -->
      <!-- 快捷输入<input type="number" placeholder="金额" v-model="amount" min="200"> 单位系数
      <select v-model="selectFactor">
        <option v-for="(item, index) in factors" :key="index">{{item}}</option>
      </select> -->
      <!-- <div>实际金额{{ actualAmount }}</div>
      <select v-model="selectedFT">
        <option v-for="ft in ftList" :key="ft.unit">{{ft.unit}}</option>
      </select>
      <button class="tip" @click="tip">打赏 Buzz 主</button>
    </div> -->
  </div>
</template>

<script>
import { Popover } from 'vant';

export default ({
  name: "SensiletWidget",
  props: {
  },
  components: {
    [Popover.name]: Popover,
  },
  data() {
    return {
      address: null,
      ftList: [],
      selectedFT: 'BSV',
      isConnect: false,
      showPopover: false
    };
  },
  methods: {
    check() {
      if (typeof window.sensilet == 'undefined') {
        return false
      }
      return true
    },
    async connect() {
      const address = await sensilet.requestAccount();
      this.address = address
      this.$sensiletStore.address = address
      this.getList()
      this.$toast('连接成功');
      console.log(address)
      this.isConnect = true
    },
    disconnect() {
      sensilet.exitAccount()
      this.address = null
      this.isConnect = false
    },
    async init() {
      const address = await sensilet.getAccount();
      this.address = address
      this.$sensiletStore.address = address
      this.isConnect = true
      this.getList()
    },
    async getList() {
      const bsvBalance = await sensilet.getBsvBalance()
      const bsvFT = {
        unit: 'BSV',
        balance: bsvBalance.balance.total
      }
      const ftList = await sensilet.getSensibleFtBalance()
      let tmp = ftList.filter(i => i.balance > 0)
      tmp.unshift(bsvFT)
      this.ftList.push(...tmp)
      this.selectedFT = tmp[0].unit
    },
  },
  computed: {
    url() {
      return `https://www.google.com/search?q=site%3Ashowbuzz.app%2Fdetails+${this.keywords}`
    }
  },
  async created() {
    if (this.check()) {
      this.isConnect = await sensilet.isConnect()
      if (this.isConnect) {
        this.init()
      }
      console.log('sensilet: ', this.isConnect)
    } else {
      this.$toast('Sensilet 未安装');
    }
  },
});
</script>

<style scoped lang="scss">
</style>
