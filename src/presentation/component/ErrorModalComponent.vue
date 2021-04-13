<template>
  <v-row justify="center">
    <v-dialog v-model="showDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Error</v-card-title>
        <v-card-text>
          {{ errorMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary-btn" @click="showDialog = false"
            >Ok</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import Component from "vue-class-component";
import { MyVue } from "@/MyVue";
import Container from "@/Container";

@Component
export default class ErrorModalComponent extends MyVue {
  name = "ErrorModalComponent";

  private errorMessage = "";

  private showDialog = false;

  mounted() {
    Container()
      .getErrorService()
      .getErrorObservable()
      .subscribe(errorMessage => {
        this.errorMessage = errorMessage;
        this.showDialog = true;
      });
  }
}
</script>

<style scoped lang="scss"></style>
