import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const subtitleSchema = z.object({
    text: z.string().describe('字幕テキスト'),
    style: z.object({
        fontSize: z.number().min(10).max(200).step(2).default(50).describe('フォントサイズ (px)'),
        color: zColor().default('#ffffff').describe('文字色'),
        backgroundColor: zColor().default('rgba(0,0,0,0.5)').describe('背景色'),
        padding: z.number().min(0).max(100).default(20).describe('パディング (px)'),
        borderRadius: z.number().min(0).max(50).default(10).describe('角丸 (px)'),
        bottomOffset: z.number().min(0).max(1000).default(100).describe('下からの位置 (px)'),
        fontFamily: z.string().default('sans-serif').describe('フォントファミリー'),
    }).describe('スタイル設定'),
});

export type SubtitleProps = z.infer<typeof subtitleSchema>;

export const Subtitle: React.FC<SubtitleProps> = ({ text, style }) => {
    return (
        <AbsoluteFill
            style={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: style.bottomOffset,
            }}
        >
            <div
                style={{
                    fontSize: style.fontSize,
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    padding: `${style.padding / 2}px ${style.padding}px`,
                    borderRadius: style.borderRadius,
                    textAlign: 'center',
                    fontFamily: style.fontFamily,
                    maxWidth: '80%',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap', // Handle newlines
                }}
            >
                {text}
            </div>
        </AbsoluteFill>
    );
};
