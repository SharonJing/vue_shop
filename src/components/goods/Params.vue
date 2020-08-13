<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        cateList: [],
        cateProps: {
          value: "cat_id",
          label: "cat_name",
          children: "children",
          expandTrigger: "hover",
        },
        // 级联选择框双向绑定到的数组
        selectedCateKeys: [],
        activeName: "many",
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        editDialogVisible: false,
        addForm: {
          attr_name: "",
        },
        addFormRules: {
          attr_name: [
            { required: true, message: "请输入参数名称", trigger: "blur" },
          ],
        },
        editForm: {
          attr_name: "",
        },
        editFormRules: {
          attr_name: [
            { required: true, message: "请输入参数名称", trigger: "blur" },
          ],
        },
      };
    },
    computed: {
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true;
        }
        return false;
      },
      // 当前选中的三级分类ID
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2];
        }
        return null;
      },
      titleText() {
        if (this.activeName === "many") {
          return "动态参数";
        }
        return "静态属性";
      },
    },
    created() {
      this.getCateList();
    },
    methods: {
      // 获取所有商品分类列表
      async getCateList() {
        const { data: res } = await this.$http.get("categories");
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品列表失败");
        }
        this.cateList = res.data;
        console.log(this.cateList);
      },
      // 级联选择框中选项发生变化时触发
      async handleChange() {
        // console.log(this.selectedCateKeys);
        this.getParamsData();
      },
      // tab页签点击事件的处理函数
      handleTabClick() {
        console.log(this.activeName);
        this.getParamsData();
      },
      // 获取参数的列表数据
      async getParamsData() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
          return;
        }
        console.log(this.selectedCateKeys);
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: this.activeName },
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("获取参数列表失败");
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
          // 控制文本框的输入与隐藏
          item.inputVisible = false;
          // 控制文本框中输入的值
          item.inputValue = "";
        });
        console.log(res.data);
        if (this.activeName === "many") {
          this.manyTableData = res.data;
        } else {
          this.onlyTableData = res.data;
        }
      },
      // 监听添加对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      // 点击按钮添加参数
      addParams() {
        this.$refs.addFormRef.validate(async (valid) => {
          if (!valid) return;
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName,
            }
          );
          if (res.meta.status !== 201) {
            this.$message.error("添加参数失败");
          }
          this.$message.success("添加参数成功");
          this.addDialogVisible = false;
          this.getParamsData();
        });
      },
      // 点击按钮 展示修改的对话框
      async showEditDialog(attr_id) {
        const {
          data: res,
        } = await this.$http.get(
          `categories/${this.cateId}/attributes/${attr_id}`,
          { params: { attr_sel: this.activeName } }
        );
        if (res.meta.status !== 200) {
          this.$message.error("获取参数信息失败");
        }
        this.editForm = res.data;
        this.editDialogVisible = true;
      },
      // 监听修改对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      // 编辑参数事件
      editParams() {
        this.$refs.editFormRef.validate(async (valid) => {
          if (!valid) return;
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName,
            }
          );
          if (res.meta.status !== 200) {
            this.$message.error("修改参数信息失败");
          }
          this.$message.success("修改参数信息成功");
          this.getParamsData();
          this.editDialogVisible = false;
        });
      },
      // 删除参数事件
      async removeParams(attr_id) {
        const confirmResult = await this.$confirm(
          "此操作将永久删除该文件, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).catch((err) => err);
        if (confirmResult !== "confirm") {
          return this.$message.info("已取消了删除操作");
        }
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attr_id}`
        );
        if (res.meta.status !== 200) {
          this.$message.error("删除参数失败");
        }
        this.$message.success("删除参数成功");
        this.getParamsData();
      },
      // 鼠标点击或者摁下enter键触发的事件
      async handleInputConfirm(row) {
        if (row.inputValue.trim().length == 0) {
          row.inputValue = "";
          row.inputVisible = false;
          return;
        }
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = "";
        row.inputVisible = false;
        this.saveAttrVals(row);
      },
      // 保存参数列表
      async saveAttrVals(row) {
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(","),
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("修改参数信息失败");
        }
        this.$message.success("修改参数信息成功");
      },
      // 控制文本框的显示与隐藏
      showInput(row) {
        row.inputVisible = true;
        //控制文本框自动获取焦点   $nextTick方法的作用是当页面元素被重新渲染后才会执行回调函数中的代码
        this.$nextTick((_) => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // 删除标签事件
      handleClose(i, row) {
        row.attr_vals.splice(i, 1);
        this.saveAttrVals(row);
      },
    },
  };
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin-right: 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>