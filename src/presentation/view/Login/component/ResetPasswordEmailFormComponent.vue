<template>
  <div>
    <v-content>
      <v-container fill-height fluid>
        <v-layout align-center justify-center>
          <v-flex class="elevation-0" lg3 md4 sm8 xs12>
            <v-layout style="min-height: 150px">
              <v-flex class="text-center" xs12>
                <img
                    :src="require('@/assets/logo.png')"
                    alt="RevApp logo"
                    class="mb-5 cursor-pointer"
                    width="125px"
                />
              </v-flex>
            </v-layout>
            <v-spacer></v-spacer>
            <v-card-text class="mt-10">
              <v-row justify="center">
                <v-col cols="12">
                  <h2 style="font-size: 19px">
                    Forgot your password? We've got you covered 💪
                  </h2>
                  <p class="mt-2">
                    Type your email address below and we'll get you back on
                    track in no time
                  </p>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="12">
                  <v-form
                      ref="validationEmail"
                      v-model="valid"
                      lazy-validation
                      @submit="formSubmit"
                  >
                    <v-text-field
                        ref="initFocus"
                        v-model="email"
                        :rules="[
                            (v) => !!v || 'This field is required',
                            (v) =>
                              /.+@.+/.test(v) || 'Must be valid email',
                          ]"
                        :validate-on-blur="true"
                        color="revapp"
                        label="Insert email"
                    ></v-text-field>
                  </v-form>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions
                style="border-top: 0px solid var(--primary-background)"
            >
              <v-row dense>
                <v-col cols="12">
                  <v-btn
                      block
                      color="authButtonConfirm"
                      name="actionButton"
                      @click="passwordResetEmail"
                  >Send Recover Email
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-btn
                      color="authButtonSecond"
                      elevation="0"
                      name="cancelButton"
                      small
                      style="float: left"
                      @click="cancel"
                  >Cancel
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import { MyVue } from "@/MyVue";
import { Emit } from "vue-property-decorator";
import { LoginFormType } from "@/presentation/view/Login/LoginFormType";
import Container from "@/Container";

@Component
export default class ResetPasswordEmailFormComponent extends MyVue {
  name = "ResetPasswordEmailFormComponent";

  valid = true;
  email = "";

  created() {
  }

  formSubmit(e: Event) {
    e.preventDefault();
  }

  passwordResetEmail() {
    const form: any = this.$refs.validationEmail;
    if (form.validate()) {
      Container().getUserService().sendPasswordResetEmail(this.email).subscribe(isRequestSuccessful => {
        if (isRequestSuccessful) {
          console.log("Password: " + this.email + " Request Successful");
          this.cancel();
        } else {
          Container().getErrorService().setError("Password Reset failed!");
        }
      });
    }
  }

  @Emit("update-auth-page-to-display")
  cancel() {
    return LoginFormType.Login;
  }
}
</script>

<style lang="scss" scoped></style>
