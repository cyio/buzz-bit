<template>
  <div class="tips">
    <div class="fixed-amount">
      <div class="select-wrap">
        <div class="item" v-for="(item, index) in list" :key="index"
          @click="$emit('amount-selected', computeRealAmount(item))"
        >
          <div class="num">{{item | formatAmount}}</div>
          <div class="unit">{{item.unit}}</div>
        </div>
      </div>
      <!-- <div class="otherPay">
        <span>其他金额</span>
      </div> -->
    </div>
  </div>
</template>

<script>
const time = +new Date()
export default ({
  name: "BuzzTips",
  props: {
    // show: Boolean,
  },
  components: {
  },
  data() {
    return {
      list: [
        {
          num: '10',
          unit: 'sat'
        },
        {
          num: '50',
          unit: 'sat'
        },
        {
          num: '200',
          unit: 'sat'
        },
        {
          num: '0.01',
          unit: 'bsv'
        },
        {
          num: '0.05',
          unit: 'bsv'
        },
        {
          num: '0.2',
          unit: 'bsv'
        },
      ]
    };
  },
  methods: {
    computeRealAmount(item) {
      if (item.unit === 'sat') {
        return item.num * 1000
      } else if (item.unit === 'bsv') {
        return item.num * 100000000
      }
    }
  },
  filters: {
    formatAmount(item) {
      if (item.unit === 'sat') {
        return item.num + 'k'
      }
      return item.num
    }
  },
});
</script>

<style scoped lang="scss">
.tips {
  width: 470px;
  padding: 40px;
  .fixed-amount {
    .select-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-around;
      .item {
        margin-right: 16px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 7.85714rem;
        height: 5rem;
        border: 0.07143rem solid var(--theme-color);
        border-radius: 20px;
        color: var(--theme-color);
        cursor: pointer;
        .num {
          font-size: 20px;
          font-weight: bold;
        }
        .unit {
          color: gray;
          margin-left: 6px;
        }
      }
    }
  }
}
</style>