import fs from 'fs/promises';
import path from 'path';

export const getAvailableImages = async (): Promise<string[]> => {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    try {
        const files = await fs.readdir(imagesDir);
        // Filter for common image extensions
        return files.filter(file => /\.(png|jpg|jpeg|webp|gif)$/i.test(file));
    } catch (error) {
        console.warn('Could not read images directory:', error);
        return [];
    }
};
