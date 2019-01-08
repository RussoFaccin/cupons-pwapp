const path = require('path');
module.exports = {
  entry: "./dev/js/app.js",
  devServer: {
    contentBase: path.join(__dirname, './dev/'),
    compress: true,
    port: 9000
  }
};
