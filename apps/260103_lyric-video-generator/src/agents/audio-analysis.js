"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAnalysisAgent = void 0;
const child_process_1 = require("child_process");
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const CACHE_DIR = path_1.default.join(process.cwd(), 'temp', 'cache', 'whisper');
class AudioAnalysisAgent {
    constructor() {
        fs_extra_1.default.ensureDirSync(CACHE_DIR);
    }
    async run(input) {
        console.log(`[AudioAnalysis] Starting analysis for ${input.audioFile}`);
        // 1. Calculate file hash if not provided
        const fileHash = input.fileHash || await this.calculateFileHash(input.audioFile);
        // 2. Check cache
        const cacheKey = `${fileHash}_${input.modelSize}_${input.language}`;
        const cachePath = path_1.default.join(CACHE_DIR, `${cacheKey}.json`);
        if (!input.forceRefresh && fs_extra_1.default.existsSync(cachePath)) {
            console.log(`[AudioAnalysis] Cache hit: ${cachePath}`);
            return fs_extra_1.default.readJSON(cachePath);
        }
        // 3. Run Python script
        const scriptPath = path_1.default.join(process.cwd(), 'python', 'transcribe.py');
        const pythonPath = path_1.default.join(process.cwd(), 'venv', 'bin', 'python'); // Use venv python
        return new Promise((resolve, reject) => {
            const py = (0, child_process_1.spawn)(pythonPath, [
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
                    await fs_extra_1.default.writeJSON(cachePath, result); // Save raw result as cache for now
                    // 5. Convert to Output format if needed (currently 1:1)
                    const output = {
                        srtFile: '', // TODO: Generate SRT from segments if needed, or keeping it empty for now
                        segments: result.segments,
                        duration: result.duration,
                        confidence: result.confidence
                    };
                    resolve(output);
                }
                catch (e) {
                    reject(new Error(`Failed to parse Python output: ${e}`));
                }
            });
        });
    }
    async calculateFileHash(filePath) {
        const fileBuffer = await fs_extra_1.default.readFile(filePath);
        const hashSum = crypto_1.default.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
}
exports.AudioAnalysisAgent = AudioAnalysisAgent;
