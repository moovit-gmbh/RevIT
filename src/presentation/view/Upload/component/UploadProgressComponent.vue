<template>
  <v-progress-linear
      class="uploadProgress"
      :value="progress"
      color="var(--primary-third)"
  >
    <span style="color: white">
      {{fileNameModel}} - {{ progress }}%
    </span>
  </v-progress-linear>
</template>

<script lang="ts">
import Component from "vue-class-component";
import {MyVue} from "@/MyVue";
import {Prop, Watch} from "vue-property-decorator";

@Component({})
export default class UploadProgressComponent extends MyVue {
  name = "UploadProgressComponent";

  constructor() {
    super();
  }

  fileNameModel = "";

  progressModel = 0;

  @Prop()
  fileName!:string;

  @Prop()
  progress!:number;

  @Watch('fileName')
  onFileNameChanged(val: string, oldVal: string) {
    console.log("On changed fileName:");
    console.log(val);
    this.fileNameModel = val;
  }

  @Watch('progress')
  onProgressChanged(val: number, oldVal: number) {
    console.log("On changed progress:");
    console.log(val);
    this.progressModel = val;
  }
}
</script>

<style scoped lang="scss">
.uploadProgress {
  position: fixed;
  top: 0;
  left: 0;
  height: 5px !important;
  z-index: 999;
}
.uploadProgress:hover {
  height: 20px !important;
}
.uploadProgress > * {
  color: #222;
}
.uploadProgress span {
  display: none;
}
.uploadProgress:hover span {
  display: block !important;
}
</style>
