<template>
  <div class="add-external-email-dialog">
    <v-dialog v-model="dialog" persistent width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-spacer></v-spacer>
        <v-btn
          v-bind="attrs"
          v-on="on"
          style="height: 20px; width: 20px;"
          fab
          dark
          small
          color="success"
        >
          <v-icon dark small>add</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline">
          Add Public Link
        </v-card-title>

        <v-card-text>
          <v-form
            ref="validation"
            v-model="valid"
            lazy-validation
            class="mt-10"
          >
            <v-combobox
              v-model="emails"
              multiple
              dense
              filled
              outlined
              chips
              deletable-chips
              background-color="var(--input-background)"
              small-chips
              validate-on-blur
              :rules="[
                v => (!!v && v.length > 0) || 'Email is required',
                v => /.+@.+/.test(v) || 'Must be valid email'
              ]"
              color="revapp"
            ></v-combobox>
            <!--          <v-text-field-->
            <!--              color="var(&#45;&#45;primary&#45;&#45;text)"-->
            <!--              label="E-Mail address"-->
            <!--              v-model="emailAddressModel"-->
            <!--          ></v-text-field>-->
            <div class="my-switch">
              <v-switch
                v-model="commentModel"
                class="my-switch"
                label="COMMENT"
                color="var(--primary--text)"
              ></v-switch>
            </div>
            <div class="my-switch">
              <v-switch
                v-model="approvalModel"
                class="my-switch"
                label="APPROVAL"
                color="var(--primary--text)"
              ></v-switch>
            </div>
            <div class="my-switch">
              <v-switch
                v-model="downloadModel"
                class="my-switch"
                label="DOWNLOAD"
                color="var(--primary--text)"
              ></v-switch>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            class="primary-btn"
            rounded
            small
            @click="save"
            :disabled="emails.length === 0"
          >
            Add
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn @click="cancelDialog()" color="primary-btn" text plain small>
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import { MyVue } from "@/MyVue";
import { Token } from "@/domain/Token/Token";
import { Prop } from "vue-property-decorator";

@Component({
  components: {}
})
export default class AddExternalEmailDialogComponent extends MyVue {
  name = "AddExternalEmailDialogComponent";

  dialog = false;

  @Prop()
  jobId!: string | null;

  emailAddressModel = "";

  emails: string[] = [];

  commentModel = true;
  approvalModel = true;
  downloadModel = true;

  valid = true;

  constructor() {
    super();
  }

  cancelDialog() {
    this.resetDialog();
    this.dialog = false; // close dialog
  }

  save() {
    if (this.jobId == null) {
      throw new Error("JobId cannot be null here!");
    }

    const form: any = this.$refs.validation;

    if (form.validate()) {
      console.log("valid");
      for (const email of this.emails) {
        Container()
          .getTokenService()
          .addToken(this.jobId, this.createTokenObject(email))
          .subscribe(result => {
            console.log("result of Container().getTokenService().addToken");
            console.log(result);

            if (result === undefined) {
              Container()
                .getErrorService()
                .setError("Failed to add public email!");
            } else {
              this.resetDialog();
              this.dialog = false;
              this.$emit("add-token", result);
            }
          });
      }
    }
  }

  private createTokenObject(email: string): Token {
    const token = {
      email: email
    } as Token;

    token.rights = [];
    if (this.commentModel) {
      token.rights.push("COMMENT");
    }
    if (this.approvalModel) {
      token.rights.push("APPROVAL");
    }
    if (this.downloadModel) {
      token.rights.push("DOWNLOAD");
    }

    return token;
  }

  private resetDialog() {
    this.emails = [];
    this.emailAddressModel = "";
    this.commentModel = this.approvalModel = this.downloadModel = true;
  }
}
</script>

<style scoped lang="scss">
.my-switch {
  margin: 21px !important;
}
</style>
