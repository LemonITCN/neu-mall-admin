<template>
  <el-card class="order-container">
    <template #header>
      <div class="header">
        <el-input
          style="width: 200px; margin-right: 10px"
          placeholder="请输入订单号"
          v-model="orderNo"
          @change="handleOption"
          size="small"
          clearable
        />
        <el-select @change="handleOption" v-model="orderStatus" size="small" style="width: 200px; margin-right: 10px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- <el-button type="primary" size="small" icon="el-icon-edit">修改订单</el-button> -->
        <el-button type="primary" size="small" icon="el-icon-s-home" @click="handleConfig()">配货完成</el-button>
        <el-button type="primary" size="small" icon="el-icon-s-home" @click="handleSend()">出库</el-button>
        <el-button type="danger" size="small" icon="el-icon-delete" @click="handleClose()">关闭订单</el-button>
      </div>
    </template>
    <el-table
      v-loading="loading"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="orderNo"
        label="订单号"
      >
      </el-table-column>
      <el-table-column
        prop="totalPrice"
        label="订单总价"
      >
      </el-table-column>
      <el-table-column
        prop="orderStatus"
        label="订单状态"
      >
        <template #default="scope">
          <span>{{ orderMap(scope.row.orderStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="payType"
        label="支付方式"
      >
        <template #default='scope'>
          <span v-if="scope.row.payType == 1">微信支付</span>
          <span v-else-if="scope.row.payType == 2">支付宝支付</span>
          <span v-else>未支付</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
      >
      </el-table-column>
      <el-table-column
        label="操作"
      >
        <template #default="scope">
          <el-popconfirm
            v-if="scope.row.orderStatus == 1"
            title="确定配货完成吗？"
            @confirm="handleConfig(scope.row.orderId)"
          >
            <template #reference>
              <a style="cursor: pointer; margin-right: 10px">配货完成</a>
            </template>
          </el-popconfirm>
          <el-popconfirm
            v-if="scope.row.orderStatus == 2"
            title="确定出库吗？"
            @confirm="handleSend(scope.row.orderId)"
          >
            <template #reference>
              <a style="cursor: pointer; margin-right: 10px">出库</a>
            </template>
          </el-popconfirm>
          <el-popconfirm
            v-if="!(scope.row.orderStatus == 4 || scope.row.orderStatus < 0)"
            title="确定关闭订单吗？"
            @confirm="handleClose(scope.row.orderId)"
          >
            <template #reference>
              <a style="cursor: pointer; margin-right: 10px">关闭订单</a>
            </template>
          </el-popconfirm>
          <router-link :to="{ path: '/order_detail', query: { id: scope.row.orderId }}">订单详情</router-link>
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
import { orderMap } from '../utils/proxy'

export default {
  name: 'Order',
  data () {
    return {
      orderMap,
      loading: false,
      tableData: [], // 数据列表
      multipleSelection: [], // 选中项
      total: 0, // 总条数
      currentPage: 1, // 当前页
      pageSize: 10, // 分页大小
      orderNo: '', // 订单号
      orderStatus: '', // 订单状态
      options: [{
        value: '',
        label: '全部'
      }, {
        value: 0,
        label: '待支付'
      }, {
        value: 1,
        label: '已支付'
      }, {
        value: 2,
        label: '配货完成'
      }, {
        value: 3,
        label: '出库成功'
      }, {
        value: 4,
        label: '交易成功'
      }, {
        value: -1,
        label: '手动关闭'
      }, {
        value: -2,
        label: '超时关闭'
      }, {
        value: -3,
        label: '商家关闭'
      }]
    }
  },
  mounted () {
    this.getOrderList()
  },
  methods: {
    getOrderList () {
      this.loading = true
      axios.get('/orders', {
        params: {
          pageNumber: this.currentPage,
          pageSize: this.pageSize,
          orderNo: this.orderNo,
          orderStatus: this.orderStatus
        }
      }).then(res => {
        this.tableData = res.list
        this.total = res.totalCount
        this.currentPage = res.currPage
        this.loading = false
      })
    },
    handleOption () {
      this.currentPage = 1
      this.getOrderList()
    },
    // 选择项
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    changePage (val) {
      this.currentPage = val
      this.getOrderList()
    },
    handleConfig (id) {
      let params
      if (id) {
        params = [id]
      } else {
        if (!this.multipleSelection.length) {
          Message.error('请选择项')
          return
        }
        params = this.multipleSelection.map(i => i.orderId)
      }
      axios.put('/orders/checkDone', {
        ids: params
      }).then(() => {
        Message.success('配货成功')
        this.getOrderList()
      })
    },
    handleSend (id) {
      let params
      if (id) {
        params = [id]
      } else {
        if (!this.multipleSelection.length) {
          Message.error('请选择项')
          return
        }
        params = this.multipleSelection.map(i => i.orderId)
      }
      axios.put('/orders/checkOut', {
        ids: params
      }).then(() => {
        Message.success('出库成功')
        this.getOrderList()
      })
    },
    handleClose (id) {
      let params
      if (id) {
        params = [id]
      } else {
        if (!this.multipleSelection.length) {
          Message.error('请选择项')
          return
        }
        params = this.multipleSelection.map(i => i.orderId)
      }
      axios.put('/orders/close', {
        ids: params
      }).then(() => {
        Message.success('关闭成功')
        this.getOrderList()
      })
    }
  }
}
</script>

<style scoped>
.order-container {
  min-height: 100%;
}

.el-card.is-always-shadow {
  min-height: 100% !important;
}
</style>
