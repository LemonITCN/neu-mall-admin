<template>
  <el-card class="good-container">
    <template #header>
      <div class="header">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增商品</el-button>
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
        prop="goodsId"
        label="商品编号"
      >
      </el-table-column>
      <el-table-column
        prop="goodsName"
        label="商品名"
      >
      </el-table-column>
      <el-table-column
        prop="goodsIntro"
        label="商品简介"
      >
      </el-table-column>
      <el-table-column
        label="商品图片"
        width="150px"
      >
        <template slot-scope="scope">
          <img style="width: 100px; height: 100px;" :key="scope.row.goodsId"
               :src="prefix(scope.row.goodsCoverImg)" alt="商品主图">
        </template>
      </el-table-column>
      <el-table-column
        prop="stockNum"
        label="商品库存"
      >
      </el-table-column>
      <el-table-column
        prop="sellingPrice"
        label="商品售价"
      >
      </el-table-column>
      <el-table-column
        label="上架状态"
      >
        <template #default="scope">
          <span style="color: green;" v-if="scope.row.goodsSellStatus == 0">销售中</span>
          <span style="color: red;" v-else>已下架</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="100"
      >
        <template #default="scope">
          <a style="cursor: pointer; margin-right: 10px" @click="handleEdit(scope.row.goodsId)">修改</a>
          <a style="cursor: pointer; margin-right: 10px" v-if="scope.row.goodsSellStatus == 0"
             @click="handleStatus(scope.row.goodsId, 1)">下架</a>
          <a style="cursor: pointer; margin-right: 10px" v-else @click="handleStatus(scope.row.goodsId, 0)">上架</a>
        </template>
      </el-table-column>
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
import { prefix } from '../utils/proxy'

export default {
  name: 'Good',
  data () {
    return {
      prefix,
      loading: false,
      tableData: [], // 数据列表
      multipleSelection: [], // 选中项
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10 // 分页大小
    }
  },
  mounted () {
    this.getGoodList()
  },
  methods: {
    getGoodList () {
      this.loading = true
      axios.get('/goods/list', {
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
    handleAdd () {
      this.$router.push({ path: '/add' })
    },
    handleEdit (id) {
      this.$router.push({
        path: '/add',
        query: { id }
      })
    },
    // 选择项
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    changePage (val) {
      this.currentPage = val
      this.getGoodList()
    },
    handleStatus (id, status) {
      axios.put(`/goods/status/${status}`, {
        ids: id ? [id] : []
      }).then(() => {
        Message.success('修改成功')
        this.getGoodList()
      })
    }
  }
}
</script>

<style scoped>
.good-container {
  min-height: 100%;
}

.el-card.is-always-shadow {
  min-height: 100% !important;
}
</style>
