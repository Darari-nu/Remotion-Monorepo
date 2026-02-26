import React, { useEffect, useRef, useState } from 'react';

/**
 * RansomNote - 切り抜き文字コラージュスタイル
 * 新聞の切り抜きを貼り合わせたような、グランジなリリックビデオ用テンプレート
 */
const RansomNote = ({
  // 歌詞
  lyrics = [
    "夢を喰らうバクがいる",
    "眠れない夜に寄り添う",
    "路地裏のサーカスで",
    "僕らだけのショータイム"
  ],

  // 背景色
  backgroundColor = '#2a2a2a',

  // 紙スタイルのバリエーション（カスタム可能）
  paperStyles = null, // nullの場合はデフォルトを使用

  // フォントのバリエーション（カスタム可能）
  fonts = null, // nullの場合はデフォルトを使用

  // テキスト設定
  fontSize = {
    min: 30,
    max: 90
  },

  // タイミング設定
  timing = {
    entranceDuration: 1500,  // 登場時間
    displayDuration: 3500,   // 表示時間
    exitDuration: 1000,      // 退場時間
    staggerDelay: 0        // 文字ごとの遅延（0=同時表示）
  },

  // アニメーション設定
  animation = {
    entranceRotation: Math.PI * 0.3,  // 登場時の回転量（控えめ）
    floatAmplitude: { min: 0.3, max: 0.8 },  // 浮遊の振幅（微かに呼吸する程度）
    floatSpeed: { min: 0.002, max: 0.005 }  // 浮遊の速度（超スロー）
  },

  // レイアウト設定
  layout = {
    columnPositions: [0.6, 0.4]  // 右列と左列の位置（画面幅の比率）
  }
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const animationRef = useRef(null);
  const stateRef = useRef({
    phase: 'entrance',
    currentLyric: 0,
    phaseStartTime: 0,
    characters: []
  });

  // デフォルトフォント
  const defaultFonts = [
    '"Noto Sans JP", sans-serif',
    '"Noto Serif JP", serif',
    '"Zen Old Mincho", serif',
    '"Shippori Mincho", serif',
    '"Klee One", cursive',
    '"Zen Kurenaido", sans-serif',
    'serif',
    'sans-serif',
    'cursive',
    'fantasy',
    'monospace'
  ];

  // デフォルト紙スタイル
  const defaultPaperStyles = [
    // [A] 標準（白/グレー系）
    { bg: '#F0F0F0', text: '#111111', border: 'transparent', type: 'torn' },
    { bg: '#FFFFFF', text: '#000000', border: 'transparent', type: 'torn' },
    { bg: '#D0D0D0', text: '#222222', border: 'transparent', type: 'torn' },

    // [B] 反転（黒系）
    { bg: '#111111', text: '#F0F0F0', border: 'transparent', type: 'torn' },
    { bg: '#222222', text: '#FFFFFF', border: 'transparent', type: 'torn' },

    // [C] 枠のみ（背景なし）
    { bg: 'transparent', text: '#FFFFFF', border: '#FFFFFF', type: 'transparent' },
    { bg: 'transparent', text: '#F0F0F0', border: 'transparent', type: 'transparent' },

    // [D] 完全な文字のみ（背景なし・枠なし）
    { bg: 'transparent', text: '#FFFFFF', border: 'transparent', type: 'transparent_no_border' },
    { bg: 'transparent', text: '#EEEEEE', border: 'transparent', type: 'transparent_no_border' }
  ];

  const usedFonts = fonts || defaultFonts;
  const usedPaperStyles = paperStyles || defaultPaperStyles;

  // イージング関数 (Elastic)
  const easeOutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  class Character {
    constructor(char, targetX, targetY, index, totalChars) {
      this.char = char;
      this.targetX = targetX;
      this.targetY = targetY;
      this.index = index;

      this.x = targetX;
      this.y = targetY;

      this.exitX = targetX + (Math.random() - 0.5) * 1200;
      this.exitY = targetY + (Math.random() - 0.5) * 800;

      this.font = usedFonts[Math.floor(Math.random() * usedFonts.length)];
      this.size = Math.random() * (fontSize.max - fontSize.min) + fontSize.min;

      const style = usedPaperStyles[Math.floor(Math.random() * usedPaperStyles.length)];
      this.bgColor = style.bg;
      this.textColor = style.text;
      this.borderColor = style.border;
      this.styleType = style.type;

      this.scale = 0;
      this.rotation = (Math.random() - 0.5) * 0.3;
      this.targetRotation = (Math.random() - 0.5) * 0.15;

      this.progress = 0;
      this.opacity = 0;

      this.floatOffsetX = 0;
      this.floatOffsetY = 0;
      this.floatSpeed = Math.random() * (animation.floatSpeed.max - animation.floatSpeed.min) + animation.floatSpeed.min;
      this.floatAmplitude = Math.random() * (animation.floatAmplitude.max - animation.floatAmplitude.min) + animation.floatAmplitude.min;
      this.time = Math.random() * Math.PI * 2;

      this.padding = this.styleType.startsWith('transparent') ? 2 : Math.random() * 6 + 6;

      // 破れた髪の形状用シード
      this.tearSeed = Math.random();
    }

    updateEntrance(progress) {
      const eased = easeOutElastic(progress);
      this.scale = eased;
      this.rotation = this.rotation + (this.targetRotation - this.rotation) * eased;
      this.opacity = Math.min(progress * 2, 1);
    }

    updateDisplay(time) {
      this.time += this.floatSpeed;
      this.floatOffsetX = Math.sin(this.time) * this.floatAmplitude;
      this.floatOffsetY = Math.cos(this.time * 1.3) * this.floatAmplitude;
    }

    updateExit(progress) {
      const eased = Math.pow(progress, 2);
      this.x = this.targetX + (this.exitX - this.targetX) * eased;
      this.y = this.targetY + (this.exitY - this.targetY) * eased;
      this.opacity = 1 - eased;
      this.rotation += 0.1;
      this.scale = 1 - eased * 0.5;
    }

    drawTornPaper(ctx, width, height) {
      const x = -width / 2;
      const y = -height / 2;
      const jaggedness = 3; // ギザギザ具合

      ctx.beginPath();
      ctx.moveTo(x, y);

      // 上辺
      for (let i = 0; i < width; i += 5) {
        ctx.lineTo(x + i, y + (Math.random() - 0.5) * jaggedness);
      }
      ctx.lineTo(x + width, y);

      // 右辺
      for (let i = 0; i < height; i += 5) {
        ctx.lineTo(x + width + (Math.random() - 0.5) * jaggedness, y + i);
      }
      ctx.lineTo(x + width, y + height);

      // 下辺
      for (let i = width; i > 0; i -= 5) {
        ctx.lineTo(x + i, y + height + (Math.random() - 0.5) * jaggedness);
      }
      ctx.lineTo(x, y + height);

      // 左辺
      for (let i = height; i > 0; i -= 5) {
        ctx.lineTo(x + (Math.random() - 0.5) * jaggedness, y + i);
      }
      ctx.closePath();
    }

    draw(ctx) {
      ctx.save();

      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x + this.floatOffsetX, this.y + this.floatOffsetY);
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.rotation);

      ctx.font = `bold ${this.size}px ${this.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(this.char);
      const width = metrics.width + this.padding * 2;
      const height = this.size + this.padding * 2;

      // 背景・スタイル描画
      if (this.styleType === 'torn') {
        // 影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = this.bgColor;
        // ギザギザの紙を描画
        this.drawTornPaper(ctx, width, height);
        ctx.fill();

        // 影リセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

      } else if (this.styleType === 'transparent') {
        // 枠線のみ
        if (this.borderColor !== 'transparent') {
          ctx.strokeStyle = this.borderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        }
      }

      // 文字描画
      ctx.fillStyle = this.textColor;

      // 背景透過の場合は文字に少し影や縁取りをつけて視認性を確保
      if (this.styleType.startsWith('transparent')) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      ctx.fillText(this.char, 0, 0);

      // transparent_no_borderは何もしない（文字だけ）

      ctx.restore();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let camera = {
      rotation: 0,
      scale: 1,
      targetRotation: 0,
      targetScale: 1
    };

    const animate = () => {
      const now = Date.now();
      const state = stateRef.current;

      const rotDiff = camera.targetRotation - camera.rotation;
      camera.rotation += rotDiff * 0.05;

      const scaleDiff = camera.targetScale - camera.scale;
      camera.scale += scaleDiff * 0.05;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height); // 一旦クリア

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(camera.rotation);
      ctx.scale(camera.scale, camera.scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      if (state.phase === 'entrance' && state.characters.length === 0) {
        camera.targetRotation = (Math.random() - 0.5) * 0.1;
        camera.targetScale = 1.0 + (Math.random() * 0.1);

        const text = lyrics[state.currentLyric];

        // 文脈重視の4列レイアウト
        // ユーザーが意図した改行 (\n) に基づいて列を生成する
        const columns = text.split('\n');

        // 4列を超える場合は循環するが、基本は4行想定
        const numColumns = 4;

        // 各列の中心X座標（右から順に読み進めるため、Col 0 が右端）
        const columnXPositions = [
          canvas.width * 0.82, // Col 0: Right
          canvas.width * 0.60, // Col 1: Center-Right
          canvas.width * 0.38, // Col 2: Center-Left
          canvas.width * 0.16  // Col 3: Left
        ];

        // フォントサイズの基準
        const baseSize = Math.min(canvas.width, canvas.height) / 14;

        let globalCharIndex = 0;
        const totalCharsInScreen = text.replace(/\n/g, '').length;

        // 各列を描画
        columns.forEach((colChars, colIndex) => {
          if (colChars.length === 0) return;

          const colX = columnXPositions[colIndex];

          // colCharsは文字列なので、split('')して配列化してからforEachする
          const charsInCol = colChars.split('');

          // 列内での縦方向センタリング
          const totalLineHeight = charsInCol.length * (baseSize * 1.3);
          let currentY = (canvas.height - totalLineHeight) / 2 + (baseSize * 0.5);

          charsInCol.forEach((char) => {
            // 文字ごとのランダムサイズ変調
            const sizeVariation = Math.random() * 0.5 + 0.8;
            const charSize = baseSize * sizeVariation;

            // 位置の揺らぎ（カオス感）
            const offsetX = (Math.random() - 0.5) * 15;
            const offsetY = (Math.random() - 0.5) * 5;

            const charObj = new Character(
              char,
              colX + offsetX,
              currentY + offsetY,
              globalCharIndex,
              totalCharsInScreen
            );

            charObj.size = charSize;

            // 縦書き回転
            if (['ー', '〜', '(', ')', '[', ']', '{', '}', '（', '）', '…', '‥'].includes(char)) {
              charObj.targetRotation += Math.PI / 2;
              charObj.rotation += Math.PI / 2;
            }

            state.characters.push(charObj);

            currentY += charSize * 1.2;
            globalCharIndex++;
          });
        });

        state.phaseStartTime = now;
      }

      const timeSincePhaseStart = now - state.phaseStartTime;

      state.characters.forEach((char, i) => {
        const delay = i * timing.staggerDelay;
        const adjustedTime = Math.max(0, timeSincePhaseStart - delay);

        if (state.phase === 'entrance') {
          const progress = Math.min(1, adjustedTime / timing.entranceDuration);
          char.updateEntrance(progress);
        } else if (state.phase === 'display') {
          char.updateDisplay(now);
        } else if (state.phase === 'exit') {
          const progress = Math.min(1, adjustedTime / timing.exitDuration);
          char.updateExit(progress);
        }
      });

      if (state.phase === 'entrance') {
        const lastCharDelay = (state.characters.length - 1) * timing.staggerDelay;
        if (timeSincePhaseStart >= timing.entranceDuration + lastCharDelay) {
          state.phase = 'display';
          state.phaseStartTime = now;
        }
      } else if (state.phase === 'display') {
        if (timeSincePhaseStart >= timing.displayDuration) {
          state.phase = 'exit';
          state.phaseStartTime = now;
        }
      } else if (state.phase === 'exit') {
        const lastCharDelay = (state.characters.length - 1) * timing.staggerDelay;
        if (timeSincePhaseStart >= timing.exitDuration + lastCharDelay) {
          state.currentLyric = (state.currentLyric + 1) % lyrics.length;
          state.phase = 'entrance';
          state.characters = [];
        }
      }

      state.characters.forEach(char => char.draw(ctx));

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, lyrics, backgroundColor, fontSize, timing, animation, layout]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: backgroundColor,
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
      {/* グランジテクスチャオーバーレイ */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.15,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        mixBlendMode: 'overlay'
      }} />
    </div>
  );
};

export default RansomNote;
