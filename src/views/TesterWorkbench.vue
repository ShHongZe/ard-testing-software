<template>
  <div class="container">

    <div class="header">
      <div class="header-left">测试员工作台</div>

      <div class="header-right">
        <!-- @click="openShortcutKeyDialog" -->
        <span class="header-right-dialog" @click="openShortcutKeyDialog">
          快捷键帮助
        </span>
        
        <span class="header-right-exit" @click="logOut">登出</span>
      </div>
    </div>

    <div class="main">

      <div class="test-scheme-selection-container">
        <div>
          <el-tag :type="testScheme ? 'success' : 'info'">
            {{ testScheme ? testScheme : '暂未选择' }}
          </el-tag>
        </div>

        <el-button id="select-test-scheme-button" 
          type="primary" plain @click="selectTestScheme" :disabled="selectTestSchemeButtonDisabled">
          选择测试方案
        </el-button>
      </div>

      <div class="serial-port-card" v-if="serialPortCard">
        <el-card>
          <div class="serial-port-card-inside">
            <div class="serial-port-select">
              <span>串口</span>

              <el-select
                v-model="selectedSerialPort"
                @visible-change="fetchSerialPortList"
                @change="saveSelectedSerialPort"
                :disabled="serialPortSelectDisabled">
                <el-option v-for="(item, index) in serialPortList" 
                  :key="index" :label="item.path" :value="item.path"></el-option>
              </el-select>
            </div>

            <div class="serial-port-switch">
              <span>通信测试</span>

              <el-switch
                v-model="serialPortSwitchValue"
                active-color="#13ce66"
                @change="handleSerialPortSwitchChange"
                :disabled="serialPortSwitchDisabled">
              </el-switch>
            </div>

            <!-- <div class="serial-port-annotation">
              <el-tooltip effect="dark" content="Top Center 提示文字" placement="top">
                <span class="annotation-text">
                  注<span>*</span>
                </span>
              </el-tooltip>
            </div> -->

            <div class="serial-port-line"></div>

            <el-button id="open-test-button"
              type="success" plain @click="openTest" :disabled="openTestButtonDisabled">
              开启ARD测试
            </el-button>
          </div>
        </el-card>
      </div>

      <div class="result-table-card" v-if="resultTableCard">
        <el-card>
          <div class="result-table-card-inside">
            <div class="channel-test-table" v-if="processList.length !== 0">
              <span>通道测试项</span>

              <el-table :data="processResultList" border>
                <el-table-column type="index" width="75" :resizable="false">
                </el-table-column>
                <el-table-column label="测试通道" prop="testingChannel" width="225" :resizable="false">
                </el-table-column>
                <el-table-column label="标准值下限" prop="lowerLimit" width="100" :resizable="false">
                </el-table-column>
                <el-table-column label="标准值上限" prop="upperLimit" width="100" :resizable="false">
                </el-table-column>
                <el-table-column label="接收数值" prop="receivedValue" width="100" :resizable="false">
                </el-table-column>
                <el-table-column label="比对结果" width="150" :resizable="false">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.comparisonResult !== ''" 
                      :type="scope.row.comparisonResult === '通过' ? 'success' : 'danger'">
                      {{ scope.row.comparisonResult }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="步骤说明" prop="stepDescription" :resizable="false">
                </el-table-column>
              </el-table>
            </div>

            <div class="internal-data-table" v-if="ardList.length !== 0">
              <span>内部数据项</span>

              <el-table :data="ardResultList" border>
                <el-table-column type="index" width="75" :resizable="false">
                </el-table-column>
                <el-table-column label="数据类型" prop="dataType" :resizable="false">
                </el-table-column>
                <el-table-column label="数据个数" prop="dataNumber" :resizable="false">
                </el-table-column>
                <el-table-column label="偏移量" prop="dataOffset" :resizable="false">
                </el-table-column>
                <el-table-column label="标准值" prop="standardValue" :resizable="false">
                </el-table-column>
                <el-table-column label="接收数据" prop="receivedValue" :resizable="false">
                </el-table-column>
                <el-table-column label="比对结果" :resizable="false">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.comparisonResult !== ''"
                      :type="scope.row.comparisonResult.type">
                      {{ scope.row.comparisonResult.text }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
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

      <span slot="footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-drawer
      :visible.sync="scanDrawer"
      direction="ltr"
      size="40%"
      :show-close="false"
      :close-on-press-escape="false"
      :wrapperClosable="false"
      :withHeader="false"
      @opened="handleScanDrawerOpened">
      <div class="scan-drawer-container">
        <div class="scan-drawer-tip">
          <span>退出扫码流程请输入 "ExitScan" 并按下回车键</span>
        </div>

        <div class="scan-drawer-input">
          <el-input
            v-model="scannedBarcode"
            ref="scanDrawerInput"
            :placeholder="`${currentIndex + 1}`"
            @change="handleBarcodeChange">
          </el-input>
        </div>

        <div class="scan-drawer-table">
          <el-table :data="scanDrawerTableData" border :show-header="false">
            <el-table-column align="center" type="index" width="40px">
            </el-table-column>

            <el-table-column align="center" prop="barcodeContent"></el-table-column>
            <el-table-column align="center" prop="scannedBarcode"></el-table-column>

            <el-table-column align="center" width="80px">
              <template slot-scope="scope">
                <el-tag 
                  v-if="Object.keys(scope.row.result).length !== 0" 
                  :type="scope.row.result.type">
                  {{ scope.row.result.text }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>

    <el-dialog
      :visible.sync="completeDialogVisible"
      title="结束"
      width="35%"
      top="30vh"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div class="custom-container">
        <i :class="completeDialogIcon ? 'el-icon-success custom-green' : 'el-icon-error custom-red'"></i>
        <span class="custom-text">{{ completeDialogBody }}</span>
      </div>

      <span slot="footer">
        <el-button type="primary" @click="handleComplete">确 定</el-button>
      </span>
    </el-dialog>

    <ShortcutKeyDialog 
      :dialogVisible="shortcutKeyDialogVisible" 
      @toggleShortcutKeyDialog="shortcutKeyDialogVisible = $event">
    </ShortcutKeyDialog>

  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { showMessage, checkValueInRange, getCurrentDateWithoutSeparator, showNotification } from '@/utils'
import { SerialPort } from 'serialport'
import { channelArray } from '@/options/channelOptions'
import { ardOptions } from '@/options/ardOptions'
import { print } from '@/print/print'
const { ReadlineParser } = require('@serialport/parser-readline')

import ShortcutKeyDialog from '@/components/ShortcutKeyDialog.vue'
export default {
  components: { ShortcutKeyDialog },

  data() {
    return {
      testScheme: '',
      featureList: [],
      barcodeList: [],
      processList: [],
      ardList: [],
      isScan: false,
      isPrint: false,
      // ...
      dialogVisible: false,
      dialogBody: '',
      // ...
      scanDrawer: false,
      scannedBarcode: '',
      scannedBarcodeList: [],
      currentIndex: 0,
      scanDrawerTableData: [],
      // ...
      serialPortCard: false,
      selectedSerialPort: localStorage.getItem('selectedSerialPort') || '',
      serialPortList: [],
      serialPortSwitchValue: false,
      serialPort: null,
      // ...
      selectTestSchemeButtonDisabled: false,
      serialPortSelectDisabled: false,
      serialPortSwitchDisabled: false,
      openTestButtonDisabled: true,
      // ...
      resultTableCard: false,
      processResultList: [],
      ardResultList: [],
      // ...
      completeDialogVisible: false,
      completeDialogBody: '',
      completeDialogIcon: '',
      // ...
      shortcutKeyDialogVisible: false
    }
  },

  methods: {
    logOut() {
      this.$router.replace({ path: '/login' })
    },

    openShortcutKeyDialog() {
      this.shortcutKeyDialogVisible = true
    },

    // 选择测试方案部分代码
    selectTestScheme() {
      document.getElementById('select-test-scheme-button').blur()

      ipcRenderer.send('select-test-scheme-request')
    },

    selectTestSchemeResponse(response) {
      switch (response.status) {
        case 'success':
          showMessage(response.message, 'success')

          // 清除状态
          this.closeSerialPort()
          Object.assign(this.$data, this.$options.data.call(this))

          this.testScheme = response.fileName
          const fileContentObject = JSON.parse(response.fileContent)
          this.featureList = fileContentObject.outputFeatureList
          this.barcodeList = fileContentObject.barcodeList
          this.processList = fileContentObject.outputProcessList
          this.ardList = fileContentObject.outputArdList

          this.getIndexFromLocalStorage(this.testScheme)

          // 打开接线图
          ipcRenderer.send('open-wiring-diagram-request', this.testScheme)

          this.isScan = this.featureList.includes('scan')
          this.scanDrawer = this.isScan
          this.serialPortCard = !this.isScan
          this.isPrint = this.featureList.includes('print')

          break
        case 'error':
          this.dialogBody = response.message + '<br>' + response.error
          this.dialogVisible = true

          break
        case 'canceled':
          showMessage(response.message, 'warning')

          break
      }
    },

    getIndexFromLocalStorage(testScheme) {
      const quantityIndexList = JSON.parse(localStorage.getItem('quantityIndexList')) || []
      const currentDate = new Date().toISOString().split('T')[0]

      const foundObject = quantityIndexList.find(item => item.testScheme === testScheme)

      if (foundObject && foundObject.updatedDate === currentDate) {
        this.quantityIndex = parseInt(foundObject.quantityIndex, 10) + 1
      } else {
        this.quantityIndex = 1
      }

      console.log(this.quantityIndex)
    },

    // 扫码抽屉部分代码
    handleScanDrawerOpened() {
      this.$nextTick(() => {
        this.$refs.scanDrawerInput.focus()
      })
      
      this.initializeScanDrawerTableData()
    },

    handleBarcodeChange() {
      const currentBarcodeObject = this.barcodeList[this.currentIndex]
      const currentScannedBarcode = this.scannedBarcode

      if (currentScannedBarcode === 'ExitScan') {
        console.log('退出...')
        this.scanDrawer = false

        this.currentIndex = 0
        this.scannedBarcode = ''
        this.scannedBarcodeList = []
        this.scanDrawerTableData = []

        this.selectTestSchemeButtonDisabled = false

        return
      }

      const result = this.determineResult(currentScannedBarcode, currentBarcodeObject)
      this.$set(this.scanDrawerTableData, this.currentIndex, {
        barcodeContent: currentBarcodeObject.barcodeContent,
        scannedBarcode: currentScannedBarcode,
        result: result
      })

      if (result.type === 'info' || result.type === 'success') {
        this.handleSuccessScan()
      } else {
        this.handleFailureScan()
      }
    },

    determineResult(currentScannedBarcode, currentBarcodeObject) {
      if (currentBarcodeObject.barcodeMatch === 'false') {
        return { text: '通过', type: 'info' }
      }

      const isBarcodeMatch = currentBarcodeObject.barcodeContent === currentScannedBarcode
      const resultText = isBarcodeMatch ? '通过' : '未通过'
      const resultType = isBarcodeMatch ? 'success' : 'danger'

      return { text: resultText, type: resultType }
    },

    handleSuccessScan() {
      this.scannedBarcodeList.push(this.scannedBarcode)
      this.scannedBarcode = ''
      this.currentIndex++

      if (this.currentIndex === this.barcodeList.length) {
        showNotification('扫码流程通过', 'success')

        this.currentIndex = 0
        this.scanDrawerTableData = []

        // console.log('退出...')
        this.scanDrawer = false

        this.serialPortCard ? 
        (this.serialPortSwitchDisabled = false, this.openTestButtonDisabled = false) : (this.serialPortCard = true)
      }
    },

    async handleFailureScan() {
      this.currentIndex = 0
      this.scannedBarcode = ''
      this.scannedBarcodeList = []

      await new Promise(resolve => setTimeout(resolve, 1000))

      showNotification('扫码流程未通过', 'error')
      this.initializeScanDrawerTableData()
    },

    initializeScanDrawerTableData() {
      this.scanDrawerTableData = this.barcodeList.map((barcodeObject) => ({
        barcodeContent: barcodeObject.barcodeContent,
        scannedBarcode: '',
        result: {}
      }))
    },

    // 串口卡片部分代码
    fetchSerialPortList() {
      SerialPort.list().then((ports) => {
        this.serialPortList = ports.filter((element) => {
          return element.manufacturer !== 'Microsoft'
        })
      })
    },

    saveSelectedSerialPort() {
      localStorage.setItem('selectedSerialPort', this.selectedSerialPort)
    },

    handleSerialPortSwitchChange(value) {
      if (!value) {
        this.closeSerialPort()
        return
      }

      if (this.selectedSerialPort === '') {
        showMessage('请先选择串口', 'warning')
        this.serialPortSwitchValue = !this.serialPortSwitchValue
        return
      }

      this.openSerialPort()
    },

    openSerialPort() {
      const serialPortConfig = { path: this.selectedSerialPort, baudRate: 115200, autoOpen: false }

      this.serialPort = new SerialPort(serialPortConfig)

      this.serialPort.open((error) => {
        if (error) {
          this.dialogBody = '通信测试失败<br>' + error
          this.dialogVisible = true
          this.serialPortSwitchValue = !this.serialPortSwitchValue
        } else {
          showMessage('通信测试成功', 'success')
          this.selectTestSchemeButtonDisabled = true
          this.serialPortSelectDisabled = true
          this.openTestButtonDisabled = false
        }
      })
    },

    closeSerialPort() {
      if (this.serialPort && this.serialPort.isOpen) {
        this.serialPort.close(() => {
          this.selectTestSchemeButtonDisabled = false
          this.serialPortSelectDisabled = false
          this.openTestButtonDisabled = true
        })
      }
    },

    handleBeforeUnload() {
      this.closeSerialPort()
    },

    async openTest() {
      document.getElementById('open-test-button').blur()
      
      this.serialPortSwitchDisabled = true
      this.openTestButtonDisabled = true
      this.resultTableCard = true

      this.initializationResultTableData()

      let normalCompletion = true

      if (this.processList.length > 0) {
        normalCompletion = await this.handleProcessList()
      }

      if (this.ardList.length > 0 && normalCompletion) {
        normalCompletion = await this.handleArdList()
      }

      // 生成条形码
      const completeBarcode = 
      this.handleBarcodeGeneration(normalCompletion, this.testScheme, this.quantityIndex)

      // excel数据保存
      ipcRenderer.send('write-to-excel-request', {
        testScheme: this.testScheme,
        testResult: normalCompletion ? '成功' : '失败',
        completeBarcode,
        scannedBarcodeList: this.scannedBarcodeList,
        resultList: [...this.processResultList, ...this.ardResultList]
      })

      // localStorage更新 数量索引 + 1
      this.quantityIndex++
      this.updateIndexInLocalStorage(this.testScheme, this.quantityIndex)

      // 打印
      if (this.isPrint) { print(completeBarcode) }

      await new Promise(resolve => setTimeout(resolve, 1000))

      // 展示
      this.completeDialogBody = normalCompletion ? '测试通过' : '测试未通过'
      this.completeDialogIcon = normalCompletion
      this.completeDialogVisible = true
    },

    // 测试展示部分代码 包含openTest函数
    initializationResultTableData() {
      this.processResultList = this.updateProcessList(this.processList)
      this.ardResultList = this.updateArdList(this.ardList)

      // console.log(this.processResultList)
      // console.log(this.ardResultList)
    },

    updateProcessList(processList) {
      return processList.map(item => {
        const matchingChannel = channelArray.find(channel => channel.value === item.testingChannel)

        return {
          testingChannel: matchingChannel.label,
          stepDescription: item.stepDescription,
          lowerLimit: item.lowerLimit,
          upperLimit: item.upperLimit,
          receivedValue: '',
          comparisonResult: ''
        }
      })
    },

    updateArdList(ardList) {
      return ardList.map(item => {
        const { dataType, dataNumber, dataOffset } = this.splitInstruction(item.instruction)
        const matchingType = ardOptions.find(option => option.value === dataType)

        return {
          dataType: matchingType.label,
          dataNumber: parseInt(dataNumber, 16),
          dataOffset: parseInt(dataOffset, 16),
          standardValue: item.standardValue,
          receivedValue: '',
          comparisonResult: ''
        }
      })
    },

    splitInstruction(instruction) {
      const dataType = instruction.substring(2, 4)
      const dataNumber = instruction.substring(4, 6)
      const dataOffset = instruction.substring(6, 8)

      return { dataType, dataNumber, dataOffset }
    },

    async handleProcessList() {
      let normalCompletion = true

      for (let i = 0; i < this.processList.length; i++) {
        const item = this.processList[i]
        const hexBuffer = Buffer.from(item.testingChannel, 'hex')
        this.serialPort.write(hexBuffer)

        const receivedValue = await this.handleSerialPortReceived()
        this.processResultList[i].receivedValue = receivedValue

        if (!checkValueInRange(item.lowerLimit, item.upperLimit, receivedValue)) {
          this.processResultList[i].comparisonResult = '未通过'
          normalCompletion = false
          break
        }
        this.processResultList[i].comparisonResult = '通过'

        await new Promise(resolve => setTimeout(resolve, item.stepDelay))
      }

      return normalCompletion
    },

    async handleArdList() {
      let normalCompletion = true

      for (let i = 0; i < this.ardList.length; i++) {
        const item = this.ardList[i]
        const hexBuffer = Buffer.from(item.instruction, 'hex')
        this.serialPort.write(hexBuffer)
        
        const receivedValue = await this.handleSerialPortReceived()
        this.ardResultList[i].receivedValue = receivedValue

        if (item.dataMatch === 'true') {
          const comparisonResult = (item.standardValue === receivedValue) ? 
            { text: '通过', type: 'success' } : { text: '未通过', type: 'danger' }

          this.ardResultList[i].comparisonResult = comparisonResult

          if (comparisonResult.type === 'danger') {
            normalCompletion = false
            break 
          }
        } else {
          this.ardResultList[i].comparisonResult = { text: '通过', type: 'info' }
        }
        
        await new Promise(resolve => setTimeout(resolve, item.stepDelay))
      }

      return normalCompletion
    },

    handleSerialPortReceived() {
      return new Promise((resolve) => {
        const parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))
        parser.on('data', (data) => {
          resolve(data)
        })
      })
    },

    handleBarcodeGeneration(normalCompletion, testScheme, quantityIndex) {
      const currentDateWithoutSeparator = getCurrentDateWithoutSeparator()
      const paddedQuantityIndex = String(quantityIndex).padStart(4, '0')

      if (normalCompletion) {
        return testScheme + currentDateWithoutSeparator + paddedQuantityIndex
      } else {
        return 'Fail' + testScheme + currentDateWithoutSeparator + paddedQuantityIndex
      }
    },

    writeToExcelResponse(response) {
      const type = response.status === 'success' ? response.status : 'error'
      showNotification(response.message, type)
    },

    updateIndexInLocalStorage(testScheme, quantityIndex) {
      const currentDate = new Date().toISOString().split('T')[0]
      const quantityIndexList = JSON.parse(localStorage.getItem('quantityIndexList')) || []

      quantityIndex = quantityIndex === 10000 ? 0 : quantityIndex - 1

      const foundIndex = quantityIndexList.findIndex(item => item.testScheme === testScheme)

      if (foundIndex !== -1) {
        quantityIndexList[foundIndex].quantityIndex = quantityIndex
        quantityIndexList[foundIndex].updatedDate = currentDate
      } else {
        quantityIndexList.push({
          testScheme,
          quantityIndex: quantityIndex,
          updatedDate: currentDate
        })
      }

      localStorage.setItem('quantityIndexList', JSON.stringify(quantityIndexList))
    },

    handleComplete() {
      this.completeDialogVisible = false

      if (this.isScan) {
        this.scanDrawer = true
        this.scannedBarcodeList = []
      } else {
        this.serialPortSwitchDisabled = this.openTestButtonDisabled = false
      }
    }
  },

  mounted() {
    window.addEventListener('beforeunload', this.handleBeforeUnload)

    ipcRenderer.on('select-test-scheme-response', (event, response) => {
      this.selectTestSchemeResponse(response)
    })

    ipcRenderer.on('write-to-excel-response', (event, response) => {
      this.writeToExcelResponse(response)
    })
  },

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)

    this.closeSerialPort()

    ipcRenderer.removeAllListeners('select-test-scheme-response')
    ipcRenderer.removeAllListeners('write-to-excel-response')
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
  padding: 40px 50px;
}

