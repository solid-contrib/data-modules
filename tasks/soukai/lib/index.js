"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uuid = void 0;
var uuid_1 = require("./helpers/uuid");
Object.defineProperty(exports, "Uuid", { enumerable: true, get: function () { return uuid_1.Uuid; } });
const uuid_2 = __importDefault(require("./helpers/uuid"));
exports.default = uuid_2.default;
