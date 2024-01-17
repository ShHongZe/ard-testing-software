<template>
  <div class="container">

    <el-card>
      <div class="card-title">
        慧灵 ARD 测试软件
      </div>

      <div>
        <el-input v-model.trim="role" clearable>
          <template slot="prepend"><i class="el-icon-user"></i></template>
        </el-input>
        
        <el-button id="login-button" type="info" :disabled="buttonDisabled" @click="logIn">
          登录
        </el-button>
      </div>

      <div class="card-prompt">
        <span>工程师 - engineer</span>
        <span>测试员 - tester</span>
      </div>
    </el-card>

  </div>
</template>

<script>
import { showMessage } from '@/utils'
export default {
  data() {
    return {
      role: ''
    }
  },

  methods: {
    logIn() {
      document.getElementById('login-button').blur()
      const rolePathMap = {
        engineer: '/engineer-workbench',
        tester: '/tester-workbench'
      }
      if (this.role in rolePathMap) {
        this.$router.replace({ path: rolePathMap[this.role] })
      } else {
        showMessage('登录提交有误', 'error')
        this.role = ''
      }
    }
  },

  computed: {
    buttonDisabled() {
      return this.role === ''
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-card {
  height: 350px;
  width: 350px;
  padding-top: 50px;
  /* box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.2); */
}

.card-title {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  font-family: monospace;
  margin-bottom: 40px;
}

.el-button {
  width: 100%;
  margin: 20px 0;
}

.card-prompt {
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  /* text-align: center; */
}
</style>
