<template>
  <v-dialog
      v-model="dialog"
      persistent
      width="500"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          dark
          v-bind="attrs"
          v-on="on"
          plain
          text
          small
          style="float: right;"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="headline">
        Edit external email
      </v-card-title>

      <v-card-text>
        <v-text-field
            color="var(--primary--text)"
            label="E-Mail address"
            v-model="emailAddressModel"
        ></v-text-field>
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
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
            class="primary-btn"
            @click="save"
            :disabled="emailAddressModel.length === 0"
        >
          Edit
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn  @click="cancelDialog()"
                text plain small>
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import {MyVue} from "@/MyVue";
import {Prop, Watch} from "vue-property-decorator";
import {Token} from "@/domain/Token/Token";

@Component({
  components: {}
})
export default class EditExternalEmailDialogComponent extends MyVue {
  name = "EditExternalEmailDialogComponent";

  dialog = false;

  @Prop()
  token!:Token;

  @Prop()
  jobId!:string | null;

  emailAddressModel = "";

  commentModel = true;
  approvalModel = true;
  downloadModel = true;

  constructor() {
    super();
  }

  created() {
    this.updateModels(this.token);
  }

  private updateModels(token:Token) {
    this.emailAddressModel = token.email;

    this.commentModel = token.rights.find(value => value == "COMMENT") !== undefined;
    this.approvalModel = token.rights.find(value => value == "APPROVAL") !== undefined;
    this.downloadModel = token.rights.find(value => value == "DOWNLOAD") !== undefined;
  }

  cancelDialog() {
    this.updateModels(this.token);
    this.dialog = false; // close dialog
  }

  @Watch('token')
  onTokenChanged(val: Token, oldVal: Token) {
    this.updateModels(val);
  }

  save() {
    if(this.jobId == null) {
      throw new Error("JobId cannot be null here!");
    }
    Container().getTokenService().updateToken(this.jobId, this.createTokenObject()).subscribe(result => {
      console.log("result of Container().getTokenService().updateToken");
      console.log(result);

      if(result === undefined) {
        Container().getErrorService().setError("Failed to edit external email!");
      } else {
        this.cancelDialog();
        this.$emit('update-token', result);
      }
    });
  }

  private createTokenObject(): Token
  {
    const token = Object.assign({}, this.token); // copy old token object

    token.email = this.emailAddressModel;

    token.rights = [];
    if(this.commentModel) {
      token.rights.push("COMMENT");
    }
    if(this.approvalModel) {
      token.rights.push("APPROVAL");
    }
    if(this.downloadModel) {
      token.rights.push("DOWNLOAD");
    }

    return token;
  }

}
</script>

<style scoped lang="scss">
.my-switch {
  margin: 21px!important;
}
</style>
