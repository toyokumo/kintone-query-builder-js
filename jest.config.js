module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.test\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js']
};

