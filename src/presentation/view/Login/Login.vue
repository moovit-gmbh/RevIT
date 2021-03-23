<template>
  <div class="login">
    <RecoverFormComponent
        v-if="authPageToDisplay===LoginFormType.Recover"
        @update-auth-page-to-display="updateAuthPageToDisplay"
    />
    <ResetPasswordEmailFormComponent
        v-if="authPageToDisplay===LoginFormType.ResetPasswordMail"
        @update-auth-page-to-display="updateAuthPageToDisplay"
    />
    <ResetPasswordFormComponent
        v-if="authPageToDisplay===LoginFormType.ResetPassword"
        @update-auth-page-to-display="updateAuthPageToDisplay"
    />
    <TwoFactorAuthFormComponent
        v-if="authPageToDisplay===LoginFormType.TwoFactorAuth"
        @update-auth-page-to-display="updateAuthPageToDisplay"
    />
    <LoginFormComponent
        v-if="authPageToDisplay===LoginFormType.Login"
        @update-auth-page-to-display="updateAuthPageToDisplay"
    />
  </div>
</template>
<script lang="ts" src="./Login.ts"></script>
<style lang="scss" scoped>
@import "src/presentation/view/Login/Login";
</style>
