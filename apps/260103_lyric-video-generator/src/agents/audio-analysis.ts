import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

// Define types based on requirements
export interface AudioAnalysisInput {
    audioFile: string;
    language: 'ja' | 'en';
    modelSize: 'base' | 'small' | 'medium' | 'large-v3';
    fileHash?: string;
    forceRefresh?: boolean;
}

export interface AudioAnalysisOutput {
    srtFile: string;
    segments: Segment[];
    duration: number;
    confidence: number;
}

export interface Segment {
    id: number;
    start: number;
    end: number;
    text: string;
    confidence: number;
    words?: WordTiming[];
}

export interface WordTiming {
    word: string;
    start: number;
    end: number;
    probability: number;
}

const CACHE_DIR = path.join(process.cwd(), 'temp', 'cache', 'whisper');

export class AudioAnalysisAgent {
    constructor() {
        fs.ensureDirSync(CACHE_DIR);
    }

    async run(input: AudioAnalysisInput): Promise<AudioAnalysisOutput> {
        console.log(`[AudioAnalysis] Starting analysis for ${input.audioFile}`);

        // 1. Calculate file hash if not provided
        const fileHash = input.fileHash || await this.calculateFileHash(input.audioFile);

        // 2. Check cache
        const cacheKey = `${fileHash}_${input.modelSize}_${input.language}`;
        const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

        if (!input.forceRefresh && fs.existsSync(cachePath)) {
            console.log(`[AudioAnalysis] Cache hit: ${cachePath}`);
            return fs.readJSON(cachePath);
        }

        // 3. Run Python script
        const scriptPath = path.join(process.cwd(), 'python', 'transcribe.py');
        const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python'); // Use venv python

        return new Promise((resolve, reject) => {
            const py = spawn(pythonPath, [
                scriptPath,
                input.audioFile,
                '--model', input.modelSize,
                '--lang', input.language
            ]);

            let outputData = '';
            let errorData = '';

            py.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            py.stderr.on('data', (data) => {
                errorData += data.toString();
                // Log progress from stderr if needed
                console.error(`[Whisper] ${data.toString().trim()}`);
            });

            py.on('close', async (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${errorData}`));
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    if (result.error) {
                        reject(new Error(result.error));
                        return;
                    }

                    // 4. Save Cache
                    await fs.writeJSON(cachePath, result); // Save raw result as cache for now

                    if (result.segments && result.segments.length > 0) {
                        console.log('[DEBUG] First segment words:', JSON.stringify(result.segments[0].words, null, 2));
                    }

                    // 5. Convert to Output format if needed (currently 1:1)
                    const output: AudioAnalysisOutput = {
                        srtFile: '', // TODO: Generate SRT from segments if needed, or keeping it empty for now
                        segments: result.segments,
                        duration: result.duration,
                        confidence: result.confidence
                    };

                    resolve(output);

                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${e}`));
                }
            });
        });
    }

    private async calculateFileHash(filePath: string): Promise<string> {
        const fileBuffer = await fs.readFile(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
}
