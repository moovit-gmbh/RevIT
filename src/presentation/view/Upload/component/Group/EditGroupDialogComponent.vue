<template>
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
        Edit
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="headline">
        Edit group "{{group.name}}"
      </v-card-title>

      <v-card-text>
        <div class="my-switch">
          <v-switch
              v-model="viewModel"
              class="my-switch"
              label="VIEW"
          ></v-switch>
        </div>
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
        <div class="my-switch">
           <v-switch
               v-model="modifyModel"
               class="my-switch"
               label="MODIFY"
           ></v-switch>
         </div>
         <div class="my-switch">
           <v-switch
               v-model="shareModel"
               class="my-switch"
               label="SHARE"
           ></v-switch>
         </div>
         <div class="my-switch">
           <v-switch
               v-model="deleteModel"
               class="my-switch"
               label="DELETE"
           ></v-switch>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
            color="primary"
            @click="save"
        >
          Edit
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn outlined @click="cancelDialog()" text>
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
import SelectNamespaceComponent from "@/presentation/view/Upload/component/SelectNamespaceComponent.vue";
import {Prop, Watch} from "vue-property-decorator";
import {GroupWithRights} from "@/domain/Group/GroupWithRights";

@Component({
  components: {SelectNamespaceComponent}
})
export default class EditGroupDialogComponent extends MyVue {
  name = "EditGroupDialogComponent";

  dialog = false;

  @Prop()
  group!:GroupWithRights;

  @Prop()
  jobId!:string | null;

  viewModel = true;
  commentModel = true;
  approvalModel = true;
  downloadModel = true;
  modifyModel = true;
  shareModel = true;
  deleteModel = true;

  constructor() {
    super();
  }

  created() {
    this.updateModels(this.group);
  }

  private updateModels(group:GroupWithRights) {
    this.viewModel = group.rights.find(value => value == "VIEW") !== undefined;
    this.commentModel = group.rights.find(value => value == "COMMENT") !== undefined;
    this.approvalModel = group.rights.find(value => value == "APPROVAL") !== undefined;
    this.downloadModel = group.rights.find(value => value == "DOWNLOAD") !== undefined;
    this.modifyModel = group.rights.find(value => value == "MODIFY") !== undefined;
    this.shareModel = group.rights.find(value => value == "SHARE") !== undefined;
    this.deleteModel = group.rights.find(value => value == "DELETE") !== undefined;
  }

  cancelDialog() {
    this.updateModels(this.group);
    this.dialog = false; // close dialog
  }

  @Watch('group')
  onGroupChanged(val: GroupWithRights, oldVal: GroupWithRights) {
    this.updateModels(val);
  }

  save() {
    if(this.jobId == null) {
      throw new Error("JobId cannot be null here!");
    }
    Container().getGroupService().updateGroup(this.jobId, this.createGroupObject()).subscribe(result => {
      console.log("result of Container().getGroupService().updateGroup");
      console.log(result);

      if(result === undefined) {
        Container().getErrorService().setError("Failed to edit group \"" + this.group.name + "\"!");
      } else {
        this.cancelDialog();
        this.$emit('update-group', result);
      }
    });
  }

  private createGroupObject(): GroupWithRights
  {
    const group = Object.assign({}, this.group); // copy old group object

    group.rights = [];
    if(this.viewModel) {
      group.rights.push("VIEW");
    }
    if(this.commentModel) {
      group.rights.push("COMMENT");
    }
    if(this.approvalModel) {
      group.rights.push("APPROVAL");
    }
    if(this.downloadModel) {
      group.rights.push("DOWNLOAD");
    }
    if(this.modifyModel) {
      group.rights.push("MODIFY");
    }
    if(this.shareModel) {
      group.rights.push("SHARE");
    }
    if(this.deleteModel) {
      group.rights.push("DELETE");
    }

    return group;
  }

}
</script>

<style scoped lang="scss">
.my-switch {
  margin: 21px!important;
}
</style>
