'use strict'

import { app, protocol, BrowserWindow, Menu, globalShortcut, ipcMain, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1300,
    height: 750,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    },
    maximizable: false
  })

  Menu.setApplicationMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()

  globalShortcut.register('CommandOrControl+R', () => {
    BrowserWindow.getFocusedWindow().reload()
  })

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    BrowserWindow.getFocusedWindow().webContents.toggleDevTools()
  })

  globalShortcut.register('F11', () => {
    const win = BrowserWindow.getFocusedWindow()
    win.setFullScreen(!win.isFullScreen())
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 以下是通讯函数
// 1  保存测试方案
ipcMain.on('generate-test-scheme-request', (event, data) => {
  const { featureList, barcodeList, processList, ardList, testScheme } = data
  const outputFeatureList = changeFeatureList(featureList)
  const outputProcessList = changeProcessList(processList)
  const outputArdList = changeArdList(ardList)
  const txtData = { outputFeatureList, barcodeList, outputProcessList, outputArdList }
  const jsonData = JSON.stringify(txtData, null, 2)

  dialog.showSaveDialog({
    title: '生成测试方案',
    defaultPath: testScheme + '.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  }).then((result) => {
    if (!result.canceled) {
      const filePath = result.filePath
      fs.writeFile(filePath, jsonData, (error) => {
        if (error) {
          event.reply('generate-test-scheme-response', 
          { status: 'error', message: '生成测试方案失败', error: error.message })
        } else {
          event.reply('generate-test-scheme-response', 
          { status: 'success', message: '生成测试方案成功' })
        }
      })
    } else {
      event.reply('generate-test-scheme-response', 
      { status: 'canceled', message: '生成测试方案取消' })
    }
  }).catch((error) => {
    event.reply('generate-test-scheme-response', 
    { status: 'error', message: '对话框显示或处理时出现错误', error: error.message })
  })
})

// 修改featureList
function changeFeatureList(inputFeatureList) {
  return inputFeatureList.map(feature => {
    if (feature === '扫码') {
      return 'scan'
    } else if (feature === '打印') {
      return 'print'
    }
    return feature
  })
}

// 修改processList
function changeProcessList(inputProcessList) {
  return inputProcessList.map(process => {
    const testingChannel = process.testingChannel.length === 2
      ? process.testingChannel[1]
      : process.testingChannel[0]
    return {
      ...process,
      testingChannel: testingChannel
    }
  })
}

// 修改ardList
function changeArdList(inputArdList) {
  return inputArdList.map(item => {
    const hexDataNumber = parseInt(item.dataNumber).toString(16).padStart(2, '0').toUpperCase()
    const hexOffset = parseInt(item.offset).toString(16).padStart(2, '0').toUpperCase()
    const instruction = `01${item.dataType}${hexDataNumber}${hexOffset}`
    return {
      instruction,
      dataMatch: item.dataMatch,
      standardValue: item.standardValue,
      stepDelay: item.stepDelay
    }
  })
}

// 2 选择测试方案
ipcMain.on('select-test-scheme-request', (event) => {
  dialog.showOpenDialog({
    title: '选择测试方案',
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  }).then((result) => {
    if (!result.canceled) {
      const filePath = result.filePaths[0]
      fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
          event.reply('select-test-scheme-response', 
          { status: 'error', message: '选择测试方案失败', error: error.message })
        } else {
          const { name } = path.parse(filePath)
          event.reply('select-test-scheme-response', 
          { status: 'success', message: '选择测试方案成功', fileName: name, fileContent: data })
        }
      })
    } else {
      event.reply('select-test-scheme-response', 
      { status: 'canceled', message: '选择测试方案取消' })
    }
  }).catch((error) => {
    event.reply('select-test-scheme-response', 
    { status: 'error', message: '对话框显示或处理时出现错误', error: error.message })
  })
})

// 3 保存测试Excel
ipcMain.on('write-to-excel-request', (event, data) => {
  // 查找文件
  const checkResult = checkFileExistence(data.testScheme)

  // 处理数据
  const outputData = handleTestData(data)

  let response
  
  if (!checkResult.exists) {
    response = createAndWriteExcel(outputData, checkResult.filePath)
  } else {
    response = updateExcel(outputData, checkResult.filePath)
  }

  event.reply('write-to-excel-response', response)
})