/* ...... */
.test-scheme-selection-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
}

#select-test-scheme-button {
  margin: 0px 80px;
}

.el-tag {
  height: 100%;
  font-weight: bold;
  display: flex;
  align-items: center;
}

/* ...... */
.serial-port-card {
  margin-bottom: 40px;
}

.serial-port-card-inside {
  display: flex;
  flex-direction: row;
}

.serial-port-select,
.serial-port-switch {
  margin-right: 100px;
  display: flex;
  align-items: center;
  /* border: 1px solid black; */
}

.serial-port-line {
  width: 2px;
  margin-right: 100px;
  background-color: rgb(125, 126, 127);
}

.serial-port-annotation {
  display: flex;
  align-items: center;
  color: rgba(128, 128, 128, 0.901);
  font-size: 20px;
  font-family: monospace;
  margin-right: 50px;
}

.annotation-text {
  position: relative;
  display: inline-block;
}

.annotation-text > span {
  position: absolute;
  top: -5px;
  right: -8px;
  font-size: smaller;
}

.serial-port-select > span,
.serial-port-switch > span {
  font-size: 20px;
  font-family: monospace;
  margin-right: 25px;
}

/* ...... */
.dialog-span {
  color: red;
  font-size: 20px;
  font-family: monospace;
}

/* ...... */
.scan-drawer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.scan-drawer-tip {
  padding: 40px 0px;
  font-size: 20px;
  font-family: monospace;
  text-align: center;
  border-bottom: 2px solid lightgray;
}

.scan-drawer-input {
  padding: 40px 80px;
  border-bottom: 2px solid lightgray;
}

.scan-drawer-table {
  flex-grow: 1;
  padding: 40px 40px;
}

/* ...... */
.channel-test-table,
.internal-data-table {
  padding: 20px 40px;
}

.channel-test-table > span,
.internal-data-table > span {
  font-size: 20px;
  font-family: monospace;
  margin-bottom: 20px;
  display: block;
  /* border: 1px solid black; */
}

/* ...... */
.custom-container {
  display: flex;
  /* border: 1px solid black; */
}

.custom-green {
  color: #67C23A;
  font-size: 25px;
}

.custom-red {
  color: #F56C6C;
  font-size: 25px;
}

.custom-text {
  margin-left: 20px;
  color: black;
  font-size: 20px;
  font-family: monospace;
  /* border: 1px solid black; */
}
</style>
