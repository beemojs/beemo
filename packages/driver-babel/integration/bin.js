#!/usr/bin/env node

// Our node modules have a mixture of Babel 6 and Babel 7,
// but the Babel 6 binary takes precedence. Use this binary
// until Babel 6 has been completely removed from the tree.

require('@babel/cli/bin/babel');
