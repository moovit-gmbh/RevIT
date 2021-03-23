// vue.config.js
module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  },

  // Change build paths to make them Maven compatible
  // see https://cli.vuejs.org/config/
  outputDir: "target/dist",
  assetsDir: "static",

  // publicPath: process.env.VUE_APP_BASE_URL,
  // outputDir: "./../../../../admin/",
  lintOnSave: false,
  transpileDependencies: ["vuetify"],
};
