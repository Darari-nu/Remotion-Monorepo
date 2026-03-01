
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, staticFile } from 'remotion';

// Reuse schemas or define local subset
// Ideally we import these from StandardSubtitleCompositionV7 but for safety/speed let's localise the calculation logic
interface SubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
    section: string;
    mode: string;
}

const CONFIG = {
    screenHeight: 1080,
    safeMargin: 100, // 880px safe area
    styles: {
        verse1: { fontSize: 50, kanjiScale: 4, kanaScale: 2, letterSpacing: 0.4 },
        preChorus1: { fontSize: 50, kanjiScale: 4, kanaScale: 2, letterSpacing: 0.4 },
        chorus1: { fontSize: 50, kanjiScale: 4, kanaScale: 2, letterSpacing: 0.4 },
        verse2: { fontSize: 50, kanjiScale: 4, kanaScale: 2, letterSpacing: 0.4 },
        bridge: { fontSize: 50, kanjiScale: 4, kanaScale: 2, letterSpacing: 0.4 },
        default: { fontSize: 50, kanjiScale: 4, kanaScale: 2, letterSpacing: 0.4 }
    }
};

const getStyle = (section: string) => {
    if (section.startsWith('chorus')) return CONFIG.styles.chorus1;
    if (section.includes('preChorus') || section.includes('pre-chorus')) return CONFIG.styles.preChorus1;
    if (section.startsWith('bridge')) return CONFIG.styles.bridge;
    if (section.startsWith('verse')) return CONFIG.styles.verse1;
    return CONFIG.styles.default;
};

const getCharScale = (char: string, style: any) => {
    const isKanjiOrDigit = /[\u4e00-\u9faf\u3400-\u4dbf0-9０-９]/.test(char);
    const isKana = /[\u3040-\u309f\u30a0-\u30ff]/.test(char);
    if (isKanjiOrDigit) return style.kanjiScale;
    if (isKana) return style.kanaScale;
    return 1.0;
};

const calculateHeight = (text: string, section: string) => {
    const style = getStyle(section);
    const columns = text.split('\n');
    let maxColumnHeight = 0;

    columns.forEach(column => {
        let currentHeight = 0;
        const chars = Array.from(column);
        chars.forEach((char, index) => {
            const scale = getCharScale(char, style);
            const charSize = style.fontSize * scale;
            currentHeight += charSize;
            if (index < chars.length - 1) {
                currentHeight += style.fontSize * style.letterSpacing;
            }
        });
        if (currentHeight > maxColumnHeight) maxColumnHeight = currentHeight;
    });
    return maxColumnHeight;
};

