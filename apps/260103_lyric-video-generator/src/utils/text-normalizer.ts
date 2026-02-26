import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

export class TextNormalizer {
    private kuroshiro: any;
    private isInitialized: boolean = false;

    constructor() {
        this.kuroshiro = new Kuroshiro();
    }

    async init() {
        if (this.isInitialized) return;
        await this.kuroshiro.init(new KuromojiAnalyzer());
        this.isInitialized = true;
    }

    /**
     * Normalize text for fuzzy matching:
     * 1. Convert to Hiragana
     * 2. Remove symbols, spaces, and punctuation
     * 3. Convert to lowercase
     */
    async normalize(text: string): Promise<string> {
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
