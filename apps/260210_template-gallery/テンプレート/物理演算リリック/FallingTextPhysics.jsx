import React, { useEffect, useRef, useState } from 'react';

/**
 * FallingTextPhysics - 物理演算で落ちる文字
 * 文字が上から落下して、バウンドして、積み重なる
 */
const FallingTextPhysics = ({
  // 歌詞（\nで改行）
  lyrics = [
    "路地裏のサーカスで\n踊ろうよ",
    "誰も知らない\n秘密の場所",
    "僕らだけの\nショータイム",
    "夢を喰らう\nバクがいる",
    "眠れない夜に\nそっと寄り添う",
    "君の不安を\n食べてあげよう",
    "明日がくるまで\n一緒にいよう"
  ],
  
  // 色設定
  colors = ['#FF6B9D', '#00FFFF', '#FFD700', '#FF4500', '#7FFF00'],
  backgroundColor = '#0a0a0a',
  
  // テキスト設定
  fontSize = 55,
  fontFamily = '"Noto Sans JP", "Arial Black", sans-serif',
  
  // 物理演算設定
  physics = {
    gravity: 0.5,        // 重力
    bounce: 0.5,         // 反発係数（少し弱く）
    friction: 0.98,      // 摩擦
    rotationSpeed: 0.1   // 回転速度
  },
  
  // タイミング設定
  timing = {
    displayTime: 1000,      // 歌詞を表示する時間（1秒）
    dropInterval: 150,      // 文字を落とす間隔（速めに）
    pauseAfterFall: 3500,   // 全部落ちた後の待機時間（長く）
    clearDelay: 1500        // クリアまでの時間
  },
  
  // エフェクト
  effects = {
    glow: true,
    shadow: true,
    trail: false
  }
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const lettersRef = useRef([]);
  const animationRef = useRef(null);
  const stateRef = useRef({
    phase: 'display',      // 'display' | 'falling' | 'waiting' | 'clearing'
    currentLyric: 0,
    phaseStartTime: 0,
    nextDropIndex: 0,
    lastDropTime: 0
  });

  // 文字クラス
  class Letter {
    constructor(char, x, y, color, fontSize, isStatic = true) {
      this.char = char;
      this.x = x;
      this.y = y;
      this.initialX = x;  // 初期位置を保存
      this.initialY = y;
      this.vx = 0;
      this.vy = 0;
      this.rotation = 0;
      this.rotationSpeed = 0;
      this.color = color;
      this.fontSize = fontSize;
      this.alpha = 1;
      this.isClearing = false;
      this.isStatic = isStatic;  // 静止状態か
    }

    startFalling() {
      // 落下開始
      this.isStatic = false;
      this.vx = (Math.random() - 0.5) * 3;
      this.rotationSpeed = (Math.random() - 0.5) * physics.rotationSpeed;
    }

    update(canvasHeight, canvasWidth, otherLetters) {
      if (this.isClearing) {
        this.alpha -= 0.03;
        return this.alpha > 0;
      }

      // 静止状態なら動かない
      if (this.isStatic) {
        return true;
      }

      // 重力
      this.vy += physics.gravity;

      // 速度を適用
      this.x += this.vx;
      this.y += this.vy;

      // 回転
      this.rotation += this.rotationSpeed;

      // 摩擦（空気抵抗）
      this.vx *= physics.friction;

      // 地面との衝突
      const ground = canvasHeight - this.fontSize / 2;
      if (this.y > ground) {
        this.y = ground;
        this.vy *= -physics.bounce; // バウンド
        this.rotationSpeed *= physics.bounce;
        
        // ほぼ静止したら完全に止める
        if (Math.abs(this.vy) < 0.5) {
          this.vy = 0;
          this.rotationSpeed *= 0.5;
        }
      }

      // 壁との衝突
      if (this.x < this.fontSize / 2) {
        this.x = this.fontSize / 2;
        this.vx *= -physics.bounce;
      }
      if (this.x > canvasWidth - this.fontSize / 2) {
        this.x = canvasWidth - this.fontSize / 2;
        this.vx *= -physics.bounce;
      }

      // 他の文字との簡易衝突判定（落下中の文字のみ）
      otherLetters.forEach(other => {
        if (other === this || other.isStatic) return;
        
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.fontSize * 0.8;

        if (dist < minDist && dist > 0) {
          // 衝突！押し出す
          const angle = Math.atan2(dy, dx);
          const overlap = minDist - dist;
          
          this.x -= Math.cos(angle) * overlap * 0.5;
          this.y -= Math.sin(angle) * overlap * 0.5;
          other.x += Math.cos(angle) * overlap * 0.5;
          other.y += Math.sin(angle) * overlap * 0.5;

          // 速度の交換（簡易版）
          const tempVx = this.vx;
          const tempVy = this.vy;
          this.vx = other.vx * 0.5;
          this.vy = other.vy * 0.5;
          other.vx = tempVx * 0.5;
          other.vy = tempVy * 0.5;
        }
      });

      return true; // まだ生きてる
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;

      // シャドウ
      if (effects.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      // グロー
      if (effects.glow) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
      }

      ctx.font = `bold ${this.fontSize}px ${fontFamily}`;
      ctx.fillStyle = this.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.char, 0, 0);

      ctx.restore();
    }
  }

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

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // アニメーションループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const state = stateRef.current;

      // 背景
      if (effects.trail) {
        ctx.fillStyle = backgroundColor + 'CC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // === フェーズ管理 ===
      
      if (state.phase === 'display') {
        // 初回のみ文字を生成
        if (lettersRef.current.length === 0) {
          const currentLyric = lyrics[state.currentLyric];
          const lines = currentLyric.split('\n'); // 改行で分割
          
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          
          // 各行を処理
          lines.forEach((line, lineIndex) => {
            const chars = line.split('');
            const totalWidth = ctx.measureText(line).width;
            
            // 中央揃えで配置
            let currentX = (canvas.width - totalWidth) / 2;
            const y = canvas.height * 0.2 + (lineIndex * fontSize * 1.3); // 行間を考慮
            
            chars.forEach((char, charIndex) => {
              const charWidth = ctx.measureText(char).width;
              const x = currentX + charWidth / 2;
              const color = colors[(lineIndex * 100 + charIndex) % colors.length];
              
              lettersRef.current.push(new Letter(char, x, y, color, fontSize, true));
              currentX += charWidth;
            });
          });
          
          state.phaseStartTime = now;
        }
        
        // 表示時間が経過したら落下フェーズへ
        if (now - state.phaseStartTime > timing.displayTime) {
          state.phase = 'falling';
          state.nextDropIndex = 0;
          state.lastDropTime = now;
        }
      }
      
      else if (state.phase === 'falling') {
        // 一文字ずつ落とす
        if (state.nextDropIndex < lettersRef.current.length) {
          if (now - state.lastDropTime > timing.dropInterval) {
            lettersRef.current[state.nextDropIndex].startFalling();
            state.nextDropIndex++;
            state.lastDropTime = now;
          }
        } else {
          // 全部落とし始めたら待機フェーズへ
          state.phase = 'waiting';
          state.phaseStartTime = now;
        }
      }
      
      else if (state.phase === 'waiting') {
        // 待機時間が経過したらクリアフェーズへ
        if (now - state.phaseStartTime > timing.pauseAfterFall) {
          state.phase = 'clearing';
          state.phaseStartTime = now;
        }
      }
      
      else if (state.phase === 'clearing') {
        // クリア開始
        if (now - state.phaseStartTime > timing.clearDelay) {
          lettersRef.current.forEach(letter => {
            letter.isClearing = true;
          });
        }
        
        // 全部消えたら次の歌詞へ
        if (lettersRef.current.every(l => l.alpha <= 0)) {
          lettersRef.current = [];
          state.currentLyric = (state.currentLyric + 1) % lyrics.length;
          state.phase = 'display';
        }
      }

      // === 文字の更新と描画 ===
      
      lettersRef.current = lettersRef.current.filter(letter => 
        letter.update(canvas.height, canvas.width, lettersRef.current)
      );

      lettersRef.current.forEach(letter => letter.draw(ctx));

      // デバッグ情報
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '16px monospace';
      ctx.fillText(`Phase: ${state.phase}`, 20, 30);
      ctx.fillText(`Lyric: ${lyrics[state.currentLyric]}`, 20, 50);
      ctx.fillText(`Letters: ${lettersRef.current.length}`, 20, 70);
      if (state.phase === 'falling') {
        ctx.fillText(`Dropping: ${state.nextDropIndex}/${lettersRef.current.length}`, 20, 90);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, lyrics, colors, backgroundColor, fontSize, fontFamily, physics, timing, effects]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: backgroundColor,
      fontFamily: fontFamily
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default FallingTextPhysics;
