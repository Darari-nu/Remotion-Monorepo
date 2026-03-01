
import { standardSubtitleV7Schema } from '../src/StandardSubtitleCompositionV7';
import { z } from 'zod';

console.log('Testing standardSubtitleV7Schema defaults...');

try {
    // Simulate Root.tsx passing empty objects for adjustment groups
    // This replicates the current failing scenario in Remotion Studio
    const result = standardSubtitleV7Schema.parse({
        調整_Verse1: {},
        調整_Chorus1: {},
    });

    console.log('Schema parsed successfully.');

    // Check Outro設定
    if (result.Outro設定 && typeof result.Outro設定 === 'object') {
        console.log('✅ Outro設定 exists.');
        console.log('   文字サイズpx:', result.Outro設定.文字サイズpx);
    } else {
        console.error('❌ Outro設定 is MISSING or invalid.');
    }

    // Check 調整_Verse1
    if (result.調整_Verse1 && typeof result.調整_Verse1 === 'object') {
        console.log('✅ 調整_Verse1 exists.');
        // Check if it has keys or is empty object?
        // It defaults to {}, but keys are optional?
        // Wait, shape `id_X` is `adjustmentSchema.default({})`.
        // So `id_0` should be accessible?
        // Let's check keys.
        const keys = Object.keys(result.調整_Verse1);
        console.log('   Keys count:', keys.length);
        if (keys.length > 0) {
            const firstKey = keys[0];
            const val = (result.調整_Verse1 as any)[firstKey];
            console.log(`   ${firstKey} default:`, val);
            if (val && typeof val === 'object') {
                console.log(`   charDuration:`, val.charDuration);
            }
        }
    } else {
        console.error('❌ 調整_Verse1 is MISSING or invalid.');
    }

} catch (error) {
    console.error('❌ Schema validation failed:', JSON.stringify(error, null, 2));
}
