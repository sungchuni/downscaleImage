const TEST_TARGET = "./*.@(spec|test).js";

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      {pattern: TEST_TARGET, watched: false},
      {pattern: "./*.jpg", watched: false, included: false}
    ],
    exclude: [],
    preprocessors: {
      [TEST_TARGET]: ["webpack"]
    },
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["Chrome"],
    singleRun: true,
    concurrency: Infinity,
    webpack: {
      mode: "development"
    }
  });
};
