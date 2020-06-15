<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleclick">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.path" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconfontObj[item.id]"></i>
              <!-- 文字 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavStatus('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主题区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    created() {
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem("activePath");
    },
    data() {
      return {
        menuList: [],
        iconfontObj: {
          "125": "iconfont icon-users",
          "103": "iconfont icon-tijikongjian",
          "101": "iconfont icon-shangpin",
          "102": "iconfont icon-danju",
          "145": "iconfont icon-baobiao"
        },
        isCollapse: false,
        activePath: ""
      };
    },
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push("/login");
      },
      async getMenuList() {
        const { data: res } = await this.$http.get("menus");
        console.log(res);

        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menuList = res.data;
      },
      toggleclick() {
        this.isCollapse = !this.isCollapse;
      },
      saveNavStatus(activePath) {
        window.sessionStorage.setItem("activePath", activePath);
      }
    }
  };
</script>

<style lang="less" scoped>
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        padding-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: 0;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .home-container {
    height: 100%;
  }
  .toggle-button {
    line-height: 24px;
    background-color: #4a5046;
    color: #fff;
    text-align: center;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
  .iconfont {
    margin-right: 10px;
  }
</style>