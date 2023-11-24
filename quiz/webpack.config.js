const path = require('path');

module.exports = (env) => {
    return {
        mode: env.mode ?? 'development',
        entry: path.resolve(__dirname, 'src', 'app', 'index.ts'),
        output: {
            filename: '[name].[contenthash]..js',
            path: path.resolve(__dirname, 'dist'),
            clean: true
        }
    }
};
