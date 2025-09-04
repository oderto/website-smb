module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['src/styles']
    }),
    require('postcss-preset-env')({
      stage: 3,
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace'
      },
      features: {
        'custom-properties': false,
        'nesting-rules': true,
        'color-mod-function': { unresolved: 'warn' }
      }
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      require('cssnano')({
        preset: ['default', {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          mergeRules: true,
          minifyFontValues: true,
          minifyParams: true,
          minifySelectors: true,
          reduceIdents: false,
          zindex: false
        }]
      })
    ] : [])
  ]
};