var webpack = require("webpack");

function getEnvVariables() {
    var custom_env = {};
  for (var key in process.env) {
    custom_env[key] = process.env[key];
  }
  console.log(custom_env);
  return custom_env;
}

module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                    "appId": "com.example.app"
            }
        }
    },
    configureWebpack: {
        plugins: [
            new webpack.EnvironmentPlugin(['HOME'])
        ],
        devServer: {
            port: 9000
        },
        node: {
            __dirname: true
        }
    }
}