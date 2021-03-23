<template>
  <div class="test">
    <h1>Select groups</h1>
    <div class="groups" v-if="jobId">
      <ul v-if="groups.length > 0">
        <li v-for="group in groups">
          {{group.name}}
          <EditGroupDialogComponent
              v-bind:group="group"
              v-bind:jobId="jobId"
          />
          <v-btn color="red" @click="deleteGroup(group)">Delete</v-btn>
        </li>
      </ul>
    </div>
    <AddGroupDialogComponent
        v-bind:jobId="jobId"
    />
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import {MyVue} from "@/MyVue";
import AddGroupDialogComponent from "@/presentation/view/Upload/component/Group/AddGroupDialogComponent.vue";
import EditGroupDialogComponent from "@/presentation/view/Upload/component/Group/EditGroupDialogComponent.vue";
import {Prop, Watch} from "vue-property-decorator";
import {Subscription} from "rxjs";
import {GroupWithRights} from "@/domain/Group/GroupWithRights";
import {map} from "rxjs/operators";

@Component({
  components: {AddGroupDialogComponent, EditGroupDialogComponent}
})
export default class SelectGroupsComponent extends MyVue {
  name = "SelectGroupsComponent";

  namespace: string | null = null;

  @Prop()
  jobId:string | null = null;

  groups:GroupWithRights[] = [];

  private groupSubscription:Subscription | undefined;

  constructor() {
    super();

  }

  created() {}

  @Watch('jobId')
  onJobIdChanged(val: string | null, oldVal: string | null) {
    console.log("On changed jobId:");
    console.log(val);

    if(this.groupSubscription) {
      this.groupSubscription.unsubscribe();
    }

    if(this.jobId != null) {
      this.groupSubscription = Container().getGroupService().getGroupList$(this.jobId).pipe(
          // remove all groups that represent users (every user has its own group)
          map(groupList => groupList.filter(group => !group.name.includes("@")))
      ).subscribe(groupList => {
        this.groups = groupList;
      });
    }
  }

  public deleteGroup(group:GroupWithRights) {
    if(this.jobId == null) {
      throw new Error("jobId cannot be null here");
    }
    Container().getGroupService().deleteGroup(this.jobId, group).subscribe(success => {
      if(success) {
        console.log("Successfully removed group");
      } else {
        Container().getErrorService().setError("Failed to remove group \"" + group.name + "\"!");
        console.error("Failed to remove group");
        console.log("group to remove:");
        console.log(group);
        console.log("current group list:");
        console.log(this.groups);
      }
    });
  }
}
</script>

<style scoped lang="scss">
.groups {
  ul {
    list-style: none;
  }
  li {
    border: 1px solid black;
    padding: 5px;
    margin: 10px;
    background-color: #444;
  }
}
</style>
