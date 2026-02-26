"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAgent = void 0;
class AuditAgent {
    constructor() {
        // Audit configuration
        this.MIN_DURATION_PER_CHAR = 0.1; // seconds
        this.SCREEN_WIDTH = 1080;
        this.SAFE_MARGIN_X = 100; // px
    }
    /**
     * Run all audit checks on the lyrics data
     */
    check(lyrics, configProps) {
        const issues = [];
        const style = configProps?.style;
        lyrics.forEach((line, index) => {
            // 1. Data Integrity Checks
            this.checkIntegrity(line, index, issues);
            // 2. Readability Checks
            this.checkReadability(line, index, issues);
            // 3. Layout Safety Checks
            if (style) {
                this.checkLayout(line, index, style, issues);
            }
        });
        // 4. Overlap Checks
        this.checkOverlaps(lyrics, issues);
        const errorCount = issues.filter(i => i.type === 'error').length;
        return {
            isValid: errorCount === 0,
            issues,
            summary: {
                totalLines: lyrics.length,
                errorCount,
                warningCount: issues.length - errorCount
            }
        };
    }
    checkIntegrity(line, index, issues) {
        if (!line.text) {
            issues.push({ type: 'error', lineIndex: index, message: 'Text content is missing or empty.' });
        }
        if (line.start === undefined || line.end === undefined) {
            issues.push({ type: 'error', lineIndex: index, message: 'Start or end time is undefined.' });
        }
        if (line.start >= line.end) {
            issues.push({ type: 'error', lineIndex: index, message: `Invalid timing: start (${line.start}) >= end (${line.end}).` });
        }
    }
    checkReadability(line, index, issues) {
        const duration = line.end - line.start;
        const charCount = line.text.length;
        if (charCount === 0)
            return;
        const durationPerChar = duration / charCount;
        if (durationPerChar < this.MIN_DURATION_PER_CHAR) {
            issues.push({
                type: 'warning',
                lineIndex: index,
                message: `Readability risk: displayed too fast (${durationPerChar.toFixed(2)}s/char). Recommended > ${this.MIN_DURATION_PER_CHAR}s.`,
                details: { duration: duration.toFixed(2), charCount }
            });
        }
    }
    checkLayout(line, index, style, issues) {
        // Simplified width estimation: charCount * fontSize * averageCharWidthRatio
        // Assumes Japanese/wide characters roughly square, narrow ones less.
        // Using 1.0 as a safe upper bound for wide chars.
        const fontSize = style.fontSize || 60;
        const estimatedWidth = line.text.length * fontSize;
        const safeWidth = this.SCREEN_WIDTH - (this.SAFE_MARGIN_X * 2);
        if (estimatedWidth > safeWidth) {
            issues.push({
                type: 'warning',
                lineIndex: index,
                message: `Layout risk: text might exceed safe area (Est. ${estimatedWidth}px > ${safeWidth}px).`,
                details: { text: line.text, estimatedWidth }
            });
        }
    }
    checkOverlaps(lyrics, issues) {
        for (let i = 0; i < lyrics.length - 1; i++) {
            const current = lyrics[i];
            const next = lyrics[i + 1];
            // Allow small buffer? No, strict check for now.
            if (current.end > next.start) {
                issues.push({
                    type: 'warning',
                    lineIndex: i,
                    message: `Overlap detected with next line (Line ${i + 1} overlaps Line ${i + 2}).`,
                    details: { currentEnd: current.end, nextStart: next.start, diff: current.end - next.start }
                });
            }
        }
    }
}
exports.AuditAgent = AuditAgent;
