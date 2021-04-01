import Component from "vue-class-component";
import LoginFormComponent from "@/presentation/view/Login/component/LoginFormComponent.vue";
import RecoverFormComponent from "@/presentation/view/Login/component/RecoverFormComponent.vue";
import ResetPasswordEmailFormComponent from "@/presentation/view/Login/component/ResetPasswordEmailFormComponent.vue";
import ResetPasswordFormComponent from "@/presentation/view/Login/component/ResetPasswordFormComponent.vue";
import TwoFactorAuthFormComponent from "@/presentation/view/Login/component/TwoFactorAuthDialogComponent.vue";
import {MyVue} from "@/MyVue";
import {LoginFormType} from "./LoginFormType";

@Component({
  components: {
    LoginFormComponent,
    RecoverFormComponent,
    ResetPasswordEmailFormComponent,
    ResetPasswordFormComponent,
    TwoFactorAuthFormComponent
  }
})
export default class Login extends MyVue {
  name = "Login";

  authPageToDisplay: LoginFormType = LoginFormType.Login;

  LoginFormType = LoginFormType;

  updateAuthPageToDisplay(newAuthPage:LoginFormType) {
    this.authPageToDisplay = newAuthPage;
  }

}
