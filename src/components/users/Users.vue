<template>
  <div>
    <!-- 面包屑导航 -->
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
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="Top Center 分配角色" placement="top">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
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
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogclose">
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
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" @close="editDialogClose">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色对话框"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoledialogClosed"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleslist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id "
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
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
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/;
        if (regEmail.test(value)) {
          return cb();
        }
        cb(new Error("请输入合法的邮箱地址"));
      };
      var checkMobile = (rule, value, cb) => {
        const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/;
        if (regMobile.test(value)) {
          return cb();
        }
        cb(new Error("请输入合法的电话号码"));
      };
      return {
        queryInfo: {
          query: "",
          pagenum: 1,
          pagesize: 2
        },
        userList: [],
        total: 0,
        // 控制添加用户对话框的显示与隐藏
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
          email: [
            { required: true, message: "请输入电子邮箱", trigger: "blur" },
            { validator: checkEmail, trigger: "blur" }
          ],
          mobile: [
            { required: true, message: "请输入电话号码", trigger: "blur" },
            { validator: checkMobile, trigger: "blur" }
          ]
        },
        editDialogVisible: false,
        editForm: {},
        setRoleDialogVisible: false,
        // 需要被分配角色的用户信息
        userInfo: {},
        // 所有角色的列表
        roleslist: [],
        // 已选中的角色值
        selectRoleId: ""
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
      },
      // 表单关闭重置数据
      addDialogclose() {
        this.$refs.addFormRef.resetFields();
      },
      // 添加新用户
      addUsers() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          // console.log(valid);
          const { data: res } = await this.$http.post("users", this.addForm);
          if (res.meta.status !== 201) {
            this.$message.error("添加用户失败");
          }
          this.$message.success("添加用户成功");
          this.addDialogVisible = false;
          this.getUserList;
        });
      },
      async showEditDialog(id) {
        this.editDialogVisible = true;
        const { data: res } = await this.$http.get(`users/${id}`);
        if (res.meta.status != 200) {
          this.$message.error("修改用户信息失败");
        }
        this.editForm = res.data;
      },
      editDialogClose() {
        this.$refs.editFormRef.resetFields();
      },
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const { data: res } = await this.$http.put(
            `users/${this.editForm.id}`,
            {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            }
          );
          if (res.meta.status !== 200) {
            return this.$message.error("更新用户失败");
          }
          this.editDialogVisible = false;
          this.$message.success("更新用户成功");
          this.getUserList();
        });
      },
      async removeUserById(id) {
        const confirmResult = await this.$confirm(
          "此操作将永久删除该用户, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).catch(err => err);
        if (confirmResult !== "confirm") {
          return this.$message.info("取消了删除操作");
        }
        const { data: res } = await this.$http.delete(`users/${id}`);
        if (res.meta.status !== 200) {
          this.$message.error("删除失败");
        }
        this.$message.success("删除成功");
        this.getUserList();
      },
      // 分配角色的对话框
      async setRole(userInfo) {
        const { data: res } = await this.$http.get("roles");
        if (res.meta.status !== 200) {
          this.$message.error("获取用户列表失败");
        }
        this.roleslist = res.data;
        this.userInfo = userInfo;
        this.setRoleDialogVisible = true;
      },
      async saveRoleInfo() {
        if (!this.selectRoleId) {
          this.$message.error("请选择要分配的角色");
        }
        const { data: res } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          {
            rid: this.selectRoleId
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色失败");
        }
        this.$message.success("更新角色成功");
        this.getUserList();
        this.setRoleDialogVisible = false;
      },
      setRoledialogClosed() {
        this.selectRoleId = "";
        this.userInfo = {};
      }
    }
  };
</script>

<style lang="less" scoped>
  .el-pagination {
    margin-top: 15px;
  }
</style>