import React, { lazy, Suspense } from 'react';
const SolidSlashLazy = lazy(() => import('./SolidSlash').then(module => ({ default: module.SolidSlash })));

const SolidSlash = (props) => (
    <Suspense fallback={null}>
        <SolidSlashLazy {...props} />
    </Suspense>
);

// Default (Monochrome Sharp: Future -> Creation)
export const Default = () => (
    <SolidSlash
        text="闇の中"
        secondaryText="光射す"
        primaryColor="#000000"
        secondaryColor="#808080"
        backgroundColor="#ffffff"
    />
);
