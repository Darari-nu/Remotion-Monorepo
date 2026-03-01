import React from 'react';
import { Sequence, Video, staticFile } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { ShortsLayoutTemplate } from './ShortsLayoutTemplate';

export const standardShortsSchema = z.object({
    // Shorts Maker specific props
    開始時間秒: z.number().min(0).max(300).step(1).default(0).describe('切り出し開始時間（秒）'),
    動画の長さ秒: z.number().min(5).max(300).step(1).default(60).describe('動画の長さ（秒）'),

    // Header/Footer text
    上部テキスト: z.string().default('夢喰いバク - MV').describe('上部に表示するテキスト'),
    下部テキスト: z.string().default('Full Versionは公式Youtubeへ').describe('下部に表示するテキスト'),

    // Style customization
    テキスト色: zColor().default('#ffffff').describe('上下帯の文字色'),
    上部背景色: zColor().default('#000000').describe('上部帯の背景色'),
    下部背景色: zColor().default('#000000').describe('下部帯の背景色'),
    上部フォントサイズ: z.number().min(20).max(100).default(50).describe('上部文字サイズ'),
    下部フォントサイズ: z.number().min(20).max(100).default(40).describe('下部文字サイズ'),

    // QR Code
    QRコード表示: z.boolean().default(true).describe('QRコードを表示するか'),
    QRコードURL: z.string().default('https://www.youtube.com/@coban0123').describe('QRコードのリンク先'),
});

export const StandardShortsComposition: React.FC<z.infer<typeof standardShortsSchema>> = (props) => {
    const {
        開始時間秒,
        動画の長さ秒,
        上部テキスト,
        下部テキスト,
        テキスト色,
        上部背景色,
        下部背景色,
        上部フォントサイズ,
        下部フォントサイズ,
        QRコード表示,
        QRコードURL,
    } = props;

    // Calculate frame offset
    const offsetFrames = 開始時間秒 * 30;

    return (
        <ShortsLayoutTemplate
            topText={上部テキスト}
            bottomText={下部テキスト}
            textColor={テキスト色}
            headerBackground={上部背景色}
            footerBackground={下部背景色}
            headerFontSize={上部フォントサイズ}
            footerFontSize={下部フォントサイズ}
            showQrCode={QRコード表示}
            qrCodeUrl={QRコードURL}
        >
            <Sequence from={-offsetFrames} layout="none">
                <Video
                    src={staticFile('full_mv.mp4')}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />
            </Sequence>

        </ShortsLayoutTemplate>
    );
};
