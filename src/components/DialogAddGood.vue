<template>
  <el-dialog
    :title="type === 'add' ? '添加商品' : '修改商品'"
    :visible.sync="visible"
    width="400px"
    @close="handleClose"
  >
    <el-form :model="ruleForm" :rules="rules" ref="formRef" label-width="100px" class="good-form">
      <el-form-item label="商品名称" prop="name">
        <el-input type="text" v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="跳转链接" prop="link">
        <el-input type="text" v-model="ruleForm.link"></el-input>
      </el-form-item>
      <el-form-item label="商品编号" prop="id">
        <el-input type="number" min="0" v-model="ruleForm.id"></el-input>
      </el-form-item>
      <el-form-item label="排序值" prop="sort">
        <el-input type="number" v-model="ruleForm.sort"></el-input>
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
  name: 'DialogAddHotGood',
  props: {
    type: String,
    configType: Number,
    reload: Function
  },
  data () {
    return {
      visible: false,
      ruleForm: {
        name: '',
        link: '',
        id: '',
        sort: ''
      },
      rules: {
        name: [
          {
            required: 'true',
            message: '名称不能为空',
            trigger: ['change']
          }
        ],
        id: [
          {
            required: 'true',
            message: '编号不能为空',
            trigger: ['change']
          }
        ],
        sort: [
          {
            required: 'true',
            message: '排序不能为空',
            trigger: ['change']
          }
        ]
      },
      id: ''
    }
  },
  methods: {
    getDetail (id) {
      axios.get(`/indexConfigs/${id}`).then(res => {
        this.ruleForm = {
          name: res.configName,
          id: res.goodsId,
          link: res.redirectUrl,
          sort: res.configRank
        }
      })
    },
    open (id) {
      this.visible = true
      if (id) {
        this.id = id
        this.getDetail(id)
      } else {
        this.ruleForm = {
          name: '',
          id: '',
          link: '',
          sort: ''
        }
      }
    },
    close () {
      this.visible = false
    },
    handleClose () {
      this.$refs.formRef.resetFields()
    },
    submitForm () {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          if (hasEmoji(this.ruleForm.name) || hasEmoji(this.ruleForm.link)) {
            Message.error('不要输入表情包，再输入就打死你个龟孙儿~')
            return
          }
          if (this.ruleForm.name.length > 128) {
            Message.error('商品名称不能超过128个字符')
            return
          }
          if (this.ruleForm.sort < 0 || this.ruleForm.sort > 200) {
            Message.error('排序值不能小于 0 或大于 200')
            return
          }
          if (this.type === 'add') {
            axios.post('/indexConfigs', {
              configType: this.configType || 3,
              configName: this.ruleForm.name,
              redirectUrl: this.ruleForm.link,
              goodsId: this.ruleForm.id,
              configRank: this.ruleForm.sort
            }).then(() => {
              Message.success('添加成功')
              this.visible = false
              if (this.reload) this.reload()
            })
          } else {
            axios.put('/indexConfigs', {
              configId: this.id,
              configType: this.configType || 3,
              configName: this.ruleForm.name,
              redirectUrl: this.ruleForm.link,
              goodsId: this.ruleForm.id,
              configRank: this.ruleForm.sort
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

<style scoped>
</style>
