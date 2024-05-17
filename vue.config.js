// vue.config.js
module.exports = {
  publicPath: process.env.DEPLOY_TARGET === 'github' ? '/replifactory_simulate/' : '/',
  outputDir: 'dist',
  devServer: {
    hot: true, // Ensure HMR is active
  },
}
