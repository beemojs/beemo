#!/usr/bin/env node
/* eslint-disable */

process.env.BEEMO_BRAND_NAME = 'BMO';
process.env.BEEMO_BRAND_BINARY = 'bmo';
process.env.BEEMO_CONFIG_MODULE = '@milesj/build-tool-config';
process.env.BEEMO_MANUAL_URL = 'https://bmo.dev';

require('../lib/bin');
