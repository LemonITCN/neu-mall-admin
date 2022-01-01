<template>
  <div class="add">
    <el-card class="add-container">
      <el-form :model="goodForm" :rules="rules" ref="goodRef" label-width="100px" class="goodForm">
        <el-form-item required label="商品分类">
          <el-cascader :placeholder="defaultCate" style="width: 300px" :props="category"
                       @change="handleChangeCate"></el-cascader>
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input style="width: 300px" v-model="goodForm.goodsName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品简介" prop="goodsIntro">
          <el-input style="width: 300px" type="textarea" v-model="goodForm.goodsIntro"
                    placeholder="请输入商品简介(100字)"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="originalPrice">
          <el-input type="number" min="0" style="width: 300px" v-model="goodForm.originalPrice"
                    placeholder="请输入商品价格"></el-input>
        </el-form-item>
        <el-form-item label="商品售卖价" prop="sellingPrice">
          <el-input type="number" min="0" style="width: 300px" v-model="goodForm.sellingPrice"
                    placeholder="请输入商品售价"></el-input>
        </el-form-item>
        <el-form-item label="商品库存" prop="stockNum">
          <el-input type="number" min="0" style="width: 300px" v-model="goodForm.stockNum"
                    placeholder="请输入商品库存"></el-input>
        </el-form-item>
        <el-form-item label="商品标签" prop="tag">
          <el-input style="width: 300px" v-model="goodForm.tag" placeholder="请输入商品小标签"></el-input>
        </el-form-item>
        <el-form-item label="上架状态" prop="goodsSellStatus">
          <el-radio-group v-model="goodForm.goodsSellStatus">
            <el-radio label="0">上架</el-radio>
            <el-radio label="1">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item required label="商品主图" prop="goodsCoverImg">
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
            <img style="width: 100px; height: 100px; border: 1px solid #e9e9e9;" v-if="goodForm.goodsCoverImg"
                 :src="goodForm.goodsCoverImg" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="详情内容">
          <div ref='editor'></div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitAdd()">{{ id ? '立即修改' : '立即创建' }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import WangEditor from 'wangeditor'
import axios from '@/utils/axios'
import { hasEmoji, localGet, uploadImgServer, uploadImgsServer } from '@/utils'
import { Message } from 'element-ui'
import { prefix } from '../utils/proxy'

