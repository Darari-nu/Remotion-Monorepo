import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Img, staticFile, AbsoluteFill, Audio } from 'remotion';
import { CompositionProps } from '../schema';
import '../style.css';

export const LyricsDisplay: React.FC<CompositionProps> = ({
    audioSrc,
    lyrics,
    position,
    style,
    animation
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Find the currently active lyric line
    const activeLineIndex = useMemo(() => {
        const currentTime = frame / fps;
        return lyrics.findIndex(line =>
            currentTime >= line.start && currentTime <= line.end + 1 // Add 1s buffer for transition out
        );
    }, [frame, fps, lyrics]);

    const activeLine = lyrics[activeLineIndex];

    // Background Image Logic
    const currentBackgroundImage = useMemo(() => {
        // If activeLineIndex is -1, search from the end or just fallback to null for now
        // A better approach: find the LAST lyric that started before current time
        // Actually, we should probably stick to the assignment in the transcript. 
        // If we are between lines, we probably want the background of the PREVIOUS line or the NEXT one?
        // Let's assume the background sticks until changed. 

        const currentTime = frame / fps;

        // Find the latest lyric line that has started before or at current time
        // This includes the current active line or previous completed lines
        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (lyrics[i].start <= currentTime) {
                // Found a candidate, search backwards from here for a BG image
                for (let j = i; j >= 0; j--) {
                    if (lyrics[j].backgroundImage) {
                        return lyrics[j].backgroundImage;
                    }
                }
            }
        }

        return null;
    }, [frame, fps, lyrics]);

    const renderBackground = () => {
        if (!currentBackgroundImage) return null;

        // Ken Burns Effect
        // Ken Burns Effect (Enhanced)
        // Scale from 1.0 to 1.3 continuous
        const scale = interpolate(frame, [0, durationInFrames], [1, 1.3]);

        // Dynamic Pan based on line index (pseudo-random but deterministic)
        // Determine direction based on activeLineIndex to vary movement
        const seed = activeLineIndex >= 0 ? activeLineIndex : 0;
        const xDirection = seed % 2 === 0 ? 1 : -1;
        const yDirection = seed % 3 === 0 ? 1 : -1;

        // Pan amount increases over time
        const translateX = interpolate(frame, [0, durationInFrames], [0, 50 * xDirection]);
        const translateY = interpolate(frame, [0, durationInFrames], [0, 30 * yDirection]);

        return (
            <AbsoluteFill style={{ zIndex: 0 }}>
                <Img
                    src={staticFile(`images/${currentBackgroundImage}`)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                    }}
                />
                {/* Overlay for better text readability */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)'
                }} />
            </AbsoluteFill>
        );
    };

    const renderLyrics = () => {
        if (!activeLine) return null;

        // Animation values
        const currentLineTime = (frame / fps) - activeLine.start;
        const enterProgress = spring({
            frame: currentLineTime * fps,
            fps,
            config: {
                damping: animation.springDamping,
                stiffness: animation.springStiffness,
            },
            durationInFrames: 30
        });

        // Calculate opacity and transform based on animation type
        let opacity = 1;
        let transform = 'none';

        if (animation.type === 'fade') {
            opacity = interpolate(enterProgress, [0, 1], [0, 1]);
        } else if (animation.type === 'slide') {
            opacity = interpolate(enterProgress, [0, 1], [0, 1]);
            const translateY = interpolate(enterProgress, [0, 1], [50, 0]);
            transform = `translateY(${translateY}px)`;
        } else if (animation.type === 'scale') {
            opacity = interpolate(enterProgress, [0, 1], [0, 1]);
            const scale = interpolate(enterProgress, [0, 1], [0.5, 1]);
            transform = `scale(${scale})`;
        } else if (animation.type === 'none') {
            opacity = 1;
        }

        // Calculate vertical position
        let top = '50%';

        if (position.vertical === 'top') {
            top = '20%';
        } else if (position.vertical === 'bottom') {
            top = '80%';
        }

        const containerStyle: React.CSSProperties = {
            top,
            transform: `translate(${position.offsetX}px, ${position.offsetY}px) translateY(-50%)`,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight as React.CSSProperties['fontWeight'],
            fontFamily: style.fontFamily,
            color: style.color as string,
            backgroundColor: style.backgroundColor as string,
        };

        const lineStyle: React.CSSProperties = {
            opacity,
            transform,
        };

        const className = [
            'lyrics-container',
            style.stroke ? 'text-stroke' : '',
            style.shadow ? 'text-shadow' : '',
        ].filter(Boolean).join(' ');

        return (
            <div className={className} style={{ ...containerStyle, zIndex: 1 }}>
                <div className="lyric-line" style={lineStyle}>
                    {activeLine.text}
                </div>
            </div>
        );
    };

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {renderBackground()}
            {renderLyrics()}
            {audioSrc && <Audio src={staticFile(audioSrc)} />}
        </AbsoluteFill>
    );
};
