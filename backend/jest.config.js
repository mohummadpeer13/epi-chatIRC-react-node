const config = {
  verbose: true,
  testMatch: ["**/tests/**/*.js", "**/?(*.)+(test).js"],
  testEnvironment: 'node',
  globalTeardown: './jest.teardown.js',
};

module.exports = config;
