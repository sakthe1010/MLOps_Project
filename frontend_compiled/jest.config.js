module.exports = {
    testEnvironment      : 'jsdom',
    setupFilesAfterEnv   : ['<rootDir>/jest.setup.js'],
    moduleNameMapper     : {
      /* stub out CSS / images if you import them somewhere */
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
      /* Let Babel turn modern syntax into node-understandable JS */
      '^.+\\.(js|jsx|mjs|cjs)$': ['babel-jest', { presets: ['next/babel'] }],
    },
    transformIgnorePatterns: ['/node_modules/'],
  };
  