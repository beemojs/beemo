module.exports = function (options) {
  console.info('ESLint engine config', options);

  return {
    root: true,
    parser: 'babel-eslint',
    extends: ['airbnb'],
    plugins: ['flowtype', 'promise', 'unicorn', 'jest'],
    env: {
      browser: true,
      jest: true,
    },
    globals: {
      __DEV__: true,
    },
    settings: {
      flowtype: {
        onlyFilesWithFlowAnnotation: true,
      },
    },
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2018,
      ecmaFeatures: {
        jsx: true,
        experimentalObjectRestSpread: true,
      },
    },
    rules: {
      'class-methods-use-this': 'off',
      'function-paren-newline': ['error', 'consistent'],
      'multiline-comment-style': 'off',
      'padded-blocks': ['error', {
        // Never apply to blocks
        classes: 'never',
        switches: 'never',
      }],
      'flowtype/boolean-style': 'error',
      'flowtype/define-flow-type': 'error',
      'flowtype/delimiter-dangle': ['error', 'always-multiline'],
      'flowtype/generic-spacing': ['error', 'never'],
      'flowtype/no-dupe-keys': 'error',
      'flowtype/no-mutable-array': 'off',
      'flowtype/no-unused-expressions': 'error',
      'flowtype/no-primitive-constructor-types': 'error',
      'flowtype/no-types-missing-file-annotation': 'error',
      'flowtype/no-weak-types': ['error', {
        any: true,
        Object: false,
        Function: true,
      }],
      'flowtype/object-type-delimiter': ['error', 'comma'],
      'flowtype/require-parameter-type': ['error', {
        excludeArrowFunctions: true,
      }],
      'flowtype/require-return-type': ['error', 'always', {
        annotateUndefined: 'never',
        excludeArrowFunctions: true,
      }],
      'flowtype/require-valid-file-annotation': ['error', 'always'],
      'flowtype/require-variable-type': 'off',
      'flowtype/semi': ['error', 'always'],
      'flowtype/sort-keys': ['error', 'asc', {
        caseSensitive: false,
        natural: true,
      }],
      'flowtype/space-after-type-colon': ['error', 'always', {
        allowLineBreak: false,
      }],
      'flowtype/space-before-generic-bracket': ['error', 'never'],
      'flowtype/space-before-type-colon': ['error', 'never'],
      'flowtype/type-id-match': 'off',
      'flowtype/union-intersection-spacing': ['error', 'always'],
      'flowtype/use-flow-type': 'error',
      'import/no-extraneous-dependencies': 'off',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error',
      'promise/always-return': 'error',
      'promise/avoid-new': 'off',
      'promise/catch-or-return': 'error',
      'promise/no-callback-in-promise': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'off',
      'promise/no-promise-in-callback': 'error',
      'promise/no-return-in-finally': 'error',
      'promise/no-return-wrap': ['error', { allowReject: true }],
      'promise/param-names': 'error',
      'react/jsx-filename-extension': 'off',
      'unicorn/catch-error-name': ['error', { name: 'error' }],
      'unicorn/custom-error-definition': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/explicit-length-check': 'error',
      'unicorn/filename-case': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/no-array-instanceof': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-process-exit': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/prefer-starts-ends-with': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/throw-new-error': 'error',

      // New and not yet in Airbnb
      'lines-between-class-members': 'error',

      // Want to support but disabled in Airbnb
      complexity: ['error', 11],
      'jsx-quotes': ['error', 'prefer-double'],
      'newline-before-return': 'error',
      'no-constant-condition': 'error',
      'no-div-regex': 'error',
      'no-eq-null': 'error',
      'no-implicit-coercion': 'error',
      'no-magic-numbers': ['error', {
        ignore: [-1, 0, 1, 2, 3],
        ignoreArrayIndexes: true,
        enforceConst: true,
      }],
      'no-native-reassign': 'error',
      'no-negated-condition': 'error',
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'none', // Required for Flow
        ignoreRestSiblings: true,
      }],
      'no-useless-call': 'error',
      'sort-keys': ['error', 'asc', {
        caseSensitive: false,
        natural: true,
      }],
      'import/default': 'error',
      'import/named': 'error',
      'import/no-anonymous-default-export': ['error', {
        allowObject: true,
      }],
      'react/forbid-foreign-prop-types': 'error',
      'react/jsx-handler-names': ['error', {
        eventHandlerPrefix: 'handle',
        eventHandlerPropPrefix: 'on',
      }],
      'react/jsx-key': 'error',
      'react/jsx-no-literals': 'off', // Broken
      'react/no-direct-mutation-state': 'error',
      'react/sort-prop-types': 'off', // Handled by sort-keys

      // Does not work with Flow
      'no-extra-parens': 'off',
      'sort-imports': 'off',
      'import/order': 'off',

      // Does not work with class properties
      'no-invalid-this': 'off',
    },
  };

};