export const LyricsAuditComposition: React.FC = () => {
    const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
    const [errors, setErrors] = useState<any[]>([]);
    const [warnings, setWarnings] = useState<any[]>([]);
    const [passed, setPassed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Initial loading state

    useEffect(() => {
        const load = async () => {
            try {
                // Set loading true at start (redundant but safe)
                setLoading(true);

                const res = await fetch(staticFile('final_subtitles.json') + '?t=' + Date.now());
                const data = await res.json();
                setSubtitles(data);

                const errs: any[] = [];
                const warns: any[] = [];

                data.forEach((item: SubtitleItem) => {
                    const height = calculateHeight(item.text, item.section);
                    const limit = CONFIG.screenHeight;
                    const safeLimit = limit - CONFIG.safeMargin * 2;
                    const percent = Math.round((height / limit) * 100);

                    if (height > limit) {
                        errs.push({ ...item, height, percent });
                    } else if (height > safeLimit) {
                        warns.push({ ...item, height, percent });
                    }
                });

                setErrors(errs);
                setWarnings(warns);
                setPassed(errs.length === 0);
            } catch (e) {
                console.error(e);
            } finally {
                // Ensure loading is set to false regardless of success/fail
                setLoading(false);
            }
        };
        load();
    }, []);

    // const bgColor = passed ? '#d4edda' : '#f8d7da'; // Unused custom colors
    // const textColor = passed ? '#155724' : '#721c24'; // Unused for now as we have dark mode audit

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.round((seconds - Math.floor(seconds)) * 100);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1a1a', padding: 60, fontFamily: 'sans-serif', color: '#fff', overflowY: 'auto' }}>
            <h1 style={{ borderBottom: '3px solid #555', paddingBottom: 30, fontSize: 48, marginBottom: 40 }}>
                歌詞レイアウト監査 (Layout Audit)
            </h1>

            <div style={{
                backgroundColor: loading ? '#004085' : passed && warnings.length === 0 ? '#28a745' : errors.length > 0 ? '#dc3545' : '#ffc107',
                padding: 40,
                borderRadius: 16,
                marginBottom: 50,
                color: '#fff',
                fontSize: 48,
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                {loading
                    ? `⏳ AUDITING...`
                    : errors.length > 0
                        ? `⚠️ DANGER: ${errors.length} Overflows Detected`
                        : warnings.length > 0
                            ? `⚠️ WARNING: ${warnings.length} Near Limits`
                            : `✅ ALL SYSTEMS GO`}
            </div>

            {errors.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ color: '#dc3545', fontSize: 40, marginBottom: 20 }}>❌ Critical Errors (Overflows &gt; 1080px)</h2>
                    {errors.map(err => (
                        <div key={err.id} style={{ backgroundColor: '#222', padding: 30, marginBottom: 20, borderRadius: 12, borderLeft: '10px solid #dc3545' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                <div style={{ fontSize: 32 }}>
                                    <strong>ID: {err.id}</strong> <span style={{ color: '#888', marginLeft: 15 }}>[{err.section}]</span>
                                    <span style={{ color: '#aaa', marginLeft: 20, fontSize: 28 }}>
                                        {formatTime(err.start)} - {formatTime(err.end)}
                                    </span>
                                </div>
                                <span style={{ color: '#ff6b6b', fontSize: 32, fontWeight: 'bold' }}>
                                    Height: {err.height.toFixed(0)}px ({err.percent}%)
                                </span>
                            </div>
                            <div style={{ fontSize: 36, lineHeight: 1.5, fontFamily: '"Zen Old Mincho", serif', borderTop: '1px solid #444', paddingTop: 15 }}>
                                "{err.text.replace(/\n/g, ' / ')}"
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {warnings.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ color: '#ffc107', fontSize: 40, marginBottom: 20 }}>⚠️ Warnings (Near Limit &gt; 880px)</h2>
                    {warnings.map(warn => (
                        <div key={warn.id} style={{ backgroundColor: '#222', padding: 30, marginBottom: 20, borderRadius: 12, borderLeft: '10px solid #ffc107' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                <div style={{ fontSize: 32 }}>
                                    <strong>ID: {warn.id}</strong> <span style={{ color: '#888', marginLeft: 15 }}>[{warn.section}]</span>
                                    <span style={{ color: '#aaa', marginLeft: 20, fontSize: 28 }}>
                                        {formatTime(warn.start)} - {formatTime(warn.end)}
                                    </span>
                                </div>
                                <span style={{ color: '#ffc107', fontSize: 32, fontWeight: 'bold' }}>
                                    Height: {warn.height.toFixed(0)}px ({warn.percent}%)
                                </span>
                            </div>
                            <div style={{ fontSize: 36, lineHeight: 1.5, fontFamily: '"Zen Old Mincho", serif', borderTop: '1px solid #444', paddingTop: 15 }}>
                                "{warn.text.replace(/\n/g, ' / ')}"
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 50, color: '#666' }}>
                Total Subtitles Checked: {subtitles.length}<br />
                Safe Margin: {CONFIG.safeMargin}px (Top/Bottom)<br />
                Screen Height: {CONFIG.screenHeight}px
            </div>
        </AbsoluteFill>
    );
};
