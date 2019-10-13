var webpack = require("webpack");

module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "appId": "com.example.app",
                "artifactName": "${productName}-${version}.${ext}",
                "mac": {
                    "category": "public.app-category.developer-tools"
                }
            },
            externals: ["kubernetes-client"]
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