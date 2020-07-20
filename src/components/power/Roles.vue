<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              @close="showSetRightDialogClosed"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="分配权限对话框" :visible.sync="showSetRightDialogVisible" width="50%">
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        showSetRightDialogVisible: false,
        rightslist: [],
        roleList: [],
        treeProps: {
          label: "authName",
          children: "children"
        },
        defKeys: [],
        // 当前即将分配权限的角色ID
        roleId: ""
      };
    },
    created() {
      this.getRolesList();
    },
    methods: {
      async getRolesList() {
        const { data: res } = await this.$http.get("roles");
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户列表失败");
        }
        this.roleList = res.data;
        console.log(this.roleList);
      },
      async removeRightById(role, rightId) {
        const confirmResult = await this.$confirm(
          "此操作将永久删除该文件, 是否继续?",
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
        console.log("确认了删除操作");
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("删除权限失败");
        }
        role.children = res.data;
      },
      async showSetRightDialog(role) {
        this.roleId = role.id;
        const { data: res } = await this.$http.get("rights/tree");
        if (res.meta.status !== 200) {
          this.$message.error("获取权限列表失败");
        }
        this.rightslist = res.data;
        // console.log(this.rightslist);
        this.getLeafKeys(role, this.defKeys);
        this.showSetRightDialogVisible = true;
      },
      // 通过递归的形式获取角色下所有三级权限的id，并保存带defKeys中
      getLeafKeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id);
        }
        node.children.forEach(item => this.getLeafKeys(item, arr));
      },
      showSetRightDialogClosed() {
        this.defKeys = [];
      },
      // 点击为角色分配权限
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        const idStr = keys.join(",");
        const { data: res } = await this.$http.post(
          `roles/${this.roleId}/rights`,
          { rids: idStr }
        );
        if (res.meta.status !== 200) {
          this.$message.error("分配权限失败");
        }
        this.$message.success("分配权限成功");
        this.getRolesList();
        this.showSetRightDialogVisible = false;
      }
    }
  };
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>