export default {
  name: 'AddGood',
  data () {
    return {
      uploadImgServer,
      token: localGet('token') || '',
      id: this.$route.query.id,
      defaultCate: '',
      goodForm: {
        goodsName: '',
        goodsIntro: '',
        originalPrice: '',
        sellingPrice: '',
        stockNum: '',
        goodsSellStatus: '0',
        goodsCoverImg: '',
        tag: ''
      },
      rules: {
        goodsCoverImg: [
          {
            required: 'true',
            message: '请上传主图',
            trigger: ['change']
          }
        ],
        goodsName: [
          {
            required: 'true',
            message: '请填写商品名称',
            trigger: ['change']
          }
        ],
        originalPrice: [
          {
            required: 'true',
            message: '请填写商品价格',
            trigger: ['change']
          }
        ],
        sellingPrice: [
          {
            required: 'true',
            message: '请填写商品售价',
            trigger: ['change']
          }
        ],
        stockNum: [
          {
            required: 'true',
            message: '请填写商品库存',
            trigger: ['change']
          }
        ]
      },
      categoryId: '',
      category: {
        lazy: true,
        lazyLoad (node, resolve) {
          const {
            level = 0,
            value
          } = node
          axios.get('/categories', {
            params: {
              pageNumber: 1,
              pageSize: 1000,
              categoryLevel: level + 1,
              parentId: value || 0
            }
          }).then(res => {
            const list = res.list
            const nodes = list.map(item => ({
              value: item.categoryId,
              label: item.categoryName,
              leaf: level > 1
            }))
            resolve(nodes)
          })
        }
      },
      instance: {}
    }
  },
  mounted () {
    this.id = this.$route.query.id
    this.instance = new WangEditor(this.$refs.editor)
    this.instance.config.showLinkImg = false
    this.instance.config.showLinkImgAlt = false
    this.instance.config.showLinkImgHref = false
    this.instance.config.uploadImgMaxSize = 2 * 1024 * 1024 // 2M
    this.instance.config.uploadFileName = 'file'
    this.instance.config.uploadImgHeaders = {
      token: this.token
    }
    // 图片返回格式不同，需要自定义返回格式
    this.instance.config.uploadImgHooks = {
      // 图片上传并返回了结果，想要自己把图片插入到编辑器中
      // 例如服务器端返回的不是 { errno: 0, data: [...] } 这种格式，可使用 customInsert
      customInsert: function (insertImgFn, result) {
        // result 即服务端返回的接口
        // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
        if (result.data && result.data.length) {
          result.data.forEach(item => insertImgFn(item))
        }
      }
    }
    this.instance.config.uploadImgServer = uploadImgsServer
    Object.assign(this.instance.config, {
      onchange () {
        console.log('change')
      }
    })
    this.instance.create()
    if (this.id) {
      axios.get(`/goods/${this.id}`).then(res => {
        const {
          goods,
          firstCategory,
          secondCategory,
          thirdCategory
        } = res
        this.goodForm = {
          goodsName: goods.goodsName,
          goodsIntro: goods.goodsIntro,
          originalPrice: goods.originalPrice,
          sellingPrice: goods.sellingPrice,
          stockNum: goods.stockNum,
          goodsSellStatus: String(goods.goodsSellStatus),
          goodsCoverImg: prefix(goods.goodsCoverImg),
          tag: goods.tag,
          categoryId: goods.goodsCategoryId
        }
        this.categoryId = goods.goodsCategoryId
        this.defaultCate = `${firstCategory.categoryName}/${secondCategory.categoryName}/${thirdCategory.categoryName}`
        if (this.instance) {
          // 初始化商品详情 html
          this.instance.txt.html(goods.goodsDetailContent)
        }
      })
    }
  },
  beforeDestroy () {
    this.instance.destroy()
    this.instance = null
  },
  methods: {
    submitAdd () {
      this.$refs.goodRef.validate((vaild) => {
        if (vaild) {
          // 默认新增用 post 方法
          let httpOption = axios.post
          const params = {
            goodsCategoryId: this.categoryId,
            goodsCoverImg: this.goodForm.goodsCoverImg,
            goodsDetailContent: this.instance.txt.html(),
            goodsIntro: this.goodForm.goodsIntro,
            goodsName: this.goodForm.goodsName,
            goodsSellStatus: this.goodForm.goodsSellStatus,
            originalPrice: this.goodForm.originalPrice,
            sellingPrice: this.goodForm.sellingPrice,
            stockNum: this.goodForm.stockNum,
            tag: this.goodForm.tag
          }
          if (hasEmoji(params.goodsIntro) || hasEmoji(params.goodsName) || hasEmoji(params.tag) || hasEmoji(params.goodsDetailContent)) {
            Message.error('不要输入表情包，再输入就打死你个龟孙儿~')
            return
          }
          if (params.goodsName.length > 128) {
            Message.error('商品名称不能超过128个字符')
            return
          }
          if (params.goodsIntro.length > 200) {
            Message.error('商品简介不能超过200个字符')
            return
          }
          if (params.tag.length > 16) {
            Message.error('商品标签不能超过16个字符')
            return
          }
          if (this.id) {
            params.goodsId = this.id
            // 修改商品使用 put 方法
            httpOption = axios.put
          }
          httpOption('/goods', params).then(() => {
            Message.success(this.id ? '修改成功' : '添加成功')
            this.$router.push({ path: '/good' })
          })
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
      this.goodForm.goodsCoverImg = val.data || ''
    },
    handleChangeCate (val) {
      this.categoryId = val[2] || 0
    }
  }
}
</script>

<style scoped>
.add {
  display: flex;
}

.add-container {
  flex: 1;
  height: 100%;
}

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
