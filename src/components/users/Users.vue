<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip effect="dark" content="Top Center 分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户表单 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    created() {
      this.getUserList();
    },
    data() {
      return {
        queryInfo: {
          query: "",
          pagenum: 1,
          pagesize: 2
        },
        userList: [],
        total: 0,
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: "",
          password: "",
          email: "",
          mobile: ""
        },
        // 这是表单的验证规则对象
        addFormRules: {
          username: [
            { required: true, message: "请输入登录名称", trigger: "blur" },
            { min: 3, max: 10, message: "长度在 3 到 10个字符", trigger: "blur" }
          ],
          password: [
            { required: true, message: "请输入登录密码", trigger: "blur" },
            { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
          ],
          email: [{ required: true, message: "请输入电子邮箱", trigger: "blur" }],
          mobile: [{ required: true, message: "请输入电话号码", trigger: "blur" }]
        }
      };
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get("users", {
          params: this.queryInfo
        });
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户列表失败");
        }
        this.userList = res.data.users;
        this.total = res.data.total;
        console.log(res);
      },
      handleSizeChange(newsize) {
        this.queryInfo.pagesize = newsize;
        this.getUserList();
      },
      handleCurrentChange(newpage) {
        this.queryInfo.pagenum = newpage;
        this.getUserList();
      },
      async changeUserState(userinfo) {
        const { data: res } = await this.$http.put(
          `users/${userinfo.id}/state/${userinfo.mg_state}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户状态失败");
          userinfo.mg_state = !userinfo.mg_state;
        }
        this.$message.success("更新用户状态成功");
      }
    }
  };
</script>

<style lang="less" scoped>
  .el-pagination {
    margin-top: 15px;
  }
</style>