module.exports = {
    roots: ['<rootDir>/test/'],
    testRegex: '.+\\.test\\.tsx?$',
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    coverageReporters: ['text', 'text-summary'],
}
