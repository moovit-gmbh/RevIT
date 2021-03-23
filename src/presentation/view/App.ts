import Component from "vue-class-component";
import { MyVue } from "@/MyVue";
import ErrorModalComponent from "@/presentation/component/ErrorModalComponent.vue";
import Login from "@/presentation/view/Login/Login.vue";
import Container from "@/Container";

@Component({
  components: {
    Login,
    ErrorModalComponent
  }
})
export default class App extends MyVue {
  private isLoggedIn: boolean | null = null;

  created() {
    Container().getUserService().getIsLoggedIn$().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    })
  }
}
