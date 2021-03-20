/* eslint-disable sort-keys */

module.exports = {
  docs: [
    'index',
    'provider',
    'consumer',
    'driver',
    {
      type: 'category',
      label: 'Drivers',
      items: [
        'drivers/babel',
        'drivers/eslint',
        'drivers/flow',
        'drivers/jest',
        'drivers/lerna',
        'drivers/mocha',
        'drivers/prettier',
        'drivers/rollup',
        'drivers/stylelint',
        'drivers/typescript',
        'drivers/webpack',
      ],
    },
    'tool',
    'events',
    'scaffolding',
    'workspaces',
    'advanced',
    // 'conventions',
    {
      type: 'category',
      label: 'Migrations',
      items: ['migration/2.0'],
    },
    {
      type: 'link',
      label: 'Changelog',
      href: 'https://github.com/beemojs/beemo/blob/master/CHANGELOG.md',
    },
  ],
};
