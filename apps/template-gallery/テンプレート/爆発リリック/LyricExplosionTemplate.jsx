import React, { useEffect, useRef, useState } from 'react';

/**
 * LyricExplosionTemplate - 再利用可能なリリック爆発エフェクトコンポーネント
 * 
 * @param {Object} props
 * @param {string[]} props.lyrics - 表示する歌詞の配列
 * @param {string[]} props.colors - パーティクルの色配列
 * @param {Object} props.background - 背景設定
 * @param {Object} props.physics - 物理演算パラメータ
 * @param {Object} props.text - テキスト表示設定
 * @param {Object} props.glitch - グリッチエフェクト設定
 * @param {Object} props.particles - パーティクル設定
 * @param {Object} props.autoPlay - 自動再生設定
 * @param {function} props.onTextChange - 歌詞変更時のコールバック
 */
const LyricExplosionTemplate = ({
  // 歌詞
  lyrics = [
    "ここに歌詞を",
    "入れてね"
  ],

  // 色設定
  colors = ['#FF6B9D', '#C44569', '#FFA07A', '#FFD93D', '#6BCB77'],

  // 背景設定
  background = {
    type: 'gradient', // 'gradient' | 'solid' | 'transparent'
    color1: '#0a0a0a',
    color2: '#1a0a1a'
  },

  // 物理演算パラメータ
  physics = {
    velocityX: 8,        // 横方向の速度係数
    velocityY: 8,        // 縦方向の速度係数
    velocityYBias: -2,   // 縦方向のバイアス（マイナスで上向き）
    gravity: 0.15,       // 重力
    airResistance: 0.99, // 空気抵抗
    lifeDecay: 0.01,     // 消滅速度（基本値）
    lifeDecayRandom: 0.015 // 消滅速度のランダム幅
  },

  // テキスト表示設定
  text = {
    fontSize: 80,
    fontFamily: '"Noto Sans JP", sans-serif',
    color: '#FFFFFF',
    glowColor: '#FF6B9D',
    glowBlur: 30
  },

  // グリッチエフェクト設定
  glitch = {
    enabled: true,
    duration: 15,        // グリッチの持続フレーム数
    rgbSplit: 10,        // RGB分離の強さ
    noiseLines: 5        // ノイズラインの本数
  },

  // パーティクル設定
  particles = {
    countPerChar: 3,     // 1文字あたりのパーティクル数
    sizeMin: 30,         // 最小サイズ
    sizeRandom: 20,      // サイズのランダム幅
    positionSpread: 10,  // 初期位置のばらつき
    glowBlur: 20         // パーティクルのグロー
  },

  // 自動再生設定
  autoPlay = {
    enabled: true,
    interval: 3000       // ミリ秒（歌詞の間隔）
  },

  // コールバック
  onTextChange = null,

  // 表示制御
  showHint = false,
  hintText = 'クリックまたはスペースキーで次へ'
}) => {
  // デフォルト値とのマージ（propsで渡されなかったプロパティを補完）
  const mergedPhysics = {
    velocityX: 8,
    velocityY: 8,
    velocityYBias: -2,
    gravity: 0.15,
    airResistance: 0.99,
    lifeDecay: 0.01,
    lifeDecayRandom: 0.015,
    ...physics
  };

  const mergedText = {
    fontSize: 80,
    fontFamily: '"Noto Sans JP", sans-serif',
    color: '#FFFFFF',
    glowColor: '#FF6B9D',
    glowBlur: 30,
    ...text
  };

  const mergedGlitch = {
    enabled: true,
    duration: 15,
    rgbSplit: 10,
    noiseLines: 5,
    ...glitch
  };

  const mergedParticles = {
    countPerChar: 3,
    sizeMin: 30,
    sizeRandom: 20,
    positionSpread: 10,
    glowBlur: 20,
    ...particles
  };

  const mergedAutoPlay = {
    enabled: true,
    interval: 3000,
    ...autoPlay
  };

  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const particlesRef = useRef([]);
  const shockwavesRef = useRef([]); // 衝撃波
  const animationRef = useRef(null);
  const currentTextRef = useRef(0);
  const glitchRef = useRef(0);
  const shakeRef = useRef(0); // カメラシェイク強度
  const textStartTimeRef = useRef(0); // テキスト表示開始時刻
  const autoPlayTimerRef = useRef(null);

  // イージング関数 (Elastic)
  const easeOutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  // 衝撃波クラス
  class Shockwave {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = 1;
      this.maxRadius = Math.max(window.innerWidth, window.innerHeight) * 0.8;
      this.life = 1.0;
      this.speed = 15;
    }

    update() {
      this.radius += this.speed;
      this.life -= 0.02;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color; // 塗りつぶしにはしないが、一応
      ctx.globalAlpha = this.life * 0.3;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 10 * this.life;
      ctx.stroke();
      ctx.restore();
    }
  }

  // パーティクルクラス
  class Particle {
    constructor(x, y, char, color) {
      this.x = x;
      this.y = y;
      this.char = char;
      this.vx = (Math.random() - 0.5) * mergedPhysics.velocityX;
      this.vy = (Math.random() - 0.5) * mergedPhysics.velocityY + mergedPhysics.velocityYBias;
      this.life = 1.0;
      this.decay = Math.random() * mergedPhysics.lifeDecayRandom + mergedPhysics.lifeDecay;
      this.size = Math.random() * mergedParticles.sizeRandom + mergedParticles.sizeMin;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
      this.color = color;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += mergedPhysics.gravity;
      this.vx *= mergedPhysics.airResistance;
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
      if (this.life <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.life;

      // 発光効果を強化
      ctx.shadowColor = this.color;
      ctx.shadowBlur = mergedParticles.glowBlur * 2; // グロー倍増

      ctx.fillStyle = this.color;
      ctx.font = `bold ${this.size}px ${mergedText.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(this.char, 0, 0);

      ctx.restore();
    }
  }

  // 歌詞からパーティクルを生成
  const explodeText = (lyricText, canvas) => {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const chars = lyricText.split('');
    ctx.font = `bold ${mergedText.fontSize}px ${mergedText.fontFamily}`;

    const totalWidth = ctx.measureText(lyricText).width;
    let currentX = centerX - totalWidth / 2;

    chars.forEach((char, i) => {
      const charWidth = ctx.measureText(char).width;
      const x = currentX + charWidth / 2;
      const color = colors[i % colors.length];

      for (let j = 0; j < mergedParticles.countPerChar; j++) {
        particlesRef.current.push(
          new Particle(
            x + (Math.random() - 0.5) * mergedParticles.positionSpread,
            centerY,
            char,
            color
          )
        );
      }
      currentX += charWidth;
    });

    // 衝撃波を追加
    shockwavesRef.current.push(new Shockwave(centerX, centerY, colors[Math.floor(Math.random() * colors.length)]));

    // カメラシェイク発動
    shakeRef.current = 30;
  };

  // テキストの表示状態管理（アニメーションを止めないようRefで管理）
  const isTextVisibleRef = useRef(true);

  // 次の歌詞へ
  const goToNext = () => {
    if (!canvasRef.current) return;

    // 1. 現在の文字を爆発させる
    explodeText(lyrics[currentTextRef.current], canvasRef.current);

    // 2. 文字を一瞬消す（Refを更新）
    isTextVisibleRef.current = false;

    // グリッチエフェクト（爆発の瞬間に発動）
    if (mergedGlitch.enabled) {
      glitchRef.current = mergedGlitch.duration;
    }

    // 3. 少し待ってから次の歌詞を表示
    setTimeout(() => {
      currentTextRef.current = (currentTextRef.current + 1) % lyrics.length;
      isTextVisibleRef.current = true;
      textStartTimeRef.current = Date.now(); // アニメーション開始時刻を記録

      if (onTextChange) {
        onTextChange(currentTextRef.current);
      }
    }, 200); // 200ms後に次の文字出現
  };

  // 初期化
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

    const handleClick = () => goToNext();
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        goToNext();
      }
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    // 初期表示時もアニメーションさせる
    textStartTimeRef.current = Date.now();

    // 自動再生
    if (mergedAutoPlay.enabled) {
      // 最初の一発目を少し遅らせて発動（マウント直後だとキャンバス準備が間に合わない場合があるため）
      const initialTimeout = setTimeout(goToNext, 500);
      autoPlayTimerRef.current = setInterval(goToNext, mergedAutoPlay.interval);

      return () => {
        window.removeEventListener('resize', updateDimensions);
        canvas.removeEventListener('click', handleClick);
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(initialTimeout);
        if (autoPlayTimerRef.current) {
          clearInterval(autoPlayTimerRef.current);
        }
      };
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);

      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [lyrics, mergedAutoPlay.enabled, mergedAutoPlay.interval]);

  // アニメーションループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const animate = () => {
      // カメラシェイクの適用
      let shakeX = 0;
      let shakeY = 0;
      if (shakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * shakeRef.current;
        shakeY = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.9; // 減衰
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 背景描画
      if (background.type === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, background.color1);
        gradient.addColorStop(1, background.color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(-shakeX, -shakeY, canvas.width, canvas.height); // シェイク分を考慮して塗りつぶし
      } else if (background.type === 'solid') {
        ctx.fillStyle = background.color1;
        ctx.fillRect(-shakeX, -shakeY, canvas.width, canvas.height);
      } else {
        ctx.clearRect(-shakeX, -shakeY, canvas.width, canvas.height);
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 衝撃波更新・描画
      shockwavesRef.current = shockwavesRef.current.filter(wave => {
        wave.update();
        wave.draw(ctx);
        return wave.life > 0;
      });

      // グリッチエフェクト
      if (mergedGlitch.enabled && glitchRef.current > 0) {
        ctx.save();

        const offset = Math.random() * mergedGlitch.rgbSplit;
        ctx.globalCompositeOperation = 'screen';

        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(offset, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        ctx.fillRect(-offset, 0, canvas.width, canvas.height);

        for (let i = 0; i < mergedGlitch.noiseLines; i++) {
          const y = Math.random() * canvas.height;
          const height = Math.random() * 3 + 1;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillRect(0, y, canvas.width, height);
        }

        ctx.restore();
        glitchRef.current--;
      }

      // パーティクル更新
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return particle.life > 0;
      });

      // 現在の歌詞表示 (Elastic Animation)
      if (isTextVisibleRef.current) {
        const currentLyric = lyrics[currentTextRef.current];
        const elapsed = Date.now() - textStartTimeRef.current;
        const duration = 800; // アニメーション時間
        const progress = Math.min(1, elapsed / duration);
        const scale = easeOutElastic(progress); // ボイーンとするスケール

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale); // Elasticスケール適用

        ctx.font = `bold ${mergedText.fontSize}px ${mergedText.fontFamily}`;
        ctx.fillStyle = mergedText.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 強烈な発光（Bloom）
        ctx.shadowColor = mergedText.glowColor;
        ctx.shadowBlur = mergedText.glowBlur * 1.5;

        ctx.fillText(currentLyric, 0, 0); // 中心描画なので0,0
        ctx.restore();
      }

      // ヒント表示
      if (showHint && !mergedAutoPlay.enabled) {
        ctx.save();
        ctx.font = `20px ${mergedText.fontFamily}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(hintText, centerX, canvas.height - 50);
        ctx.restore();
      }

      ctx.restore(); // シェイク用のcontext restore

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, lyrics, colors, background, mergedText, mergedGlitch, mergedParticles, showHint, hintText, mergedAutoPlay.enabled]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: background.type === 'transparent' ? 'transparent' : background.color1,
      fontFamily: mergedText.fontFamily
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: mergedAutoPlay.enabled ? 'default' : 'pointer'
        }}
      />
    </div>
  );
};

export default LyricExplosionTemplate;
