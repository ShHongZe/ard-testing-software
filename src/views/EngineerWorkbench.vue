<template>
  <div class="container">

    <!-- 完成 -->
    <div class="header">
      <div class="header-left">工程师工作台</div>

      <div class="header-right">
        <span class="header-right-dialog" @click="openShortcutKeyDialog">
          快捷键帮助
        </span>
        
        <span class="header-right-exit" @click="logOut">登出</span>
      </div>
    </div>

    <div class="main">

      <!-- 完成 -->
      <div class="basic-configuration-card">
        <el-card>
          <div slot="header">
            <span class="card-title">基础配置</span>
          </div>

          <div>
            <el-checkbox-group v-model="featureList">
              <el-checkbox label="扫码" border></el-checkbox>
              <el-checkbox label="打印" border></el-checkbox>
            </el-checkbox-group>
          </div>

          <div v-if="featureList.includes('扫码')">
            <el-divider></el-divider>

            <div class="barcode-data-header" v-if="barcodeList.length > 0">
              <span class="data-item-first"></span>
              <span class="data-item">是否比对</span>
              <span class="data-item-input">条形码内容</span>
              <span class="data-item">操作</span>
            </div>

            <div class="barcode-data-main" v-for="(item, index) in barcodeList" :key="index">
              <span class="data-item-first">{{ index + 1 }}</span>

              <el-select class="data-item" v-model="item.barcodeMatch" @change="handleBarcodeMatchChange(item)">
                <el-option label="是" value="true"></el-option>
                <el-option label="否" value="false"></el-option>
              </el-select>

              <el-input class="data-item-input" v-model.trim="item.barcodeContent" 
                :disabled="item.barcodeMatch === 'false'" @input="handleBarcodeContentInput(item)">
              </el-input>

              <el-button class="data-item" id="delete-barcode-data-button" 
                type="danger" plain @click="deleteBarcodeData(index)">
                删除
              </el-button>
            </div>

            <el-button id="add-barcode-data-button" type="primary" plain @click="addBarcodeData">
              添加条形码数据
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 完成 -->
      <div class="workflow-configuration-card">
        <el-card>
          <div slot="header">
            <span class="card-title">流程配置</span>
          </div>

          <div>
            <div class="test-step-header" v-if="processList.length > 0">
              <span class="step-item-first"></span>
              <span class="step-item-cascader">测试通道</span>
              <span class="step-item">标准值下限</span>
              <span class="step-item">标准值上限</span>
              <span class="step-item">步间延时ms</span>
              <span class="step-item">操作</span>
            </div>

            <div class="test-step-main" v-for="(item, index) in processList" :key="index">
              <div class="test-step-main-line-one">
                <span class="step-item-first">{{ index + 1 }}</span>

                <el-cascader class="step-item-cascader" 
                  v-model="item.testingChannel" :options="channelOptions" :props="props">
                </el-cascader>

                <el-input class="step-item" v-model.trim="item.lowerLimit"
                  @input="handleProcessInput(item, 'lowerLimit')"></el-input>
                <el-input class="step-item" v-model.trim="item.upperLimit"
                  @input="handleProcessInput(item, 'upperLimit')"></el-input>
                <el-input class="step-item" v-model.trim="item.stepDelay"
                  @input="handleProcessInput(item, 'stepDelay')"></el-input>

                <el-button class="step-item" id="delete-test-step-button" 
                  type="danger" plain @click="deleteTestStep(index)">
                  删除
                </el-button>
              </div>

              <div class="test-step-main-line-two">
                <el-input v-model.trim="item.stepDescription" placeholder="请输入步骤说明"></el-input>
              </div>
            </div>

            <el-button id="add-test-step-button" type="primary" plain @click="addTestStep">
              添加通道测试项
            </el-button>
          </div>

          <el-divider></el-divider>

          <div>
            <div class="ard-inside-header" v-if="ardList.length > 0">
              <span class="ard-item-first"></span>
              <span class="ard-item">数据类型</span>
              <span class="ard-item">数据个数</span>
              <span class="ard-item">偏移量</span>
              <span class="ard-item">是否比对</span>
              <span class="ard-item">标准值</span>
              <span class="ard-item">步间延时ms</span>
              <span class="ard-item">操作</span>
            </div>

            <div class="ard-inside-main" v-for="(item, index) in ardList" :key="index">
              <span class="ard-item-first">{{ index + 1 }}</span>

              <el-select class="ard-item" v-model="item.dataType">
                <el-option
                  v-for="item in ardOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>

              <el-input class="ard-item" v-model.trim="item.dataNumber"
                @input="handleArdInput(item, 'dataNumber')"></el-input>
              <el-input class="ard-item" v-model.trim="item.offset"
                @input="handleArdInput(item, 'offset')"></el-input>

              <el-select class="ard-item" v-model="item.dataMatch" @change="handleDataMatchChange(item)">
                <el-option label="是" value="true"></el-option>
                <el-option label="否" value="false"></el-option>
              </el-select>

              <el-input class="ard-item" v-model.trim="item.standardValue" :disabled="item.dataMatch === 'false'">
              </el-input>
              <el-input class="ard-item" v-model.trim="item.stepDelay"
                @input="handleArdInput(item, 'stepDelay')"></el-input>

              <el-button class="ard-item" id="delete-ard-inside-button" 
                type="danger" plain @click="deleteArdInside(index)">
                删除
              </el-button>
            </div>

            <el-button id="add-ard-inside-button" type="primary" plain @click="addArdInside">
              添加内部数据项
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 完成 -->
      <div class="test-scenario-container">
        <div class="scenario-label">名称</div>

        <div class="scenario-input">
          <el-input v-model.trim="testScheme" clearable></el-input>
        </div>

        <div>
          <el-button id="generate-test-scheme-button" 
            type="success" plain :disabled="buttonDisabled" @click="generateTestScheme">
            生成测试方案
          </el-button>
        </div>
      </div>

    </div>

    <el-dialog 
      :visible.sync="dialogVisible"
      title="提示"
      width="35%"
      top="30vh"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <span class="dialog-span" v-html="dialogBody"></span>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <ShortcutKeyDialog 
      :dialogVisible="shortcutKeyDialogVisible" 
      @toggleShortcutKeyDialog="shortcutKeyDialogVisible = $event">
    </ShortcutKeyDialog>

  </div>
