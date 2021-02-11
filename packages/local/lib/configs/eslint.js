"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_1 = __importDefault(require("@milesj/build-tool-config/lib/configs/eslint"));
const config = {
    ...eslint_1.default,
    rules: {
        ...eslint_1.default.rules,
        'function-paren-newline': 'off',
        'no-param-reassign': 'off',
        'import/first': 'off',
    },
};
exports.default = config;
