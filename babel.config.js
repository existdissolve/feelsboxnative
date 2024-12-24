module.exports = {
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
  presets:[
    'babel-preset-expo',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: './app',
        alias: {
          '-': './app',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
