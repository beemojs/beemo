"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prettier_1 = __importDefault(require("@milesj/build-tool-config/lib/configs/prettier"));
const config = Object.assign(Object.assign({}, prettier_1.default), { ignore: prettier_1.default.ignore.concat(['CHANGELOG.md']) });
exports.default = config;
