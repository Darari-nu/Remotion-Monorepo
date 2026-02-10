import React from 'react';
import { DecoupledRect } from './DecoupledRect';
import { LyricItem } from './Simulation';

const SAMPLE_TIMELINE: LyricItem[] = [
    { f: 0, t: "映", s: "hex" },
    { f: 10, t: "っ" },
    { f: 20, t: "て", s: "rect" },
    { f: 30, t: "い" },
    { f: 80, t: "ま", s: "circle" },
    { f: 110, t: "す" },
    { f: 120, t: "よ", s: "hex" },
    { f: 130, t: "う" },
    { f: 140, t: "に" },
    { f: 220, t: "涙", s: "hex" },
    { f: 235, t: "の" },
    { f: 250, t: "を", s: "rect" },
    { f: 300, t: "ぬ", s: "hex" },
    { f: 310, t: "ぐ" },
    { f: 320, t: "い" },
    { f: 330, t: "去", s: "circle" },
    { f: 340, t: "る" }
];

export const DecoupledRectSample: React.FC = () => {
    return (
        <DecoupledRect
            lyrics={SAMPLE_TIMELINE}
            fontSettings={{
                fontFamily: "'Hiragino Mincho ProN', 'YuMincho', serif",
                fontSize: 120,
                textColor: "rgba(0,0,0,0.8)",
            }}
            sizeSettings={{
                baseScale: 4.0,
                rectWidth: 320,
                rectHeight: 100,
                radius: 200,
            }}
            styleSettings={{
                shapeColor: "rgba(0,0,0,0.08)",
                lineColor: "rgba(0,0,0,0.1)",
            }}
        />
    );
};
