<template>
  <v-container>
    <v-row justify="center" class="mt-5">
      <v-col cols="12">

        <v-form ref="validate" v-model="valid" lazy-validation>
          <VerificationCodeInput :completeCallback="verificationComplete">
          </VerificationCodeInput>
        </v-form>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VerificationCodeInput from "@/presentation/view/Login/component/VerificationCodeInput";

export default {
  name: "TFACode",

  components: {
    VerificationCodeInput,
  },

  data() {
    return {
      code: "",
      valid: true,
    };
  },

  methods: {
    verificationComplete(verificationCode) {
      this.code = verificationCode;
      this.callback(this.code);
    },
    copyValue(value) {
      navigator.clipboard.writeText(value);
      this.$store.commit("setSnackbar", {
        text: "Value copied",
      });
    },
    validate() {
      if (this.$refs.validate.validate()) {
        this.callback(this.code);
      } else {
        this.callback("");
      }
    },
  },

  props: {
    recoverToken: {
      type: String,
      default: null,
    },
    callback: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style scoped>
</style>
