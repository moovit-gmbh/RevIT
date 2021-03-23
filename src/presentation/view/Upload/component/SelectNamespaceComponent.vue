<template>
  <div class="test">
    <p>Please select a namespace</p>
    <v-select
        :items="namespaces"
        v-model="selectedNamespace"
        label="Namespace"
        @change="updateNamespace"
    ></v-select>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import {MyVue} from "@/MyVue";
import {LoginFormType} from "@/presentation/view/Login/LoginFormType";
import {LoginRequestData} from "@/api/User/LoginRequestData";
import {LoginResult} from "@/api/User/LoginResult";
import {Prop, Watch} from "vue-property-decorator";

@Component
export default class SelectNamespaceComponent extends MyVue {
  name = "SelectNamespaceComponent";

  @Prop()
  value:string | null = null;

  selectedNamespace:string | null = null;

  namespaces: string[] = [];

  @Watch('value')
  onFileChanged(val: string, oldVal: File) {
    console.log("On changed value:");
    console.log(val);
    this.selectedNamespace = val;
  }

  created() {
    this.updateNamespaceList();
  }

  private updateNamespaceList() {
    Container().getUserService().getUserData$().subscribe(userData => {
      this.loadNamespaceListByUserId(userData.id);
    });
  }

  private loadNamespaceListByUserId(userId: string) {
    Container()
        .getNamespaceService()
        .getNamespaceListByUserId$(userId)
        .subscribe(namespaces => this.namespaces = namespaces);
  }

  private updateNamespace() {
    this.$emit('update:value', this.selectedNamespace);
  }

}
</script>

<style scoped lang="scss"></style>
