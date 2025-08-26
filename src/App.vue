<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="sidebar-toggle" @click="isCollapse = !isCollapse">
        <el-icon class="toggle-icon" :class="{ 'is-collapsed': isCollapse }">
          <ArrowRight />
        </el-icon>
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        router
      >
        <el-menu-item index="/">
          <el-icon><Money /></el-icon>
          <template #title>记账本</template>
        </el-menu-item>
        <el-menu-item index="/savings-goals">
          <el-icon><Aim /></el-icon>
          <template #title>存款目标</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { Money, Aim, ArrowRight } from '@element-plus/icons-vue'

const isCollapse = ref(false)
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.sidebar {
  background-color: var(--el-menu-bg-color);
  transition: width 0.3s;
  position: relative;
  border-right: 1px solid var(--el-border-color-light);
}

.el-menu-vertical {
  border-right: none !important;
}

.sidebar-toggle {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
  background-color: var(--el-menu-bg-color);
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--el-menu-hover-bg-color);
  }

  .toggle-icon {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    transition: transform 0.3s ease;
  }

  .toggle-icon.is-collapsed {
    transform: rotate(180deg);
  }
}

.main-container {
  background-color: var(--el-bg-color);
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
