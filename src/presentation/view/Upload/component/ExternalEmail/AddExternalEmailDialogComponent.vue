<template>
  <div class="add-external-email-dialog">
    <v-dialog
        v-model="dialog"
        persistent
        width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            color="green lighten-2"
            dark
            v-bind="attrs"
            v-on="on"
        >
          Add External email
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline">
          Add external email
        </v-card-title>

        <v-card-text>
          <v-text-field
              label="E-Mail address"
              v-model="emailAddressModel"
          ></v-text-field>
          <div class="my-switch">
          <v-switch
              v-model="commentModel"
              class="my-switch"
              label="COMMENT"
          ></v-switch>
          </div>
          <div class="my-switch">
          <v-switch
              v-model="approvalModel"
              class="my-switch"
              label="APPROVAL"
          ></v-switch>
          </div>
          <div class="my-switch">
          <v-switch
              v-model="downloadModel"
              class="my-switch"
              label="DOWNLOAD"
          ></v-switch>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
              color="primary"
              @click="save"
              :disabled="emailAddressModel.length === 0"
          >
            Add
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn outlined @click="cancelDialog()" text>
            Cancel ff
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import {MyVue} from "@/MyVue";
import {Token} from "@/domain/Token/Token";
import {Prop} from "vue-property-decorator";

@Component({
  components: {}
})
export default class AddExternalEmailDialogComponent extends MyVue {
  name = "AddExternalEmailDialogComponent";

  dialog = false;

  @Prop()
  jobId!:string | null;

  emailAddressModel = "";

  commentModel = true;
  approvalModel = true;
  downloadModel = true;

  constructor() {
    super();

  }

  cancelDialog() {
    this.resetDialog();
    this.dialog = false; // close dialog
  }

  save() {
    if(this.jobId == null) {
      throw new Error("JobId cannot be null here!");
    }
    Container().getTokenService().addToken(this.jobId, this.createTokenObject()).subscribe(result => {
      console.log("result of Container().getTokenService().addToken");
      console.log(result);

      if(result === undefined) {
        Container().getErrorService().setError("Failed to add external email!");
      } else {
        this.resetDialog();
        this.dialog = false;
        this.$emit('add-token', result);
      }
    });
  }

  private createTokenObject(): Token
  {
    const token = {
        "email": this.emailAddressModel
    } as Token;

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

  private resetDialog() {
    this.emailAddressModel = "";
    this.commentModel = this.approvalModel = this.downloadModel = true;
  }

}
</script>

<style scoped lang="scss">
.my-switch {
  margin: 21px!important;
}
</style>
