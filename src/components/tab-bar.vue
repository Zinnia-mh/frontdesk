<template>
  <div class="tab-bar">
    <div
      class="tab-bar-item"
      :style="{
        backgroundColor: homestore.index == '/home' ? 'rgb(139, 186, 227)' : '',
        color: homestore.index == '/home' ? '#000' : '',
      }"
      @click="itemClick('/home')"
    >
      <el-icon><HomeFilled /></el-icon>首页
    </div>
    <div
      :style="{
        backgroundColor:
          homestore.index == '/graphdisplay' ? 'rgb(139, 186, 227)' : '',
        color: homestore.index == '/graphdisplay' ? '#000' : '',
      }"
      class="tab-bar-item"
      @click="itemClick('/graphdisplay')"
    >
      <el-icon><HelpFilled /></el-icon>图谱展示
    </div>
    <div
      :style="{
        backgroundColor:
          homestore.index == '/graphsearch' ? 'rgb(139, 186, 227)' : '',
        color: homestore.index == '/graphsearch' ? '#000' : '',
      }"
      class="tab-bar-item"
      @click="itemClick('/graphsearch')"
    >
      <el-icon><Search /></el-icon>关系搜索
    </div>
    <div
      :style="{
        backgroundColor:
          homestore.index == '/graphcreate' ? 'rgb(139, 186, 227)' : '',
        color: homestore.index == '/graphcreate' ? '#000' : '',
      }"
      class="tab-bar-item"
      @click="itemClick('/graphcreate')"
    >
      <el-icon><Share /></el-icon>图谱自建
    </div>
    <div
      :style="{
        backgroundColor:
          homestore.index == '/question' ? 'rgb(139, 186, 227)' : '',
        color: homestore.index == '/question' ? '#000' : '',
      }"
      class="tab-bar-item"
      @click="itemClick('/question')"
    >
      <el-icon><Search /></el-icon>智能问答
    </div>
    <div class="tab-bar-item">
      <a href="http://8.130.127.77/" target="_blank"
        ><el-icon><Menu /></el-icon>后台文献管理</a
      >
    </div>
  </div>
</template>

<script setup>
import router from "@/router/index.js"
import { useHomeStore } from "@/stores/main"
const homestore = useHomeStore()
function itemClick (path) {
  router.push(path)
  homestore.index = path
}
</script>

<style lang="less" scoped>
html,
body {
  width: 100%;
}
.tab-bar {
  position: fixed;
  z-index: 5;
  height: 50px;
  width: 100%;
  background-color: rgba(6, 65, 128, 0.954);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  .tab-bar-item {
    height: 20px;
    padding: 10px;
    margin: 0 10px;
    border-radius: 20px;
    color: aliceblue;
    font-size: large;
  }
  .tab-bar-item:hover {
    border: 1px solid #000;
    color: rgb(246, 247, 245);
    font-weight: bold;
  }
}
a {
  color: aliceblue;
}
.el-icon {
  position: relative;
  top: 3px;
  right: 4px;
}
.tab-bar::after {
  content: "";
  display: block;
}
.cate-item {
  border: 1px solid #000;
  color: rgb(246, 247, 245);
  font-weight: bold;
}
</style>
