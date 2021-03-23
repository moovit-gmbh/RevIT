<template>
  <div class="test">
    <h1>Select external emails</h1>
    <div class="external-emails" v-if="jobId">
      <ul v-if="tokens.length > 0">
        <li v-for="token in tokens">
          {{token.email}}
          <EditExternalEmailDialogComponent
              v-bind:token="token"
              v-bind:jobId="jobId"
          />
          <v-btn color="red" @click="deleteToken(token)">Delete</v-btn>
        </li>
      </ul>
    </div>
    <AddExternalEmailDialogComponent
        v-bind:jobId="jobId"
    />
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Container from "@/Container";
import {MyVue} from "@/MyVue";
import AddExternalEmailDialogComponent from "@/presentation/view/Upload/component/ExternalEmail/AddExternalEmailDialogComponent.vue";
import EditExternalEmailDialogComponent from "@/presentation/view/Upload/component/ExternalEmail/EditExternalEmailDialogComponent.vue";
import {Token} from "@/domain/Token/Token";
import {Prop, Watch} from "vue-property-decorator";
import {Subscription} from "rxjs";

@Component({
  components: {AddExternalEmailDialogComponent, EditExternalEmailDialogComponent}
})
export default class SelectExternalEmailsComponent extends MyVue {
  name = "SelectExternalEmailsComponent";

  namespace: string | null = null;

  @Prop()
  jobId:string | null = null;

  tokens:Token[] = [];

  private tokenSubscription:Subscription | undefined;

  constructor() {
    super();

  }

  created() {}

  @Watch('jobId')
  onFileChanged(val: string | null, oldVal: string | null) {
    console.log("On changed jobId:");
    console.log(val);

    if(this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }

    if(this.jobId != null) {
      this.tokenSubscription = Container().getTokenService().getTokenList$(this.jobId).subscribe(tokenList => {
        this.tokens = tokenList;
      });
    }
  }

  public deleteToken(token:Token) {
    if(this.jobId == null) {
      Container().getErrorService().setError("Internal error");
      throw new Error("jobId cannot be null here");
    }
    Container().getTokenService().deleteToken(this.jobId, token).subscribe(success => {
      if(success) {
        console.log("Successfully removed token");
      } else {
        Container().getErrorService().setError("Failed to remove external email");
        console.warn("Failed to remove token");
        console.log("token to remove:");
        console.log(token);
        console.log("current token list:");
        console.log(this.tokens);
      }
    });
  }
}
</script>

<style scoped lang="scss">
.external-emails {
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
