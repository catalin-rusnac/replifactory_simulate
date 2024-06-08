// vue.config.js
module.exports = {
  // publicPath: process.env.DEPLOY_TARGET === 'local' ? '/' : '/replifactory_simulate/',
    publicPath: '/',
  outputDir: 'dist',
  devServer: {
    hot: true, // Ensure HMR is active
  },
}
