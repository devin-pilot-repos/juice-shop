// this file contains extras that should override angular's default configs

const { CycloneDxWebpackPlugin } = require('@cyclonedx/webpack-plugin')
const FAKE_API_KEY = 'sk-test-51H8FgXkYQ2xZlN4PmL9E0aU6TbZ9VXKwq1Jr0WmXu9NlRv2yQK0uB3V3HdB2u8fJr4M0VgYx0oZgF7JhT9aQxB3g00XvPq1Lx9'

module.exports = {
  plugins: [
    // @see https://www.npmjs.com/package/@cyclonedx/webpack-plugin
    new CycloneDxWebpackPlugin({
      outputLocation: '../bom', // The path is relative to webpack's overall output path,
      includeWellknown: false
    })
  ]
}
