const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
    output:{
        filename: '6502.min.js'
    },
    plugins: [
        new UglifyJsPlugin()
    ]
});
