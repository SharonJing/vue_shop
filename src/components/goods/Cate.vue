<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">操作</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加商品分类对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addCatDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form
        :model="addCateDialogForm"
        :rules="addCateDialogRules"
        ref="addCateDialogFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateDialogForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentcateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5,
        },
        // 商品分类的数据列表，默认为空
        catelist: [],
        // 总数据条数
        total: 0,
        // 为columns指定对应的列
        columns: [
          {
            label: "分类名称",
            prop: "cat_name",
          },
          {
            label: "是否有效",
            // 表示将当前列定义为模板列
            type: "template",
            // 表示当前这一列使用模板名称
            template: "isok",
          },
          {
            label: "排序",
            // 表示将当前列定义为模板列
            type: "template",
            // 表示当前这一列使用模板名称
            template: "order",
          },
          {
            label: "操作",
            // 表示将当前列定义为模板列
            type: "template",
            // 表示当前这一列使用模板名称
            template: "option",
          },
        ],
        addCatDialogVisible: false,
        // 添加分类表单的数据对象
        addCateDialogForm: {
          // 将要添加的分类名称
          cat_name: "",
          // 父级分类的id
          cat_pid: 0,
          // 分类的等级
          cat_level: 0,
        },
        // 添加分类表单的验证规则对象
        addCateDialogRules: {
          cat_name: [
            { required: true, message: "请输入分类名称", tigger: "blur" },
          ],
        },
        // 父级分类的数据列表
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          value: "cat_id",
          label: "cat_name",
          children: "children",
          expandTrigger: "hover",
        },
        // 选中的父级分类的ID数组
        selectedKeys: [],
      };
    },
    created() {
      this.getCateList();
    },
    methods: {
      // 获取商品分类数据
      async getCateList() {
        const { data: res } = await this.$http.get("categories", {
          params: this.queryInfo,
        });
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品列表失败");
        }
        console.log(res.data);
        // 为商品数据列表赋值
        this.catelist = res.data.result;
        // 为总数据条数赋值
        this.total = res.data.total;
      },
      // 监听pagesize改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getCateList();
      },
      // 监听pagenum的改变
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum;
        this.getCateList();
      },
      addCateDialog() {
        // 先获取父级分类数据列表
        this.getParentCateList();
        // 再展示对话框
        this.addCatDialogVisible = true;
      },
      // 获取父级分类的数据列表
      async getParentCateList() {
        const { data: res } = await this.$http.get("categories", {
          params: { type: 2 },
        });
        if (res.meta.status !== 200) {
          return this.$message.error("获取数据列表失败");
        }
        this.parentCateList = res.data;
      },
      // 选择项发生变化触发这个函数
      parentcateChanged() {
        if (this.selectedKeys.length > 0) {
          // 父级分类的等级
          this.addCateDialogForm.cat_pid = this.selectedKeys[
            this.selectedKeys.length - 1
          ];
          // 当前分类的等级
          this.addCateDialogForm.cat_level = this.selectedKeys.length;
        } else {
          this.addCateDialogForm.cat_pid = 0;
          this.addCateDialogForm.cat_level = 0;
        }
      },
      addCate() {
        this.$refs.addCateDialogFormRef.validate(async (valid) => {
          if (!valid) return;
          const { data: res } = await this.$http.post(
            "categories",
            this.addCateDialogForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加分类失败");
          }
          this.$message.success("添加分类成功");
          this.getCateList();
          this.addCatDialogVisible = false;
        });
      },
      addCateDialogClose() {
        this.$refs.addCateDialogFormRef.resetFields();
        this.selectedKeys = [];
        this.addCateDialogForm.cat_level = 0;
        this.addCateDialogForm.cat_pid = 0;
      },
    },
  };
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
