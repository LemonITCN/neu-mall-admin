<template>
  <el-card class="guest-container">
    <template #header>
      <div class="header">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleSolve">解除禁用</el-button>
        <el-button type="danger" size="small" icon="el-icon-delete" @click="handleForbid">禁用账户</el-button>
      </div>
    </template>
    <el-table
      v-loading="loading"
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="nickName"
        label="昵称"
      >
      </el-table-column>
      <el-table-column
        prop="loginName"
        label="登录名"
      >
      </el-table-column>
      <el-table-column
        label="身份状态"
      >
        <template #default="scope">
          <span :style="scope.row.lockedFlag == 0 ? 'color: green;' : 'color: red;'">
            {{ scope.row.lockedFlag == 0 ? '正常' : '禁用' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="是否注销"
      >
        <template #default="scope">
          <span :style="scope.row.lockedFlag == 0 ? 'color: green;' : 'color: red;'">
            {{ scope.row.isDeleted == 0 ? '正常' : '注销' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="注册时间"
      >
      </el-table-column>
      <!-- <el-table-column
        label="操作"
        width="100"
      >
        <template #default="scope">
          <a style="cursor: pointer; margin-right: 10px" @confirm="handleSolve(scope.row)">解除禁用</a>
          <el-popconfirm
            title="确定禁用吗？"
            @confirm="handleForbid(scope.row)"
          >
            <template #reference>
              <a style="cursor: pointer">禁用账户</a>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column> -->
    </el-table>
    <!--总数超过一页，再展示分页器-->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="changePage"
    />
  </el-card>
</template>

<script>
import axios from '@/utils/axios'
import { Message } from 'element-ui'

export default {
  name: 'Guest',
  data () {
    return {
      loading: false,
      tableData: [], // 数据列表
      multipleSelection: [], // 选中项
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10 // 分页大小
    }
  },
  mounted () {
    this.getGuestList()
  },
  methods: {
    getGuestList () {
      this.loading = true
      axios.get('/users', {
        params: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize
        }
      }).then(res => {
        this.tableData = res.list
        this.total = res.totalCount
        this.currentPage = res.currPage
        this.loading = false
      })
    },
    // 选择项
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    changePage (val) {
      this.currentPage = val
      this.getGuestList()
    },
    handleSolve () {
      if (!this.multipleSelection.length) {
        Message.error('请选择项')
        return
      }
      axios.put('/users/0', {
        ids: this.multipleSelection.map(item => item.userId)
      }).then(() => {
        Message.success('解除成功')
        this.getGuestList()
      })
    },
    handleForbid () {
      if (!this.multipleSelection.length) {
        Message.error('请选择项')
        return
      }
      axios.put('/users/1', {
        ids: this.multipleSelection.map(item => item.userId)
      }).then(() => {
        Message.success('禁用成功')
        this.getGuestList()
      })
    }
  }
}
</script>

<style scoped>
.guest-container {
  min-height: 100%;
}

.el-card.is-always-shadow {
  min-height: 100% !important;
}
</style>
