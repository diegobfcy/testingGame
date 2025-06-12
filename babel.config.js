module.exports = {
  presets: [
    '@babel/preset-env',
    // Wrap the react preset and its options in an array
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};