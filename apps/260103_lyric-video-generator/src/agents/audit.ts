import { LyricLine, CompositionProps } from '../remotion/schema';

export interface AuditIssue {
    type: 'error' | 'warning';
    lineIndex: number;
    message: string;
    details?: any;
}

export interface AuditReport {
    isValid: boolean;
    issues: AuditIssue[];
    summary: {
        totalLines: number;
        errorCount: number;
        warningCount: number;
    };
}

export class AuditAgent {
    // Audit configuration
    private readonly MIN_DURATION_PER_CHAR = 0.1; // seconds
    private readonly SCREEN_WIDTH = 1080;
    private readonly SAFE_MARGIN_X = 100; // px

    /**
     * Run all audit checks on the lyrics data
     */
    public check(lyrics: LyricLine[], configProps?: Partial<CompositionProps>): AuditReport {
        const issues: AuditIssue[] = [];
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

    private checkIntegrity(line: LyricLine, index: number, issues: AuditIssue[]) {
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

    private checkReadability(line: LyricLine, index: number, issues: AuditIssue[]) {
        const duration = line.end - line.start;
        const charCount = line.text.length;

        if (charCount === 0) return;

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

    private checkLayout(line: LyricLine, index: number, style: any, issues: AuditIssue[]) {
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

    private checkOverlaps(lyrics: LyricLine[], issues: AuditIssue[]) {
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
