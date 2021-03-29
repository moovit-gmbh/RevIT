<template>
  <div class="login">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex class="elevation-0" xs12 sm8 md4 lg3>
            <v-card
                :style="
                $vuetify.breakpoint.smAndDown
                  ? 'background: transparent !important;border: none !important;box-shadow: none !important;'
                  : 'background: transparent !important;border: none !important;box-shadow: none !important; margin-top: 30%'
              "
            >
              <v-layout row wrap align-center style="min-height: 150px">
                <v-flex xs12 class="text-center">
                  <img
                      width="125px"
                      class="mb-5 cursor-pointer"
                      :src="logo.revapp"
                  />
                </v-flex>
                <v-flex xs12 class="text-center">
                  <h1 style="font-weight: 400">Login</h1>
                </v-flex>
              </v-layout>
              <v-spacer></v-spacer>
              <v-card-text>
                <v-form>
                  <v-text-field
                      tabindex="0"
                      v-model="email"
                      prepend-icon="person"
                      name="email"
                      class="mt-3"
                      label="E-Mail"
                      type="text"
                      clearable
                      @blur="updateNamespaceList()"
                      color="revapp"
                  ></v-text-field>
                  <v-text-field
                      tabindex="0"
                      v-model="password"
                      prepend-icon="lock"
                      name="password"
                      class="mt-3"
                      color="revapp"
                      label="Passwort"
                      type="password"
                      clearable
                  ></v-text-field>
                  <v-select
                      tabindex="2"
                      v-if="namespaces.length"
                      v-model="selectedNamespace"
                      :items="namespaces"
                      prepend-icon="lock"
                      name="namespace"
                      class="mt-3"
                      color="revapp"
                      label="Namespace"
                  ></v-select>
                  <v-row>
                    <v-col cols="8">
                      <v-switch
                          v-model="rememberMe"
                          color="revapp"
                          name="rememberMe"
                          class="mt-5"
                          label="Dauerhaft eingeloggt bleiben"
                      ></v-switch>
                    </v-col>
                    <v-col cols="4">
<!--                      <v-btn
                          style="margin-top: -50px"
                          @click="passwordReset"
                          small
                          elevation="0"
                          color="authButtonSecond"
                      >Forgot Password?
                      </v-btn>-->

                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions
                  style="border-top: 0px solid var(--primary-background)"
              >
                <v-spacer></v-spacer>
                <v-btn
                    tabindex="3"
                    @click="login"
                    small
                    name="loginButton"
                    color="primary-btn"
                >Login
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </div>

</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import {MyVue} from "@/MyVue";
import {LoginFormType} from "@/presentation/view/Login/LoginFormType";
import {LoginRequestData} from "@/api/User/LoginRequestData";
import {LoginResult} from "@/api/User/LoginResult";

@Component
export default class LoginFormComponent extends MyVue {
  name = "LoginFormComponent"

  logo = {revapp: require("@/assets/logo.png")};

  email = "";
  password = "";
  rememberMe = true;

  namespaces:string[] = [];
  selectedNamespace: string | undefined = undefined;

  created() {

  }

  updateNamespaceList() {
    Container().getUserService().listNamespacesByEmail(this.email).subscribe((namespaceList:string[]) => {
      this.namespaces = namespaceList;

      if (this.namespaces.length > 0) {
        this.selectedNamespace = this.namespaces[0];
      } else {
        this.selectedNamespace = undefined;
      }
    })
  }

  passwordReset() {
    this.$emit('update-auth-page-to-display', LoginFormType.ResetPasswordMail);
  }

  login() {
    const loginRequestData = {
      email: this.email,
      password: this.password,
    } as LoginRequestData;

    // if(totp) {
    //   loginRequestData.totp = totp;
    // }

    if(this.selectedNamespace != undefined) {
      loginRequestData.namespace = this.selectedNamespace;
    }

    Container().getUserService().login(loginRequestData, this.rememberMe).subscribe(loginResult => {
      if(loginResult.isAuthorized) {
        console.log("Logged in successfully. Result:");
      } else {
        console.error("Login failed!");
        Container().getErrorService().setError("Login failed!");
      }
      console.log(loginResult);
    });
  }

}
</script>

<style scoped lang="scss"></style>
