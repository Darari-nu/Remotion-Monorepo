import React from 'react';
import { AbsoluteFill } from 'remotion';
import { QRCodeSVG } from 'qrcode.react';

export interface ShortsLayoutTemplateProps {
    children: React.ReactNode;
    // Header properties
    topText?: string;
    headerBackground?: string;
    // Footer properties
    bottomText?: string;
    footerBackground?: string;
    qrCodeUrl?: string;
    showQrCode?: boolean;
    // Common text styles
    textColor?: string;
    headerFontSize?: number;
    footerFontSize?: number;
    fontFamily?: string;
    // Layout
    backgroundColor?: string;
}

export const ShortsLayoutTemplate: React.FC<ShortsLayoutTemplateProps> = ({
    children,
    topText,
    headerBackground = '#000000',
    bottomText,
    footerBackground = '#000000',
    qrCodeUrl,
    showQrCode = false,
    textColor = '#ffffff',
    headerFontSize = 50,
    footerFontSize = 40,
    fontFamily = '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
    backgroundColor = '#000000',
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor, flexDirection: 'column' }}>
            {/* Header Area (33%) */}
            <div style={{
                height: '33%',
                width: '100%',
                backgroundColor: headerBackground,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingBottom: '10px',
                zIndex: 10,
            }}>
                {topText && (
                    <h1 style={{
                        color: textColor,
                        fontSize: `${headerFontSize}px`,
                        fontFamily: fontFamily,
                        margin: 0,
                        textAlign: 'center',
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {topText}
                    </h1>
                )}
            </div>

            {/* Main Content Area (34%) */}
            <div style={{
                height: '34%',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* 
                   We want to fit 16:9 content into this area.
                   The container is 1080px wide.
                   16:9 video at 1080px width is ~607px height.
                   The container height is 1920 * 0.34 = 652.8px.
                   So we center it vertically.
                */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // Scale down 1920x1080 content to fit 1080 width (1080/1920 = 0.5625)
                    transform: 'translate(-50%, -50%) scale(0.5625)',
                    width: 1920,
                    height: 1080,
                    overflow: 'hidden',
                }}>
                    {children}
                </div>
            </div>

            {/* Footer Area (33%) */}
            {/* Footer Area (33%) */}
            <div style={{
                height: '33%',
                width: '100%',
                backgroundColor: footerBackground,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: bottomText ? 'center' : 'flex-start',
                alignItems: 'center',
                paddingTop: '10px',
                zIndex: 10,
                gap: '20px',
            }}>
                {bottomText && (
                    <p style={{
                        color: textColor,
                        fontSize: `${footerFontSize}px`,
                        fontFamily: fontFamily,
                        margin: 0,
                        textAlign: 'center',
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {bottomText}
                    </p>
                )}
                {showQrCode && qrCodeUrl && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                    }}>
                        <QRCodeSVG
                            value={qrCodeUrl}
                            size={140}
                            fgColor="#000000"
                            bgColor="#ffffff"
                        />
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
