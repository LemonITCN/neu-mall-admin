<template>
  <div>
    <el-card class="category-container">
      <template slot="header">
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
          width="55"
        >
        </el-table-column>
        <el-table-column
          prop="categoryName"
          label="分类名称"
        >
        </el-table-column>
        <el-table-column
          prop="categoryRank"
          label="排序值"
          width="120"
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
          width="220"
        >
          <template slot-scope="scope">
            <a style="cursor: pointer; margin-right: 10px" @click="handleEdit(scope.row.categoryId)">修改</a>
            <a style="cursor: pointer; margin-right: 10px" @click="handleNext(scope.row)">下级分类</a>
            <el-popconfirm
              title="确定删除吗？"
              @confirm="handleDeleteOne(scope.row.categoryId)"
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
    <DialogAddCategory ref='addGood' :reload="getCategory" :type="type" :level="level" :parent_id="parentId"/>
  </div>
</template>

<script>
import DialogAddCategory from '@/components/DialogAddCategory.vue'
import axios from '@/utils/axios'
import { Message } from 'element-ui'

export default {
  name: 'Category',
  components: {
    DialogAddCategory
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
      level: 1,
      parentId: 0
    }
  },
  mounted () {
    this.getCategory()
  },
  destroyed () {
    this.$router.afterEach((to) => {
      if (['category', 'level2', 'level3'].includes(to.name)) {
        this.getCategory()
      }
    })
  },
  methods: {
    getCategory () {
      const {
        level = 1,
        parentId = 0
      } = this.$route.query
      this.loading = true
      axios.get('/categories', {
        params: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize,
          categoryLevel: level,
          parentId: parentId
        }
      }).then(res => {
        this.tableData = res.list
        this.total = res.totalCount
        this.currentPage = res.currPage
        this.loading = false
        this.level = level
        this.parentId = parentId
      })
    },
    // 添加分类
    handleAdd () {
      this.type = 'add'
      this.$refs.addGood.open()
    },
    // 修改分类
    handleEdit (id) {
      this.type = 'edit'
      this.$refs.addGood.open(id)
    },
    // 选择项
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    // 批量删除
    handleDelete () {
      if (!this.multipleSelection.length) {
        Message.error('请选择项')
        return
      }
      axios.delete('/categories', {
        data: {
          ids: this.multipleSelection.map(i => i.categoryId)
        }
      }).then(() => {
        Message.success('删除成功')
        this.getCategory()
      })
    },
    // 单个删除
    handleDeleteOne (id) {
      axios.delete('/categories', {
        data: {
          ids: [id]
        }
      }).then(() => {
        Message.success('删除成功')
        this.getCategory()
      })
    },
    changePage (val) {
      this.currentPage = val
      this.getCategory()
    },
    handleNext (item) {
      const levelNumber = item.categoryLevel + 1
      if (levelNumber === 4) {
        Message.error('没有下一级')
        return
      }
      this.$router.push({
        name: `level${levelNumber}`,
        query: {
          level: levelNumber,
          parentId: item.categoryId
        }
      })
    }
  }
}
</script>

<style scoped>
.category-container {
  min-height: 100%;
}

.el-card.is-always-shadow {
  min-height: 100% !important;
}
</style>
