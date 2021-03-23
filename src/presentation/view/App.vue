<template>
  <v-app id="app">
    <!-- Sizes your content based upon application components -->
    <v-content>
      <v-container fluid>
        <!-- todo: Activate keep-alive once this is fixed: https://github.com/vuejs/vue-loader/issues/1332 -->
        <!--keep-alive-->
        <h1 v-if="isLoggedIn === null">Loading..</h1>
        <Login v-else-if="!isLoggedIn" />
        <router-view v-else :key="$route.fullPath" />
        <!--/keep-alive-->
      </v-container>
    </v-content>

    <v-footer app>
      <!-- -->
    </v-footer>

    <ErrorModalComponent />
  </v-app>
</template>

<style lang="scss">
@import "src/presentation/view/App";
</style>
<script lang="ts" src="./App.ts"></script>
