<template>
  <div class="verification-input">
    <div class="input-wrapper" v-for="item in amount" :key="item">
      <input
        @paste="handlePaste"
        onFocus="this.select()"
        title="code"
        v-focus="item - 1 === currentIndex"
        maxlength="1"
        @input="handleInput($event, item - 1)"
        @keyup.delete="onDelete($event, item - 1)"
        v-model="code[item - 1]"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "VerificationCodeInput",
  props: {
    amount: {
      type: Number,
      default: 6,
    },
    completeCallback: {
      type: Function,
      default: () => {},
    },
  },
  directives: {
    focus: {
      componentUpdated: function (el, obj) {
        obj.value && el.focus();
      },
    },
  },
  created() {
    this.code = new Array(this.amount).fill("");
  },
  methods: {
    handleInput(e, index) {
      this.currentIndex = index;
      e.target.value = this.validateNumber(e.target.value);
      e.target.value !== "" && ++this.currentIndex;
      if (this.code.length == 6 && !this.code.includes("")) {
        this.completeCallback(this.code.toString().replace(/,/g, ""));
      }
    },
    onDelete(e, index) {
      if (e.target.value === "") {
        this.currentIndex = index - 1;
      }
    },
    validateNumber(val) {
      return val.replace(/\D/g, "");
    },
    handlePaste(e) {
      e.preventDefault();
      var clipboardData = e.clipboardData || window.clipboardData;
      var pastedData = clipboardData.getData("Text");
      if (pastedData.length == 6 && RegExp(/\d+/).test(pastedData)) {
        this.code = [];
        for (var i = 0; i < pastedData.length; i++) {
          this.code.push(pastedData[i]);
        }
        this.completeCallback(this.code.toString().replace(/,/g, ""));
      }
    },
  },
  data() {
    return {
      code: [],
      currentIndex: 0,
    };
  },
};
</script>

<style lang="scss" scoped>
.verification-input {
  width: 100%;
  display: flex;
  justify-content: space-around;

  .input-wrapper {
    border-bottom: 1px solid white;
    width: 10%;
    height: 0;
    padding-bottom: 8%;
    position: relative;

    input {
      position: relative;
      width: 100%;
      height: 35px;
      text-align: center;
      font-size: 25px;
      transition: all 0.3s;
    }
  }

  input:focus {
    outline: 2px solid var(--primary) !important;
    // outline-style: groove;
  }
}
</style>
