declare module 'kuroshiro' {
    export default class Kuroshiro {
        constructor();
        init(analyzer: any): Promise<void>;
        convert(text: string, options?: { to?: string; mode?: string; romajiSystem?: string; delimiter?: string }): Promise<string>;
    }
}

declare module 'kuroshiro-analyzer-kuromoji' {
    export default class KuromojiAnalyzer {
        constructor(options?: { dict?: string });
    }
}

declare module 'fast-levenshtein' {
    export function get(str1: string, str2: string, options?: { useCollator?: boolean }): number;
}
