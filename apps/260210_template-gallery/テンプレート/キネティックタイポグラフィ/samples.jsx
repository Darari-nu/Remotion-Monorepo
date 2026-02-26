import React, { lazy, Suspense } from 'react';
const KineticTextLazy = lazy(() => import('./KineticText').then(module => ({ default: module.KineticText })));

const KineticText = (props) => (
    <Suspense fallback={null}>
        <KineticTextLazy {...props} />
    </Suspense>
);

// Default (Random) - Set C (Positive)
export const Default = () => (
    <KineticText
        text={"新しい\n扉を開けて\n未来へと\n歩き出そう"}
        mode="random"
    />
);
