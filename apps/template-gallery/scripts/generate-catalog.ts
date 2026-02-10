import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "path";
import fs from "fs/promises";

const start = async () => {
    console.log("Starting catalog generation...");

    // 1. Bundle the project
    const entryPoint = path.join(process.cwd(), "src/index.ts");
    console.log(`Bundling ${entryPoint}...`);

    const bundleLocation = await bundle({
        entryPoint,
        webpackOverride: (config) => enableTailwind(config),
    });

    // 2. Get Compositions
    const comps = await getCompositions(bundleLocation);

    // Sort compositions: RansomNote -> Explosion -> Physics -> KineticTypography -> SolidSlash, then alphabetically
    const order = ['RansomNote', 'Explosion', 'Physics', 'KineticTypography', 'SolidSlash'];
    comps.sort((a, b) => {
        const catA = order.findIndex(o => a.id.startsWith(o));
        const catB = order.findIndex(o => b.id.startsWith(o));
        if (catA !== catB) return catA - catB;
        return a.id.localeCompare(b.id);
    });

    console.log(`Found ${comps.length} compositions.`);

    // 3. Render Previews
    // Output directory relative to the project root (TemplateGallery's parent)
    const previewsDir = path.join(process.cwd(), "../previews");

    try {
        // Clean directory first to remove old non-numbered files
        await fs.rm(previewsDir, { recursive: true, force: true });
        await fs.mkdir(previewsDir, { recursive: true });
    } catch (e) {
        // ignore
    }

    const videos: { id: string; path: string; name: string; number: number }[] = [];
    const batchSize = 1; // Reduced for stability

    for (let i = 0; i < comps.length; i += batchSize) {
        const batch = comps.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(comps.length / batchSize)}...`);

        await Promise.all(batch.map(async (comp, batchIndex) => {
            const globalIndex = i + batchIndex + 1;
            const numberPrefix = String(globalIndex).padStart(2, '0');

            console.log(`Rendering #${globalIndex} ${comp.id}...`);
            const fileName = `${numberPrefix}_${comp.id}.mp4`;
            const outputPath = path.join(previewsDir, fileName);

            // Check if file exists to skip re-rendering
            // Disabled to force re-render with new lyrics
            /*
            try {
                await fs.access(outputPath);
                console.log(`Skipping ${comp.id} (already exists)`);
                videos.push({
                    id: comp.id,
                    name: comp.id.replace(/-/g, ' / '),
                    path: `./previews/${fileName}`,
                    number: globalIndex
                });
                return;
            } catch {
                // File doesn't exist, proceed
            }
            */

            try {
                // Limit duration to 5 seconds (150 frames) for quick preview
                const duration = Math.min(comp.durationInFrames, 150);

                await renderMedia({
                    composition: comp,
                    serveUrl: bundleLocation,
                    codec: "h264",
                    outputLocation: outputPath,
                    inputProps: comp.defaultProps,
                    frameRange: [0, duration - 1],
                    disallowParallelEncoding: false,
                    timeoutInMilliseconds: 60000, // 60s timeout
                });

                videos.push({
                    id: comp.id,
                    name: comp.id.replace(/-/g, ' / '),
                    path: `./previews/${fileName}`,
                    number: globalIndex
                });
            } catch (err) {
                console.error(`Failed to render ${comp.id}:`, err);
                // Continue without adding to videos list
            }
        }));
    }

    // Sort videos array to ensuring they match the render order (Promise.all might mix order)
    videos.sort((a, b) => a.number - b.number);

    // 4. Generate HTML Catalog
    const groupedVideos = {
        'RansomNote': videos.filter(v => v.id.startsWith('RansomNote')),
        'Explosion': videos.filter(v => v.id.startsWith('Explosion')),
        'Physics': videos.filter(v => v.id.startsWith('Physics')),
        'KineticTypography': videos.filter(v => v.id.startsWith('KineticTypography')),
        'SolidSlash': videos.filter(v => v.id.startsWith('SolidSlash'))
    };

    const generateSection = (title: string, items: typeof videos, badgeClass: string) => {
        if (items.length === 0) return '';
        return `
        <section>
            <h2>${title} <span class="count">${items.length} styles</span></h2>
            <div class="grid">
                ${items.map(v => `
                <div class="card">
                    <div class="preview-container">
                        <div class="video-number">#${String(v.number).padStart(2, '0')}</div>
                        <video src="${v.path}" controls loop muted playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>
                    </div>
                    <div class="info">
                        <h3>${v.name.split(' / ').pop()}</h3>
                        <div class="id">${v.id}</div>
                    </div>
                </div>
                `).join('')}
            </div>
        </section>
        `;
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lyric Video Template Gallery</title>
    <style>
        body {
            font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif;
            background: #111;
            color: #eee;
            margin: 0;
            padding: 40px;
        }
        h1 { text-align: center; margin-bottom: 60px; font-weight: 300; letter-spacing: 2px; }
        section { margin-bottom: 80px; }
        h2 {
            font-size: 24px;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
            margin-bottom: 30px;
            color: #fff;
            display: flex;
            align-items: baseline;
        }
        .count { font-size: 14px; color: #666; margin-left: 10px; font-weight: normal; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.5); }
        .preview-container {
            width: 100%;
            aspect-ratio: 16/9;
            background: #000;
            position: relative;
        }
        video { width: 100%; height: 100%; object-fit: cover; }
        .info { padding: 15px; }
        h3 { margin: 0 0 5px 0; font-size: 14px; color: #ddd; }
        .id { font-size: 11px; color: #666; font-family: monospace; }
        .video-number {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            font-family: monospace;
            z-index: 10;
        }
        .cat-kinetic { background: #ffa502; color: black; }
        .cat-solid { background: #ff4757; color: white; }
    </style>
</head>
<body>
    <h1>LYRIC VIDEO TEMPLATES</h1>

    ${generateSection('RANSOM NOTE (切り貼り風)', groupedVideos['RansomNote'], 'cat-ransom')}
    ${generateSection('EXPLOSION (爆発エフェクト)', groupedVideos['Explosion'], 'cat-explosion')}
    ${generateSection('PHYSICS (物理演算落下)', groupedVideos['Physics'], 'cat-physics')}
    ${generateSection('KINETIC TYPOGRAPHY (キネティック)', groupedVideos['KineticTypography'], 'cat-kinetic')}
    ${generateSection('SOLID SLASH (ソリッドスラッシュ)', groupedVideos['SolidSlash'], 'cat-solid')}

</body>
</html>
  `;

    const catalogPath = path.join(process.cwd(), "../CATALOG.html");
    await fs.writeFile(catalogPath, htmlContent);
    console.log(`Generated catalog at ${catalogPath}`);
};

start().catch(err => {
    console.error(err);
    process.exit(1);
});
