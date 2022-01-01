<template>
  <div>
    <el-card class="index-container">
      <template #header>
        <div class="header">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" style="margin-right: 10px">增加</el-button>
          <el-popconfirm
            title="确定删除吗？"
            @confirm="handleDelete"
          >
            <template #reference>
              <el-button type="danger" size="small" icon="el-icon-delete">批量删除</el-button>
            </template>
          </el-popconfirm>
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
          prop="configName"
          label="商品名称"
        >
        </el-table-column>
        <el-table-column
          label="跳转链接"
        >
          <template #default="scope">
            <a target="_blank" :href="scope.row.redirectUrl">{{ scope.row.redirectUrl }}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="configRank"
          label="排序值"
          width="120"
        >
        </el-table-column>
        <el-table-column
          prop="goodsId"
          label="商品编号"
          width="200"
        >
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="添加时间"
          width="200"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
        >
          <template #default="scope">
            <a style="cursor: pointer; margin-right: 10px" @click="handleEdit(scope.row.configId)">修改</a>
            <el-popconfirm
              title="确定删除吗？"
              @confirm="handleDeleteOne(scope.row.configId)"
            >
              <template #reference>
                <a style="cursor: pointer">删除</a>
              </template>
            </el-popconfirm>
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
    <DialogAddGood ref='addGood' :reload="getIndexConfig" :type="type" :configType="configType"/>
  </div>
</template>

<script>
import DialogAddGood from '@/components/DialogAddGood.vue'
import axios from '@/utils/axios'
import { Message } from 'element-ui'
// 首页配置类型参数
const configTypeMap = {
  hot: 3,
  new: 4,
  recommend: 5
}
export default {
  name: 'Hot',
  components: {
    DialogAddGood
  },
  data () {
    return {
      loading: false,
      tableData: [], // 数据列表
      multipleSelection: [], // 选中项
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10, // 分页大小
      type: 'add', // 操作类型
      configType: 3 // 3-(首页)热销商品 4-(首页)新品上线 5-(首页)为你推荐
    }
  },
  mounted () {
    this.configType = configTypeMap[this.$route.name]
    this.getIndexConfig()
  },
  // beforeRouteLeave (to, from, next) {
  //   console.log('beforeRouteUpdate')
  //   next()
  // },
  // destroyed () {
  //   this.$router.beforeEach((to) => {
  //     if (['hot', 'new', 'recommend'].includes(to.name)) {
  //       this.configType = configTypeMap[to.name]
  //       this.currentPage = 1
  //       this.getIndexConfig()
  //     }
  //   })
  // },
  methods: {
    getIndexConfig () {
      this.loading = true
      axios.get('/indexConfigs', {
        params: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize,
          configType: this.configType
        }
      }).then(res => {
        this.tableData = res.list
        this.total = res.totalCount
        this.currentPage = res.currPage
        this.loading = false
      })
    },
    // 添加商品
    handleAdd () {
      this.type = 'add'
      this.$refs.addGood.open()
    },
    // 修改商品
    handleEdit (id) {
      this.type = 'edit'
      this.$refs.addGood.open(id)
    },
    // 选择项
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    // 删除
    handleDelete () {
      if (!this.multipleSelection.length) {
        Message.error('请选择项')
        return
      }
      axios.post('/indexConfigs/delete', {
        ids: this.multipleSelection.map(i => i.configId)
      }).then(() => {
        Message.success('删除成功')
        this.getIndexConfig()
      })
    },
    // 单个删除
    handleDeleteOne (id) {
      axios.post('/indexConfigs/delete', {
        ids: [id]
      }).then(() => {
        Message.success('删除成功')
        this.getIndexConfig()
      })
    },
    changePage (val) {
      this.currentPage = val
      this.getIndexConfig()
    }
  }
}
</script>

<style scoped>
.index-container {
  min-height: 100%;
}

.el-card.is-always-shadow {
  min-height: 100% !important;
}
</style>
