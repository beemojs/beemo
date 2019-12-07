"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    ignore: ['.*/node_modules/.*', '.*/tests/.*', '.*\\.test\\.js'],
    include: ['./src'],
    lints: {
        all: 'off',
    },
    options: {
        emoji: true,
        'esproposal.class_instance_fields': 'enable',
        'esproposal.class_static_fields': 'enable',
        'esproposal.export_star_as': 'enable',
        include_warnings: true,
        'module.ignore_non_literal_requires': true,
    },
};
exports.default = config;
