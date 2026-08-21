"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = extractPdfText;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
async function extractPdfText(buffer) {
    try {
        const data = await (0, pdf_parse_1.default)(buffer);
        return data.text.trim();
    }
    catch (error) {
        throw new Error('Failed to parse PDF document');
    }
}
