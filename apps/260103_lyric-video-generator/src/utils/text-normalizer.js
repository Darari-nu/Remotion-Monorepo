"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNormalizer = void 0;
const kuroshiro_1 = __importDefault(require("kuroshiro"));
const kuroshiro_analyzer_kuromoji_1 = __importDefault(require("kuroshiro-analyzer-kuromoji"));
class TextNormalizer {
    constructor() {
        this.isInitialized = false;
        this.kuroshiro = new kuroshiro_1.default();
    }
    async init() {
        if (this.isInitialized)
            return;
        await this.kuroshiro.init(new kuroshiro_analyzer_kuromoji_1.default());
        this.isInitialized = true;
    }
    /**
     * Normalize text for fuzzy matching:
     * 1. Convert to Hiragana
     * 2. Remove symbols, spaces, and punctuation
     * 3. Convert to lowercase
     */
    async normalize(text) {
        if (!this.isInitialized) {
            await this.init();
        }
        // Convert to Hiragana
        const hiragana = await this.kuroshiro.convert(text, { to: 'hiragana' });
        // Remove non-alphanumeric and non-Japanese characters (keeping hiragana/katakana/kanji)
        // But since we converted to hiragana, we mainly want to keep hiragana and remove symbols.
        return hiragana
            .replace(/[！-／：-＠［-｀｛-～、。・「」『』（）]/g, '') // Full-width symbols
            .replace(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '') // Half-width symbols
            .replace(/\s+/g, '') // Whitespace
            .toLowerCase();
    }
}
exports.TextNormalizer = TextNormalizer;