</template>

<script>
import { showMessage } from '@/utils'
import { channelOptions } from '@/options/channelOptions'
import { ardOptions } from '@/options/ardOptions'
import { debounce } from 'lodash'
import { ipcRenderer } from 'electron'
import ShortcutKeyDialog from '@/components/ShortcutKeyDialog.vue'
export default {
  components: { ShortcutKeyDialog },

  data() {
    return {
      featureList: [],
      barcodeList: [],
      processList: [],
      ardList: [],
      channelOptions: channelOptions,
      props: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      ardOptions: ardOptions,
      defaultBarcodeContent: '仅获取',
      defaultStandardValue: '仅接收',
      testScheme: '',
      dialogVisible: false,
      dialogBody: '',
      barcodeContentPattern: /^[A-Za-z0-9]+$/,
      numberPattern: /^[0-9]+(?:\.[0-9]+)?$/,
      shortcutKeyDialogVisible: false
    }
  },

  methods: {
    logOut() {
      this.$router.replace({ path: '/login' })
    },

    addBarcodeData() {
      document.getElementById("add-barcode-data-button").blur()
      const defaultBarcode = { barcodeContent: '', barcodeMatch: 'true' }
      if (this.barcodeList.length === 0 || !this.hasEmptyPropertyInList(this.barcodeList)) {
        this.barcodeList.push({ ...defaultBarcode })
      } else {
        showMessage('请确保已添加条形码数据不存在空白后继续', 'warning')
      }
    },

    handleBarcodeMatchChange(item) {
      if (item.barcodeMatch === 'false') {
        item.barcodeContent = this.defaultBarcodeContent
      } else {
        item.barcodeContent = ''
      }
    },

    deleteBarcodeData(index) {
      this.deleteItem(this.barcodeList, index, 'delete-barcode-data-button')
    },

    addTestStep() {
      document.getElementById("add-test-step-button").blur()
      const defaultStep = { 
        testingChannel: [], stepDescription: '', lowerLimit: '', upperLimit: '', stepDelay: '0' 
      }
      if (this.processList.length === 0 || !this.hasEmptyPropertyInList(this.processList)) {
        this.processList.push({ ...defaultStep })
        this.scrollToBottom.call(this, '.main')
      } else {
        showMessage('请确保已添加通道测试项不存在空白后继续', 'warning')
      }
    },

    deleteTestStep(index) {
      this.deleteItem(this.processList, index, 'delete-test-step-button')
    },

    addArdInside() {
      document.getElementById("add-ard-inside-button").blur()
      const defaultArd = {
        dataType: '',
        dataNumber: '',
        offset: '',
        dataMatch: 'false',
        standardValue: this.defaultStandardValue,
        stepDelay: '0'
      }
      if (this.ardList.length === 0 || !this.hasEmptyPropertyInList(this.ardList)) {
        this.ardList.push({ ...defaultArd })
        this.scrollToBottom.call(this, '.main')
      } else {
        showMessage('请确保已添加内部数据项不存在空白后继续', 'warning')
      }
    },

    handleDataMatchChange(item) {
      if (item.dataMatch === 'false') {
        item.standardValue = this.defaultStandardValue
      } else {
        item.standardValue = ''
      }
    },

    deleteArdInside(index) {
      this.deleteItem(this.ardList, index, 'delete-ard-inside-button')
    },

    generateTestScheme() {
      document.getElementById('generate-test-scheme-button').blur()
      const validationErrors = this.validateData()
      if (validationErrors.length > 0) {
        this.dialogBody = validationErrors.join('<br>')
        this.dialogVisible = true
      } else {
        ipcRenderer.send('generate-test-scheme-request', {
          featureList: this.featureList,
          barcodeList: this.barcodeList,
          processList: this.processList,
          ardList: this.ardList,
          testScheme: this.testScheme
        })
      }
    },

    validateData() {
      const errors = []

      if (this.processList.length === 0 && this.ardList.length === 0) {
        errors.push('请至少添加一个通道测试项或一个内部数据项')
      }

      if (this.featureList.includes('扫码') && this.barcodeList.length === 0) {
        errors.push('选中扫码选项时请至少添加一个条形码数据')
      }

      if (
        this.hasEmptyPropertyInList(this.barcodeList) ||
        this.hasEmptyPropertyInList(this.processList) ||
        this.hasEmptyPropertyInList(this.ardList) 
      ) {
        errors.push('已添加项不能存在空白')
      }

      const regex = /^[^<>:"/\\|?*\u4e00-\u9fa5]+$/
      if (!regex.test(this.testScheme)) {
        errors.push('测试方案名称不能包含特殊字符或中文字符')
      }

      return errors
    },

    // 以下是一些封装函数
    scrollToBottom(selector) {
      this.$nextTick(() => {
        const container = document.querySelector(selector)
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    deleteItem(list, index, buttonId) {
      const activeElement = document.activeElement
      const deleteButtonId = buttonId
      if (activeElement.tagName === 'BUTTON' && activeElement.getAttribute('id') === deleteButtonId) {
        activeElement.blur()
      }
      list.splice(index, 1)
    },

    hasEmptyPropertyInList(list) {
      return list.some(item => {
        return (
          Object.values(item).some(value => {
            if (Array.isArray(value)) {
              return value.length === 0
            }
            return value === ''
          })
        )
      })
    },

    resetData() {
      this.featureList = []
      this.barcodeList = []
      this.processList = []
      this.ardList = []
      this.testScheme = ''
    },

    // 以下是一些数据校验函数
    handleBarcodeContentInput: debounce(function(item) {
      const fieldValue = item.barcodeContent
      if (fieldValue === '') {
        return
      }
      if (!this.barcodeContentPattern.test(fieldValue)) {
        showMessage('条形码内容应该只包含大小写字母和数字', 'warning')
        item.barcodeContent = ''
      }
    }, 300),

    handleProcessInput: debounce(function(item, field) {
      const fieldValue = item[field]
      if (fieldValue === '') {
        return
      }
      if (!this.numberPattern.test(fieldValue)) {
        showMessage('标准值上下限或步间延时应该为非负数字', 'warning')
        if (field === 'stepDelay') {
          item[field] = '0'
        } else {
          item[field] = ''
        }
      }
    }, 300),

    handleArdInput: debounce(function(item, field) {
      const fieldValue = item[field]
      if (fieldValue === '') {
        return
      }
      if (field === 'stepDelay') {
        if (!this.numberPattern.test(fieldValue)) {
          showMessage('步间延时应该为非负数字', 'warning')
          item[field] = '0'
        }
      } else {
        const num = parseFloat(fieldValue)
        if (isNaN(num) || num < 1 || num > 255 || num % 1 !== 0 || fieldValue.includes('.')) {
          showMessage('数据个数或偏移量应该为1到255之间的整数', 'warning')
          item[field] = ''
        }
      }
    }, 300),

    // showShortcutKeyDialog相关代码
    openShortcutKeyDialog() {
      this.shortcutKeyDialogVisible = true
    }
  },

  watch: {
    featureList: {
      deep: true,
      handler(oldValue, newValue) {
        if (oldValue.includes('扫码') && !newValue.includes('扫码')) {
          this.barcodeList = []
        }
      }
    }
  },

  computed: {
    buttonDisabled() {
      return this.testScheme === ''
    }
  },

  mounted() {
    ipcRenderer.on('generate-test-scheme-response', (event, data) => {
      switch (data.status) {
        case 'success':
          showMessage(data.message, 'success')
          this.resetData()
          break
        case 'error':
          this.dialogBody = data.message + '<br>' + data.error
          this.dialogVisible = true
          break
        case 'canceled':
          showMessage(data.message, 'warning')
          break
      }
    })
  },

  beforeDestroy() {
    ipcRenderer.removeAllListeners('generate-test-scheme-response')
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  z-index: 2;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px 0 rgba(135, 134, 134, 0.671);
}

.header-left {
  font-size: 30px;
  font-weight: bold;
  font-family: monospace;
  margin-left: 25px;
}

.header-right {
  margin-right: 25px;
  font-size: 20px;
  font-family: monospace;
  display: flex;
  flex-direction: row;
}

.header-right-dialog {
  cursor: pointer;
}

.header-right-exit {
  margin-left: 25px;
  cursor: pointer;
}

.main {
  overflow-y: auto;
  flex: 1;
  padding: 35px 50px;
}

.basic-configuration-card,
.workflow-configuration-card {
  margin-bottom: 40px;
}

.card-title {
  font-size: 25px;
  font-weight: bolder;
  font-family: monospace;
}

.el-divider {
  margin: 10px 0px;
}

.barcode-data-header,
.test-step-header,
.ard-inside-header {
  display: flex;
  margin-bottom: 5px;
  font-size: 20px;
  font-family: monospace;
}

.barcode-data-main,
.ard-inside-main {
  display: flex;
  margin-bottom: 10px;
}

.data-item-first,
.step-item-first,
.ard-item-first {
  width: 40px;
  font-size: 20px;
  font-family: monospace;
  display: flex;
  align-items: center;
  /* border: 1px solid black; */
}

.data-item-input,
.step-item-cascader {
  width: 250px;
  margin-right: 20px;
}

.data-item,
.step-item,
.ard-item {
  width: 130px;
  margin-right: 20px;
}

.test-step-main {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.test-step-main-line-one {
  display: flex;
  margin-bottom: 10px;
}

.test-step-main-line-two {
  width: 250px;
  margin-left: 40px;
}

.test-scenario-container {
  display: flex;
}

.scenario-label {
  font-size: 20px;
  font-family: monospace;
  display: flex;
  align-items: center;
  margin-right: 20px;
  /* border-left: 3px solid grey;
  border-bottom: 3px solid grey; */
}

.scenario-input {
  width: 250px;
  margin-right: 40px;
}

.dialog-span {
  color: red;
  font-size: 20px;
  font-family: monospace;
}
</style>
