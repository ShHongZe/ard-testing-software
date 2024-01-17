<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style>
/* 解决表格错位 */
.el-table--border th.gutter:last-of-type {
  display: block!important;
}
</style>
