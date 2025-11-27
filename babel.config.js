module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
                    alias: {
                        '@navigation': './src/types/navigation',
                        '@assets': './src/assets',
                        '@constants': './src/constants',
                        '@utils': './src/utils',
                        '@components': './src/components',
                        '@stores': './src/stores',
                        '@services': './src/services',
                        '@config': './src/config',
                    },
                },
            ],
            '@babel/plugin-transform-export-namespace-from',
            './babel-plugin-disable-font-scaling.js', // Add custom plugin to disable font scaling
            'react-native-reanimated/plugin',
        ],
    };
};