module.exports = {
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['node_modules'],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'web.js'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      "<rootDir>/config/jest/fileTransform.js",
    '\.(css|less)$': "<rootDir>/config/jest/cssTransform.js",
    '@\/(.*)$': '<rootDir>/src/$1',
  },

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  setupFiles: [
    "<rootDir>/config/jest/setup.js"
  ],
  testPathIgnorePatterns: ["scripts"],
  transform: {
    "^.+\.(js|jsx)$": "<rootDir>/node_modules/babel-jest",
    "^.+\.(ts|tsx)$": "<rootDir>/node_modules/ts-jest",
    "^.+\.css$": "<rootDir>/config/jest/cssTransform.js",
    "^(?!.*\.(css|json)$)": "<rootDir>/config/jest/fileTransform.js"
  },
}
