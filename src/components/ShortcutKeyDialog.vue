<template>
  <el-dialog :visible.sync="dialogVisible" 
    :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
    <div class="dialog-body">
      <span>Reload（刷新）：Ctrl + R</span>
      <span>Toggle Full Screen（切换全屏模式）：F11</span>
      <span>Toggle Developer Tools（切换开发者工具）：Ctrl + Shift + I</span>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeShortcutKeyDialog">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    dialogVisible: Boolean
  },

  methods: {
    closeShortcutKeyDialog() {
      this.$emit('toggleShortcutKeyDialog', false)
    }
  }
}
</script>

<style scoped>
.dialog-body {
  display: flex;
  flex-direction: column;
  font-size: 20px;
  font-family: monospace;
  color: black;
}

.dialog-body > span {
  margin-bottom: 5px;
}
</style>
