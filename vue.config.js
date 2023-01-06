var webpack = require("webpack");

module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                "appId": "io.prsh9.dev",
                "productName": "Kube Dev Dashboard",
                "artifactName": "${name}-${version}-${os}.${ext}",
                "mac": {
                    "category": "public.app-category.developer-tools",
                    "target": "dmg"
                },
                "win": {
                    "target": "nsis"
                },
                "linux": {
                    "category": "Development",
                    "target": "zip"
                }
            },
            nodeIntegration: true,
            externals: ["kubernetes-client", "node-pty"]
        }
    },
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env.HOME': JSON.stringify(process.env.HOME)
            })
        ],
        devServer: {
            port: 9000
        },
        node: {
            __dirname: true
        }
    }
}