"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("@milesj/build-tool-config/lib/configs/typescript"));
const config = Object.assign(Object.assign({}, typescript_1.default), { compilerOptions: Object.assign(Object.assign({}, typescript_1.default.compilerOptions), { useDefineForClassFields: false }) });
exports.default = config;
