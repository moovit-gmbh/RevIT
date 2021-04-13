<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="500px" overlay-opacity="1">
      <v-card>
        <v-card-title style="background: var(--primary)">
          <span class="custom-headline">Select namespace</span>
        </v-card-title>
        <v-card-text>
          <v-container class="mt-3">
            <v-row>
              <v-col cols="12">
                <v-select
                  :items="namespaces"
                  :value="activeNamespace"
                  item-text="name"
                  item-value="name"
                  @change="changeNamespace"
                  color="revapp"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="ma-3"
            @click="close"
            small
            name="closeButton"
            color="primary-btn"
            >Close</v-btn
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
import { Prop, Emit } from "vue-property-decorator";

@Component
export default class SelectNamespaceDialogComponent extends MyVue {
  name = "SelectNamespaceDialogComponent";

  @Prop()
  dialog = false;

  selectedNamespace: string | null = null;

  namespaces: string[] = [];

  activeNamespace = "";

  userId = "";

  created() {
    this.updateNamespaceList();
  }

  private updateNamespaceList() {
    Container()
      .getUserService()
      .getUserData$()
      .subscribe(userData => {
        this.userId = userData.id;
        this.activeNamespace = userData.activeNamespace;
        this.loadNamespaceListByUserId(userData.id);
      });
  }

  private loadNamespaceListByUserId(userId: string) {
    Container()
      .getNamespaceService()
      .getNamespaceListByUserId$(userId)
      .subscribe(namespaces => {
        this.namespaces = namespaces;
      });
  }

  changeNamespace(value: string) {
    // change namespace
    Container()
      .getUserService()
      .changeUserActiveNamespace(this.userId, value).subscribe();
    this.close();
  }

  @Emit("close-namespace-dialog")
  close() {
    return false;
  }
}
</script>

<style scoped></style>
