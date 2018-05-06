var path = require('path');

module.exports = {
    entry: './src/cpu.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'CPU6502'
    }
}

module.rules = [
    {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
    }
]
