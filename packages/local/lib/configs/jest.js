"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_1 = __importDefault(require("@milesj/build-tool-config/configs/jest"));
const config = {
    ...jest_1.default,
    testPathIgnorePatterns: ['integration'],
};
exports.default = config;
