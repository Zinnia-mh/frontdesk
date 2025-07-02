<template>
  <div class="tab-bar-container">
    <!-- PC端导航栏 -->
    <div class="tab-bar pc">
      <div
        v-for="item in navItems"
        :key="item.path"
        class="tab-bar-item"
        :class="{ active: homestore.index === item.path }"
        @click="itemClick(item.path)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span class="tab-text">{{ item.name }}</span>
      </div>
    </div>

    <div class="mobile-header">
      <!-- 移动端下拉菜单 -->
      <div class="mobile-dropdown">
        <el-popover
          placement="bottom-start"
          trigger="click"
          :show-arrow="false"
          popper-class="no-arrow-popover"
          :popper-style="{ padding: '0px' }"
        >
          <template #reference>
            <el-button class="dropdown-btn">
              <el-icon><Menu /></el-icon>
            </el-button>
          </template>
          <div class="dropdown-menu">
            <div
              v-for="item in navItems"
              :key="item.path"
              class="dropdown-item"
              :class="{ active: homestore.index === item.path }"
              @click="handleMobileItemClick(item.path)"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </el-popover>
      </div>

      <!-- 系统标题 -->
      <div class="header-title">红枣知识智能服务系统</div>
    </div>
  </div>
</template>

<script setup>
// 保持原有script部分不变
import { ref } from 'vue'
import router from "@/router/index.js"
import { useHomeStore } from "@/stores/main"
import {
  HomeFilled,
  HelpFilled,
  Search,
  Share,
  Menu
} from '@element-plus/icons-vue'

const homestore = useHomeStore()

const navItems = [
  { path: '/home', name: '首页', icon: HomeFilled },
  { path: '/graphdisplay', name: '图谱展示', icon: HelpFilled },
  { path: '/graphsearch', name: '关系搜索', icon: Search },
  { path: '/graphcreate', name: '图谱自建', icon: Share },
  { path: '/question', name: '智能问答', icon: Search }
]

function itemClick (path) {
  router.push(path)
  homestore.index = path
}

function handleMobileItemClick (path) {
  itemClick(path)
}
</script>

<style lang="less" scoped>
/* PC端导航栏样式（保持原有） */
.tab-bar,
.mobile-dropdown {
  position: fixed;
  top: 0;
  z-index: 1000;
  height: 50px;
  width: 100vw;
  background-color: rgba(6, 65, 128, 0.954);
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
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      border: 1px solid #000;
      color: rgb(246, 247, 245);
      font-weight: bold;
    }

    &.active {
      background-color: rgb(139, 186, 227);
      color: #000;
    }
  }
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  background-color: #3f6630;
  display: flex;
  align-items: center;
  z-index: 1000;
}

.mobile-dropdown {
  display: flex;
  align-content: center;
  justify-content: flex-start;
  width: 0;

  .dropdown-btn {
    background: transparent;
    border: none;

    .el-icon {
      color: white;
      font-size: 24px;
    }
  }
}

.header-title {
  flex: 1; /* 占据剩余全部空间 */
  text-align: center; /* 文字居中 */
  color: #fff !important;
  font-size: 20px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

/* 下拉菜单样式保持不变 */
:deep(.no-arrow-popover) {
  padding: 0 !important;

  .el-popper__arrow {
    display: none !important;
  }
}

.dropdown-menu {
  padding: 5px 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s;

    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    &:hover {
      background-color: #f5f7fa;
    }

    &.active {
      background-color: rgb(139, 186, 227);
      color: #000;
    }
  }
}

:deep(.no-arrow-popover) {
  padding: 0 !important;

  .el-popper__arrow {
    display: none !important;
  }
}

@media only screen and (max-width: 768px) {
  .tab-bar.pc {
    display: none;
  }
  .tab-bar-container {
    width: 100vw;
  }
}

@media only screen and (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

/* 确保页面内容不被遮挡 */
body {
  padding-top: 60px;
}
</style>