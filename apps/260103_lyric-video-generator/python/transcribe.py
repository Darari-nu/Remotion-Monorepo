import sys
import json
import argparse
import os
from faster_whisper import WhisperModel

def transcribe_audio(file_path, model_size="large-v3", language="ja", device="cpu", compute_type="int8"):
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        # Initialize Whisper model
        # On Mac with Apple Silicon, we typically use "cpu" for faster-whisper or "cuda" if available (not on Mac).
        # faster-whisper might not fully support MPS yet, so CPU is safer default for compatibility.
        # However, for Apple Silicon, "cpu" with int8 is reasonably fast.
        
        print(f"Loading model: {model_size} on {device}...", file=sys.stderr)
        model = WhisperModel(model_size, device=device, compute_type=compute_type)

        print(f"Transcribing {file_path}...", file=sys.stderr)
        segments, info = model.transcribe(
            file_path, 
            beam_size=5, 
            language=language,
            word_timestamps=True
        )

        results = []
        for segment in segments:
            seg_data = {
                "id": segment.id,
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip(),
                "confidence": segment.avg_logprob, 
                "words": []
            }
            
            if segment.words:
                for word in segment.words:
                    seg_data["words"].append({
                        "word": word.word.strip(),
                        "start": word.start,
                        "end": word.end,
                        "probability": word.probability
                    })
            results.append(seg_data)

        output = {
            "duration": info.duration,
            "language": info.language,
            "language_probability": info.language_probability,
            "segments": results,
            "confidence": 1.0 # placeholder or aggregate
        }

        # Print JSON to stdout
        print(json.dumps(output, ensure_ascii=False))
        return True

    except Exception as e:
        error_output = {
            "error": str(e),
            "status": "failed"
        }
        print(json.dumps(error_output, ensure_ascii=False))
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio file using faster-whisper")
    parser.add_argument("file", help="Path to input audio file")
    parser.add_argument("--model", default="large-v3", help="Model size")
    parser.add_argument("--lang", default="ja", help="Language code")
    parser.add_argument("--device", default="cpu", help="Device to use (cpu, cuda, auto)")
    
    args = parser.parse_args()
    
    transcribe_audio(args.file, args.model, args.lang, args.device)
