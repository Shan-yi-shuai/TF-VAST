<template>
  <div class="common-layout">
    <el-container>
      <!-- <el-header class="border">TF-VAST</el-header> -->
      <el-container>

        <el-aside class="container">
          <!-- <TheForceDirectedViewVue /> -->
          <el-main class="top border">
            <TheForceDirectedViewVue />
          </el-main>
          <el-main class="border">
            <TheWordCloud />
          </el-main>
        </el-aside>
        <el-container class="container">
          <el-main class="top border" style="--el-main-padding: 0px;">
            <TheAreaChartVue />
          </el-main>
          <el-main class="border" style="flex-basis: unset; flex: 0;overflow: unset;">
            <TheListViewVue />
          </el-main>
        </el-container>
        <el-aside class="border" width="310px">
          <the-repost-view />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import TheRepostView from './components/TheRepostView.vue';
import TheListViewVue from './components/TheListView.vue';
import TheAreaChartVue from './components/TheAreaChart.vue';
import TheForceDirectedViewVue from './components/TheForceDirectedView.vue';
// import TheWordCloud from 'vue3-word-cloud';
import TheCalendarChartVue from './components/TheCalendarChart.vue';
import TheWordCloud from './components/TheWordCloud.vue';
import { defineComponent, computed } from 'vue';
import { useWeibodataStore } from "./store/weibodataStore";


export default defineComponent({
  components: {
    TheRepostView,
    TheListViewVue,
    TheAreaChartVue,
    TheWordCloud,
    TheForceDirectedViewVue,
  },
  data() {
    return {}
  },
  setup() {
    const weibodataStore = useWeibodataStore()
    const word_list = computed(() => weibodataStore.word_list)
    return { word_list }
  }
})

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5px;
}

.container {
  /* display: flex; */
  flex-direction: column;
  /* height: 88vh; */
}

.border {
  border: 1px solid #ccc;
}

.top {
  /* flex: 1; */
  /* 设置顶部 <el-main> 组件占据剩余空间 */
}

.bottom {
  height: 200px;
  /* 设置底部 <el-main> 组件高度为 200px */
}
</style>
