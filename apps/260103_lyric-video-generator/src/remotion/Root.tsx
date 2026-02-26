import React from 'react';
import { Composition } from 'remotion';
import { LyricsDisplay } from './components/LyricsDisplay';
import { DynamicLyricVideo } from './components/dynamic/DynamicLyricVideo';
import { CompositionPropsSchema, DynamicLyricVideoPropsSchema } from './schema';
import './style.css';
import lyricsData from './lyrics.json';



export const RemotionRoot: React.FC = (props: any) => {
    return (
        <>
            <Composition
                id="LyricVideo"
                component={LyricsDisplay}
                durationInFrames={30 * 40} // Default 40 seconds
                fps={30}
                width={1080}
                height={1920}
                schema={CompositionPropsSchema}
                calculateMetadata={async ({ props }) => {
                    const durationInFrames = props.durationInFrames || 30 * 40;
                    return {
                        durationInFrames,
                    };
                }}
                defaultProps={{
                    audioSrc: '路地裏サーカス.mp3',
                    lyrics: lyricsData,
                    position: {
                        vertical: 'center',
                        offsetX: 0,
                        offsetY: 0,
                    },
                    style: {
                        fontFamily: 'Noto Sans JP',
                        fontSize: 80,
                        fontWeight: 700,
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        stroke: true,
                        shadow: true,
                    },
                    animation: {
                        type: 'fade',
                        stagger: 0.1,
                        springDamping: 12,
                        springStiffness: 100,
                    }
                }}
            />
            <Composition
                id="DynamicLyricVideo"
                component={DynamicLyricVideo}
                durationInFrames={30 * 40}
                fps={30}
                width={1080}
                height={1920}
                schema={DynamicLyricVideoPropsSchema}
                defaultProps={{
                    audioSrc: '路地裏サーカス.m4a',
                    lyrics: [
                        {
                            text: 'イントロダクション',
                            startFrame: 15,
                            durationFrames: 45,
                            position: 'center',
                            writingMode: 'horizontal-tb',
                            fontSize: 80,
                        },
                        {
                            text: '第一フレーズ',
                            startFrame: 60,
                            durationFrames: 60,
                            position: 'right',
                            writingMode: 'vertical-rl',
                            fontSize: 70,
                        },
                        {
                            text: '第二フレーズ',
                            startFrame: 120,
                            durationFrames: 60,
                            position: 'left',
                            writingMode: 'horizontal-tb',
                            fontSize: 70,
                        },
                    ],
                    backgroundColor: '#ffffff',
                    focusLinesColor: '#e0e0e0',
                    showFocusLines: true,
                    showSlashingBars: true,
                    showCenterBox: true,
                    slashStartFrame: 40,
                    slashEndFrame: 55,
                }}
            />
        </>
    );
};
