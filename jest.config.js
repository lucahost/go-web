module.exports = {
    roots: ['<rootDir>/src/'],
    testRegex: '.+\\.test\\.tsx?$',
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    coverageReporters: ['text', 'text-summary'],
}
