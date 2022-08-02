<template>
  <el-menu
    :default-active="state.active"
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
    :default-openeds="['basic']"
    router
  >
    <el-menu-item :index="menu.router" v-for="(menu, index) in state.menus" :key="index">{{ menu.text }}</el-menu-item>
  </el-menu>
</template>
<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  props: {
    active: {
      type: String,
      required: true,
      default: '/idcard'
    }
  },
  setup(props) {
    const state = reactive({
      active: props.active,
      menus: [
        {
          text: '身份证生成',
          router: '/idcard'
        }, {
          text: '身份证照片生成',
          router: '/idcard-image'
        }, {
          text: '关于',
          router: '/about'
        }
      ]
    })

    const handleSelect = (key: string, keyPath: string[]) => {
      console.log(key, keyPath)
      state.active = key
    }

    return {
      state,
      handleSelect
    }
  }
})

</script>
