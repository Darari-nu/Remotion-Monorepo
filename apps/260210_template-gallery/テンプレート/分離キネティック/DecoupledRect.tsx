import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { calculateSimulation, LyricItem } from './Simulation';

export const decoupledRectSchema = z.object({
    fontSettings: z.object({
        fontFamily: z.string().describe("フォントファミリー"),
        fontSize: z.number().min(10).max(400).describe("フォントサイズ"),
        textColor: zColor().describe("文字色"),
    }).describe("フォント設定"),
    sizeSettings: z.object({
        baseScale: z.number().min(0.1).max(10).step(0.1).describe("物理演算スケール (速度・重力)"),
        rectWidth: z.number().min(10).max(1000).describe("四角形の幅"),
        rectHeight: z.number().min(5).max(500).describe("四角形の高さ"),
        radius: z.number().min(5).max(500).describe("円・六角形の半径"),
    }).describe("サイズ設定"),
    styleSettings: z.object({
        shapeColor: zColor().describe("図形の色 (RGBA推奨)"),
        lineColor: zColor().describe("線の色 (RGBA推奨)"),
    }).describe("スタイル設定"),
});

export type DecoupledRectProps = z.infer<typeof decoupledRectSchema> & {
    lyrics: LyricItem[];
};

export const DecoupledRect: React.FC<DecoupledRectProps> = ({
    lyrics,
    fontSettings = {
        fontFamily: "'Hiragino Mincho ProN', 'YuMincho', serif",
        fontSize: 120, // Updated to 120 as requested
        textColor: "rgba(0,0,0,0.8)",
    },
    sizeSettings = {
        baseScale: 4.0,
        rectWidth: 320,
        rectHeight: 100,
        radius: 200,
    },
    styleSettings = {
        shapeColor: "rgba(0,0,0,0.08)",
        lineColor: "rgba(0,0,0,0.1)", // Increased visibility from 0.025
    },
}) => {
    // Destructure for internal use
    const { fontFamily, fontSize, textColor } = fontSettings;
    const { shapeColor, lineColor } = styleSettings;
    const { baseScale, rectWidth, rectHeight, radius } = sizeSettings;

    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 1. Pre-calculate the entire simulation only once (memoized)
    const simulationStates = useMemo(() => {
        return calculateSimulation(lyrics, width, height, durationInFrames, {
            rectWidth,
            rectHeight,
            radius,
            physicsScale: baseScale,
        });
    }, [lyrics, width, height, durationInFrames, rectWidth, rectHeight, radius, baseScale]);

    // 2. Render loop (runs every frame update)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Retrieve state for current frame (or clamp if out of bounds)
        const currentState = simulationStates[Math.floor(frame)] || simulationStates[simulationStates.length - 1];
        if (!currentState) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw Shapes
        currentState.shapes.forEach(s => {
            const p = s.p;
            if (p <= 0) return;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.strokeStyle = "rgba(0,0,0,0.18)"; // Default stroke similar to reference
            ctx.lineWidth = 1;

            if (s.type === 'hex' || s.type === 'circle') {
                const sides = s.type === 'hex' ? 6 : 60;
                const radius = s.radius || 50;
                const totalLength = s.type === 'hex' ? radius * 6 : Math.PI * 2 * radius;

                ctx.setLineDash([totalLength, totalLength]);
                ctx.lineDashOffset = totalLength * (1 - p);

                ctx.beginPath();
                for (let i = 0; i <= sides; i++) {
                    const theta = (i / sides) * Math.PI * 2;
                    ctx.lineTo(radius * Math.cos(theta), radius * Math.sin(theta));
                }
                ctx.stroke();
            } else if (s.type === 'rect') {
                const rectW = s.rectW || 80;
                const rectH = s.rectH || 25;
                const currentW = rectW * p;

                ctx.fillStyle = shapeColor;

                if (s.rectMode === 1) ctx.fillRect(-rectW / 2, -rectH / 2, currentW, rectH);
                else if (s.rectMode === 2) ctx.fillRect(rectW / 2 - currentW, -rectH / 2, currentW, rectH);
                else ctx.fillRect(-currentW / 2, -rectH / 2, currentW, rectH);
            }
            ctx.restore();
        });

        // Draw Connector Lines
        if (currentState.characters.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5;
            for (let i = 0; i < currentState.characters.length - 1; i++) {
                ctx.moveTo(currentState.characters[i].x, currentState.characters[i].y);
                ctx.lineTo(currentState.characters[i + 1].x, currentState.characters[i + 1].y);
            }
            ctx.stroke();
        }

        // Draw Characters
        currentState.characters.forEach((c, i) => {
            const isLatest = (i === currentState.characters.length - 1);
            const targetOpacity = isLatest ? 1.0 : 0.3; // Specific logic from user code

            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.scale(c.scale, c.scale);

            // Parse textColor to apply opacity override if needed
            // but simpler to just use globalAlpha or modify string if simple
            ctx.globalAlpha = c.opacity * targetOpacity;
            ctx.fillStyle = textColor;

            ctx.font = `900 ${fontSize}px ${fontFamily}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(c.text, 0, 0);
            ctx.restore();
        });

    }, [frame, width, height, simulationStates, fontFamily, fontSize, textColor, shapeColor, lineColor, baseScale, rectWidth, rectHeight, radius]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f6f6f6', // Paper-like background from reference
            }}
        />
    );
};
