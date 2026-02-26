"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableImages = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const getAvailableImages = async () => {
    const imagesDir = path_1.default.join(process.cwd(), 'public', 'images');
    try {
        const files = await promises_1.default.readdir(imagesDir);
        // Filter for common image extensions
        return files.filter(file => /\.(png|jpg|jpeg|webp|gif)$/i.test(file));
    }
    catch (error) {
        console.warn('Could not read images directory:', error);
        return [];
    }
};
exports.getAvailableImages = getAvailableImages;
