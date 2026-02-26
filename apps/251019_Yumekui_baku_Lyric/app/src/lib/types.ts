// ========================================
// 型定義: 夢くいバク リリックビデオ
// ========================================

export interface Beat {
  time_sec: number;
  beat_index: number;
}

export interface Downbeat {
  time_sec: number;
  bar_index: number;
}

export interface Bar {
  start_sec: number;
  end_sec: number;
  bar_index: number;
  duration_sec: number;
}

export interface Onset {
  frame_index: number;
  time_sec: number;
  onset_strength: number;
}

export interface Segment {
  start_sec: number;
  end_sec: number;
  duration_sec: number;
  label: string; // "intro" | "verse" | "chorus" | "outro"
}

export interface Chorus {
  start_sec: number;
  end_sec: number;
  duration_sec: number;
  rank: number;
  score: number;
}

export interface KeyEstimate {
  key: string; // "E", "C#", etc.
  scale: "major" | "minor";
  confidence: number;
  time_sec?: number;
}

export interface Chord {
  start_sec: number;
  end_sec: number;
  duration_sec: number;
  chord: string; // "Em", "C", "G", etc.
  confidence: number;
}

export interface Melody {
  frame_index: number;
  time_sec: number;
  frequency_hz: number;
  voiced: boolean;
}

export interface LyricChar {
  index: number;
  char: string;
  start_sec: number;
  end_sec: number;
  duration_sec: number;
}

export type SceneId =
  | "K1" | "K2" | "K3" | "K4" | "K5"
  | "K6" | "K7" | "K8" | "K9" | "K10";

export interface SceneAsset {
  id: SceneId;
  videoPath?: string;
  imagePath?: string;
  loop: boolean;
  speed: number;
}

export interface AppConfig {
  width: number;
  height: number;
  fps: number;
  theme: {
    palette: {
      indigo: string;
      sumi: string;
      gold: string;
      milk: string;
      accentPink: string;
    };
    grainOpacity: number;
    fontFamily: string;
  };
  lyric: {
    baselineY: number;
    fontSize: number;
    fontSizeChorus: number;
    letterSpacing: number;
    glyphWidthRatio?: number;
    fontWeight?: number;
    ruby: boolean;
    stroke: {
      color: string;
      width: number;
      blur: number;
    };
    shadow: {
      color: string;
      offsetY: number;
    };
    fadeIn: number;
    fadeOut: number;
  };
  beat: {
    scaleMin: number;
    scaleMax: number;
    tripletDelayMs: number;
  };
  particle: {
    normalRate: number;
    chorusMultiplier: number;
  };
  exposure: {
    normal: number;
    chorus: number;
    max: number;
  };
  transition: {
    segmentDuration: number;
    damping: number;
  };
  onset: {
    threshold: number;
    flashDuration: number;
  };
  fallback: {
    useBeatSplitWhenSrtMissing: boolean;
    beatSubdivision: number;
  };
}

export interface AnalysisSummary {
  duration_sec: number;
  bpm: number;
  estimated_bars: number;
  sample_rate: number;
}

export interface Manifest {
  version: string;
  song_title: string;
  slug: string;
  generated_at: string;
  files: Array<{
    filename: string;
    size_bytes: number;
  }>;
  backends: {
    beats: string;
    key: string;
    chords: string;
    melody: string;
  };
  config_digest: string;
  analysis_summary: {
    tempo: {
      tempo_bpm: number;
      duration_sec: number;
      estimated_bars: number;
      sample_rate: number;
    };
    beats: {
      num_beats: number;
      num_bars: number;
    };
    energy: {
      num_frames: number;
      mean_rms_db: number;
      mean_onset_strength: number;
    };
    structure: {
      num_segments: number;
      segment_labels: string[];
    };
    chorus: {
      num_candidates: number;
      top_chorus_score: number;
    };
    key: {
      key: string;
      scale: string;
      confidence: number;
    };
    chords: {
      num_chords: number;
    };
    melody: {
      num_frames: number;
      mean_f0_hz: number;
      voiced_ratio: number;
    };
    lyrics: {
      lyrics_provided: boolean;
      num_characters: number;
      distribute_mode: string;
      alignment_method: string;
    };
  };
  source_audio_filename: string;
  source_audio_relpath: string;
}
