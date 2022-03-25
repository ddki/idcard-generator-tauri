<template>
  <el-header>
    <HeaderMenu />
  </el-header>
  <el-main>
    <router-view></router-view>
  </el-main>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import HeaderMenu from './HeaderMenuViewer.vue'

@Options({
  components: {
    HeaderMenu
  }
})
export default class Home extends Vue { }
</script>
