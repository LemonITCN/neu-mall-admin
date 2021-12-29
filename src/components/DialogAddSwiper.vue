<template>
  <el-dialog
    :title="type === 'add' ? '添加轮播图' : '修改轮播图'"
    :visible.sync="visible"
    width="400px"
    @close="handleClose"
  >
    <el-form :model="ruleForm" :rules="rules" ref="formRef" label-width="100px" class="good-form">
      <el-form-item label="图片" prop="url">
        <el-upload
          class="avatar-uploader"
          :action="uploadImgServer"
          accept="jpg,jpeg,png"
          :headers="{
            token: token
          }"
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :on-success="handleUrlSuccess"
        >
          <img style="width: 200px; height: 100px; border: 1px solid #e9e9e9;" v-if="ruleForm.url" :src="ruleForm.url"
               class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="跳转链接" prop="link">
        <el-input type="text" v-model="ruleForm.link"></el-input>
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
import { hasEmoji, localGet, uploadImgServer } from '@/utils'
import { Message } from 'element-ui'

export default {
  name: 'DialogAddSwiper',
  props: {
    type: String,
    reload: Function
  },
  data () {
    return {
      uploadImgServer,
      token: localGet('token') || '',
      visible: false,
      ruleForm: {
        url: '',
        link: '',
        sort: ''
      },
      rules: {
        url: [
          {
            required: 'true',
            message: '图片不能为空',
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
      axios.get(`/carousels/${id}`).then(res => {
        this.ruleForm = {
          url: res.carouselUrl,
          link: res.redirectUrl,
          sort: res.carouselRank
        }
      })
    },
    handleBeforeUpload (file) {
      const sufix = file.name.split('.')[1] || ''
      if (!['jpg', 'jpeg', 'png'].includes(sufix)) {
        Message.error('请上传 jpg、jpeg、png 格式的图片')
        return false
      }
    },
    handleUrlSuccess (val) {
      this.ruleForm.url = val.data || ''
    },
    open (id) {
      this.visible = true
      console.log('this.svisiable', this.visible)
      if (id) {
        this.id = id
        this.getDetail(id)
      } else {
        this.ruleForm = {
          url: '',
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
      console.log(this.$refs.formRef.validate)
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          if (hasEmoji(this.ruleForm.link)) {
            Message.error('不要输入表情包，再输入就打死你个龟孙儿~')
            return
          }
          if (this.type === 'add') {
            axios.post('/carousels', {
              carouselUrl: this.ruleForm.url,
              redirectUrl: this.ruleForm.link,
              carouselRank: this.ruleForm.sort
            }).then(() => {
              Message.success('添加成功')
              this.visible = false
              if (this.reload) this.reload()
            })
          } else {
            axios.put('/carousels', {
              carouselId: this.id,
              carouselUrl: this.ruleForm.url,
              redirectUrl: this.ruleForm.link,
              carouselRank: this.ruleForm.sort
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
.avatar-uploader {
  width: 100px;
  height: 100px;
  color: #ddd;
  font-size: 30px;
}

.avatar-uploader-icon {
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid #e9e9e9;
  padding: 32px 17px;
}
</style>
