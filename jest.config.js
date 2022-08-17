/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  globals: {
    "__DEV__": true,
  },
  testRegex: ".+\\.test\\.js$",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost"
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
}

module.exports = config