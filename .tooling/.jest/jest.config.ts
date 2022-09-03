module.exports = {
  rootDir: './../../src',
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.16.esm.test.json'
    }
  }
};
