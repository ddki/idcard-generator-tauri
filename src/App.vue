<template>
  <el-header>
    <HeaderMenu />
  </el-header>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderMenu from '@/views/HeaderMenuViewer.vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  components: {
    HeaderMenu
  },
  setup() {
    const route = useRoute()
    console.log(route.fullPath)
    return {}
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
</style>
