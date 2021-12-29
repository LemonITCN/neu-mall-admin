<template>
  <el-dialog
    :title="type === 'add' ? '添加分类' : '修改分类'"
    :visible.sync="visible"
    width="400px"
    @close="handleClose"
  >
    <el-form :model="ruleForm" :rules="rules" ref="formRef" label-width="100px" class="good-form">
      <el-form-item label="分类名称" prop="name">
        <el-input type="text" v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="排序值" prop="rank">
        <el-input type="number" max='200' v-model="ruleForm.rank"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from '@/utils/axios'
import { hasEmoji } from '@/utils/index'
import { Message } from 'element-ui'

export default {
  name: 'DialogAddCategory',
  props: {
    type: String,
    reload: Function
  },
  data () {
    return {
      visible: false,
      categoryLevel: 1,
      parentId: 0,
      ruleForm: {
        name: '',
        rank: ''
      },
      rules: {
        name: [
          {
            required: 'true',
            message: '名称不能为空',
            trigger: ['change']
          }
        ],
        rank: [
          {
            required: 'true',
            message: '排序值不能为空',
            trigger: ['change']
          }
        ]
      },
      id: ''
    }
  },
  methods: {
    getDetail (id) {
      axios.get(`/categories/${id}`).then(res => {
        this.ruleForm = {
          name: res.categoryName,
          rank: res.categoryRank
        }
        this.parentId = res.parentId
        this.categoryLevel = res.categoryLevel
      })
    },
    open (id) {
      this.visible = true
      if (id) {
        this.id = id
        this.getDetail(id)
      } else {
        // 新增类目，从路由获取父分类id 和 分类级别
        const {
          level = 1,
          parentId = 0
        } = this.$route.query
        this.ruleForm = {
          name: '',
          rank: ''
        }
        this.parentId = parentId
        this.categoryLevel = level
      }
    },
    close () {
      this.visible = false
    },
    handleClose () {
      this.$refs.formRef.value.resetFields()
    },
    submitForm () {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          if (hasEmoji(this.ruleForm.name)) {
            Message.error('不要输入表情包，再输入就打死你个龟孙儿~')
            return
          }
          if (this.ruleForm.name.length > 16) {
            Message.error('名称不能超过16个字符')
            return
          }
          if (this.ruleForm.rank > 200) {
            Message.error('排序不能超过200')
            return
          }
          if (this.type === 'add') {
            axios.post('/categories', {
              categoryLevel: this.categoryLevel,
              parentId: this.parentId,
              categoryName: this.ruleForm.name,
              categoryRank: this.ruleForm.rank
            }).then(() => {
              Message.success('添加成功')
              this.visible = false
              if (this.reload) this.reload()
            })
          } else {
            axios.put('/categories', {
              categoryId: this.id,
              categoryLevel: this.categoryLevel,
              parentId: this.parentId,
              categoryName: this.ruleForm.name,
              categoryRank: this.ruleForm.rank
            }).then(() => {
              Message.success('修改成功')
              this.visible = false
              if (this.reload) this.reload()
            })
          }
        }
      })
    }
  }
}
</script>
