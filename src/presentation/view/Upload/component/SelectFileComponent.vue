<template>
  <div class="test">
<!--    <h1>Select files</h1>-->
    <v-file-input
        v-model="fileModel"
        @change="onFileInputChange"
        truncate-length="15"
        label="Select file"
        color="var(--primary--text)"
    ></v-file-input>

    <div v-if="fileModel">
      Selected file: {{fileModel.name}}
    </div>
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

@Component({
  filters: {
    pretty(value:object) {
      return JSON.stringify(value);
    }
  }
})
export default class SelectFilesComponent extends MyVue {
  name = "SelectFilesComponent";

  constructor() {
    super();
  }

  fileModel:File | null = null;

  @Prop()
  file!:File | null;

  @Watch('file')
  onFileChanged(val: File, oldVal: File) {
    console.log("On changed value:");
    console.log(val);
    this.fileModel = val;
  }

  onFileInputChange() {
    console.log("New file:");
    console.log(this.fileModel);
    this.$emit('update-file', this.fileModel);
  }

}
</script>

<style scoped lang="scss"></style>
