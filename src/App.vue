<template>
  <div class="app">
    <div class="view-tab">
      <tab-bar />
    </div>
    <div class="view-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import tabBar from './components/tab-bar.vue';

</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.view-content {
  flex: 1;
}

.view-tab {
  height: 50px;
}

body .el-popover {
  padding: 0 !important;
}
body * {
  overflow: hidden !important;
  width: 100vw;
}
</style>
