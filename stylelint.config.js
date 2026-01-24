module.exports = {
    customSyntax: 'postcss-styled-syntax',
    extends: [
        'stylelint-config-recommended',
    ],
    rules: {
        'no-descending-specificity': null,
        'nesting-selector-no-missing-scoping-root': null,
    },
}
