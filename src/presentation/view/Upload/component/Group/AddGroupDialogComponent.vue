<template>
  <div class="add-group-dialog">
    <v-dialog
        v-model="dialog"
        persistent
        max-width="500px"
    >
      <template v-slot:activator="{ on, attrs }">
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
          Add group
        </v-card-title>

        <v-card-text>
          <v-stepper v-model="e1">
            <v-stepper-header>
              <v-stepper-step
                  :complete="e1 > 1"
                  step="1"
                  color="var(--primary)"
              >
                Choose Namespace
              </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step
                  :complete="e1 > 2"
                  step="2"
                  color="var(--primary)"
              >
                Select Group
              </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step step="3" color="var(--primary)">
                Set rights
              </v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card
                    class="mb-12"
                    min-height="200px"
                >
                  <SelectNamespaceComponent
                      v-bind:value.sync="namespace"
                      @update:value="onNamespaceUpdate"
                  />
                </v-card>
              </v-stepper-content>

              <v-stepper-content step="2">
                <v-card
                    min-height="200px"
                >
                  <p v-if="namespace">These are the groups of namespace "{{namespace}}".</p>
                  <p>Please select one or go back to choose a different namespace.</p>
                  <ul class="group-list" v-if="availableGroupList">
                    <li v-for="group in availableGroupList">{{group.name}}
                      <v-btn class="authButtonSecond" @click="selectGroup(group)">Select</v-btn>
                    </li>
                  </ul>
                  <p v-if="availableGroupList === null || availableGroupList.length === 0" class="error--text">
                    No groups found
                  </p>
                </v-card>
              </v-stepper-content>

              <v-stepper-content step="3">
                <v-card
                    class="mb-12"
                    min-height="200px"
                >
                  <p v-if="namespace && selectedGroup">You have selected group "{{selectedGroup.name}}" of namespace "{{namespace}}".</p>
                  <p>Please set the rights and then press the save button.</p>

                  <div class="my-switch">
                    <v-switch
                        v-model="viewModel"
                        class="my-switch"
                        label="VIEW"
                        color="var(--primary--text)"
                    ></v-switch>
                  </div>
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
                  <div class="my-switch">
                    <v-switch
                        v-model="modifyModel"
                        class="my-switch"
                        label="MODIFY"
                        color="var(--primary--text)"
                    ></v-switch>
                  </div>
                  <div class="my-switch">
                    <v-switch
                        v-model="shareModel"
                        class="my-switch"
                        label="SHARE"
                        color="var(--primary--text)"
                    ></v-switch>
                  </div>
                  <div class="my-switch">
                    <v-switch
                        v-model="deleteModel"
                        class="my-switch"
                        label="DELETE"
                        color="var(--primary--text)"
                    ></v-switch>
                  </div>
                </v-card>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
              v-if="e1 === 1"
              class="primary-btn"
              @click="e1 = 2"
              :disabled="namespace === null"
          >
            Next
          </v-btn>

          <v-btn
              v-if="e1 === 2"
              class="primary-btn"
              @click="e1 = 3"
              :disabled="selectedGroup === null"
          >
            Next
          </v-btn>

          <v-btn
              v-if="e1 === 3"
              class="primary-btn"
              @click="save"
              :disabled="selectedGroup === null"
          >
            Save
          </v-btn>

          <v-btn outlined v-if="e1 === 2" @click="e1 = 1" class="primary-btn">
            Go back
          </v-btn>

          <v-btn outlined v-if="e1 === 3" @click="e1 = 2" class="primary-btn">
            Go back
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn @click="cancelDialog()" text plain small>
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
import {MyVue} from "@/MyVue";
import SelectNamespaceComponent from "@/presentation/view/Upload/component/SelectNamespaceComponent.vue";
import {Group} from "@/domain/Group/Group";
import {Prop} from "vue-property-decorator";
import {GroupWithRights} from "@/domain/Group/GroupWithRights";

@Component({
  components: {SelectNamespaceComponent}
})
export default class AddGroupDialogComponent extends MyVue {
  name = "AddGroupDialogComponent";

  // global stuff

  @Prop()
  jobId!:string | null;

  dialog = false;

  e1 = 1;

  // namespace step related
  namespace: string | null = null;

  // select group step related
  selectedGroup: Group | null = null;
  availableGroupList: Group[] | null = null;

  // set rights step related
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

  cancelDialog() {
    this.resetDialog();
    this.dialog = false; // close dialog
  }

  onNamespaceUpdate(namespace:string) {
    console.log("new namespace has been selected: " + namespace);
    console.log("loading groups of this namespace..");
    if(this.jobId === null) {
      throw new Error("jobId cannot be null here!");
    }
    Container().getGroupService().getUnusedGroupListByNamespace(this.jobId, namespace).subscribe(result => {
      if(result == undefined) {
        Container().getErrorService().setError("Failed to load groups of namespace \"" + namespace + "\"");
        console.error("failed to receive groups for namespace \"" + namespace + "\"!");
        this.availableGroupList = null;
        this.selectedGroup = null;
      } else {
        console.log("found these groups for namespace \"" + namespace + "\":");
        console.log(result);
        this.availableGroupList = this.filterOutUsers(result);
        console.log("Filtered groups:");
        console.log(this.availableGroupList);
        this.selectedGroup = null;
        this.e1 = 2; // go to step 2
      }
    })
  }

  /**
   * Besides actual groups, every user has an own group, that represents just him. This method filters these "user representing groups" out.
   * @param groupList
   * @private
   */
  private filterOutUsers(groupList: Group[]): Group[]
  {
    return groupList.filter(group => !group.name.includes("@")); // @ == group that represents an user
  }

  public selectGroup(group:Group) {
    console.log("selected group:");
    console.log(group);
    this.selectedGroup = group;
    this.e1 = 3; // go to step 3
  }

  save() {
    if(this.jobId == null) {
      throw new Error("JobId cannot be null here!");
    }
    Container().getGroupService().addGroup(this.jobId, this.createGroupObject()).subscribe(result => {
      console.log("result of Container().getGroupService().addGroup");
      console.log(result);

      if(result === undefined) {
        Container().getErrorService().setError("Failed to add group!");
      } else {
        this.resetDialog();
        this.dialog = false; // close dialog
        this.$emit('add-group', result);
      }
    });
  }

  private createGroupObject(): GroupWithRights
  {
    const group = Object.assign({}, this.selectedGroup) as GroupWithRights;

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

  private resetDialog() {
    this.e1 = 1;
    this.namespace = null;
    this.selectedGroup = null;
    this.availableGroupList = null;
    this.viewModel = this.commentModel = this.approvalModel = this.downloadModel = this.modifyModel = this.shareModel = this.deleteModel = true;
  }

}
</script>

<style scoped lang="scss">
.my-switch {
  margin: 21px!important;
}
.group-list{
  list-style: none;
  padding-left: 0;
  li {
    //border: 1px solid black;
    padding: 5px;
    margin: 10px;
    background-color: #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
