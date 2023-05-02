<template>
  <div class="common-layout">
    <el-container class="border">
      <el-header class="border">Header</el-header>
      <el-container class="border">
        <el-aside class="border" width="300px">
          <TheCalendarChartVue />
        </el-aside>
        <el-container class="container border">
          <el-main class="top border">
            <TheAreaChartVue />
          </el-main>
          <el-main class="bottom border">
            <TheListViewVue />
          </el-main>
        </el-container>
        <el-aside width="300px">
          <the-repost-view />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import TheRepostView from './components/TheRepostView.vue';
import TheListViewVue from './components/TheListView.vue';
import TheAreaChartVue from './components/TheAreaChart.vue';
import TheCalendarChartVue from './components/TheCalendarChart.vue';

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md
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
  display: flex;
  flex-direction: column;
  /* height: 88vh; */
}

.border {
  border: 1px solid #ccc;
}

.top {
  flex: 1; /* 设置顶部 <el-main> 组件占据剩余空间 */
}

.bottom {
  height: 200px; /* 设置底部 <el-main> 组件高度为 200px */
}
</style>
