"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_1 = __importDefault(require("@milesj/build-tool-config/lib/configs/jest"));
const config = Object.assign(Object.assign({}, jest_1.default), { testPathIgnorePatterns: ['integration'] });
exports.default = config;
