// Karma configuration
// Generated on Sat Dec 05 2015 17:13:10 GMT+0100 (Central European Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/q/q.js',
      'node_modules/knockout/build/output/knockout-latest.debug.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/simulant/dist/simulant.umd.js',
      'lib/ko-observable-validation.js',
      {pattern:'lib/ko-observable-validation.js.map', included: false, served: true},
      {pattern:'lib/ko-observable-validation.ts', included: false, served: true},
      'test/*.spec.js',
      {pattern:'test/*.spec.js.map', included: false, served: true},
      {pattern:'test/*.spec.ts', included: false, served: true},
    ],

    served: [],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox','IE', /*'Edge'*/],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
}