function checkFileExistence(testScheme) {
  const fileName = testScheme + '.xlsx'
  const filePath = path.resolve(require('os').homedir(), 'Desktop', '测试数据', fileName)
  try {
    fs.accessSync(filePath)
    return { exists: true, filePath }
  } catch (error) {
    return { exists: false, filePath }
  }
}

function handleTestData(inputData) {
  const { scannedBarcodeList, resultList } = inputData

  const outputData = {
    ...inputData,
    scannedBarcodeList: scannedBarcodeList.length > 0 ? scannedBarcodeList : '无',
    errorTerm: '无',
    testDate: getFormattedDate(),
    testTime: getFormattedTime()
  }

  let foundEmpty = false
  for (let i = 0; i < resultList.length; i++) {
    const result = resultList[i]
    const isEmpty = Object.values(result).some((value) => value === '')
    if (isEmpty) {
      outputData.errorTerm = resultList[i - 1]
      foundEmpty = true
      break
    }
  }
  if (!foundEmpty) {
    const lastResult = resultList[resultList.length - 1]
    const comparisonResult = lastResult.comparisonResult
    if (
      (typeof comparisonResult === 'string' && comparisonResult === '未通过') ||
      (typeof comparisonResult === 'object' && comparisonResult.text === '未通过')
    ) {
      outputData.errorTerm = lastResult
    }
  }

  return outputData
}

function getFormattedDate() {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentDate.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

function getFormattedTime() {
  const currentTime = new Date()
  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')
  
  return `${hours}:${minutes}:${seconds}`
}

function createAndWriteExcel(data, filePath) {
  const headers = 
  ['测试日期', '测试时间', '测试结果', '测试条码', '扫描条码', '错误项', '测试流程']
  const writtenData = [
    headers,
    [
      data.testDate,
      data.testTime,
      data.testResult,
      data.completeBarcode,
      Array.isArray(data.scannedBarcodeList) ? data.scannedBarcodeList.join(', ') : data.scannedBarcodeList,
      (typeof data.errorTerm === 'object') ? JSON.stringify(data.errorTerm) : data.errorTerm,
      JSON.stringify(data.resultList)
    ]
  ]
  const ws = XLSX.utils.aoa_to_sheet(writtenData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  try {
    const buffer = XLSX.write(wb, { type: 'buffer' })
    fs.writeFileSync(filePath, buffer)

    return { status: 'success', message: '测试数据Excel文件创建和写入成功' }
  } catch (error) {
    return { status: 'fail', message: '测试数据Excel文件创建和写入失败' }
  }
}

function updateExcel(data, filePath) {
  try {
    const file = fs.readFileSync(filePath)
    const wb = XLSX.read(file, { type: 'buffer' })
    const ws = wb.Sheets['Sheet1']

    const writtenData = [
      data.testDate,
      data.testTime,
      data.testResult,
      data.completeBarcode,
      Array.isArray(data.scannedBarcodeList) ? data.scannedBarcodeList.join(', ') : data.scannedBarcodeList,
      (typeof data.errorTerm === 'object') ? JSON.stringify(data.errorTerm) : data.errorTerm,
      JSON.stringify(data.resultList)
    ]

    const range = XLSX.utils.decode_range(ws['!ref'])
    const newRow = range.e.r + 1

    writtenData.forEach((value, index) => {
      const cell = XLSX.utils.encode_cell({ r: newRow, c: index })
      ws[cell] = { t: 's', v: value, h: value, w: value }
    })

    if (range.e.c < writtenData.length - 1) {
      range.e.c = writtenData.length - 1
    }

    range.e.r = newRow
    ws['!ref'] = XLSX.utils.encode_range(range)

    const buffer = XLSX.write(wb, { type: 'buffer' })
    fs.writeFileSync(filePath, buffer)

    return { status: 'success', message: '测试数据Excel文件更新成功' }
  } catch (error) {
    return { status: 'fail', message: '测试数据Excel文件更新失败' }
  }
}

// 4 打开接线图
ipcMain.on('open-wiring-diagram-request', (event, data) => {
  const wiringDiagramFileName = data + '.jpg'
  const wiringDiagramFilePath = path.join(require('os').homedir(), 'Desktop', '方案接线图', wiringDiagramFileName)

  shell.openPath(wiringDiagramFilePath)
})
