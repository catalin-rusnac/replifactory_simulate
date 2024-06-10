console.log('process.env.DEPLOY_TARGET:', process.env.DEPLOY_TARGET)
module.exports = {
  publicPath: process.env.DEPLOY_TARGET === 'local' ? '/' : '/replifactory_simulate/',
  outputDir: 'dist',
  devServer: {
    hot: true, // Ensure HMR is active
  },
}
