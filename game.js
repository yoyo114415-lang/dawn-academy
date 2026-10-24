/**
 * 《破曉學園》 核心遊戲引擎 (game.js) - 滿版全地圖互通 RPG 強化版
 * 滿版沉浸視角 ｜ 數值增減2秒浮動回饋 ｜ 心靈小提醒融入 ｜ 地面引導箭頭與光暈
 * 全校園地圖互通 ｜ 劇情防亂跳 ｜ 節點防重複觸發 ｜ 100% 純原生 JavaScript
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. 全域任務資料庫與狀態管理
  // ==========================================================================
  // RPG 任務日誌全階段資料庫 (對應 Node 1 ~ Node 9 與大結局)
  const QuestDatabase = {
    1: {
      title: '【主線一】清晨的惡意紙條',
      desc: '清晨教室格外寂靜，走回發光的個人座位，查看桌上被惡作劇留下的嘲笑紙條與垃圾。',
      objective: '走向座位並按 [E] 檢查',
      location: 'S3 班級教室 (個人座位)'
    },
    2: {
      title: '【主線二】飲水機的惡意圍堵',
      desc: '第一節下課走出教室裝水，同學甲在飲水機前故意擋住去路並出言諷刺。',
      objective: '走到飲水機旁面對同學甲按 [E]',
      location: 'S4 走廊 (飲水機前)'
    },
    3: {
      title: '【主線三】向導師傾訴求援',
      desc: '內心承受巨大壓力，決定前往輔導室向信任的導師全盤說出遭遇。',
      objective: '進入輔導室並與導師對話',
      location: 'S6 輔導室 (導師辦公桌)'
    },
    4: {
      title: '【主線四】穿堂碎語與輿論蔓延',
      desc: '穿堂傳來其他班級同學的指指點點與竊竊私語，謠言似乎在校園發酵。',
      objective: '前往穿堂聆聽同儕對話',
      location: 'S5 穿堂 (中央廊道)'
    },
    5: {
      title: '【主線五】走廊的正面衝突',
      desc: '午休走廊上，主謀同學乙迎面走來並直接言語挑釁，必須做出堅定回應。',
      objective: '在走廊直面同學乙按 [E]',
      location: 'S4 走廊 (西側走道)'
    },
    6: {
      title: '【主線六】學務處三方協調會談',
      desc: '學校召開防制霸凌調查會議，生教組長、家長與同學共同出席釐清真相。',
      objective: '入座會議桌展開三方對話',
      location: 'S7 學務處 (長會議桌)'
    },
    7: {
      title: '【主線七】深夜臥室的避風港',
      desc: '會談結束身心俱疲返家，在臥室中向母親傾訴心中的恐懼與委屈。',
      objective: '走向床邊與母親深入對話',
      location: 'S8 家：臥室 (床邊)'
    },
    8: {
      title: '【主線八】客廳電話與導師支持',
      desc: '客廳電話鈴聲響起，導師致電傳達調查進度與對你的全力支持。',
      objective: '走向客廳小几接聽電話',
      location: 'S9 家：客廳 (電話小几)'
    },
    9: {
      title: '【主線九】破曉微光・重返教室',
      desc: '調查告一段落重返教室，友善的同學丙主動打招呼並伸出溫暖援手。',
      objective: '與同學丙交談感受同儕支持',
      location: 'S3 班級教室 (同學丙座位)'
    },
    10: {
      title: '【大結局】走出校門・破曉新生',
      desc: '走出校園大門，晨曦破曉照耀大地，迎向嶄新的自我與校園生活！',
      objective: '穿過穿堂前往校門口按 [E]',
      location: 'S2 校門口 (中央大道)'
    }
  };

  // 每日心情札記去背表情資料庫 (6 種情緒・100% 去背透明圖檔)
  const MoodDatabase = {
    sad: { id: 'sad', name: '難過委屈', img: '圖片/表情/mood_sad.png' },
    anxious: { id: 'anxious', name: '緊張害怕', img: '圖片/表情/mood_anxious.png' },
    confused: { id: 'confused', name: '有些迷茫', img: '圖片/表情/mood_confused.png' },
    relieved: { id: 'relieved', name: '感到安心', img: '圖片/表情/mood_relieved.png' },
    warm: { id: 'warm', name: '溫暖釋懷', img: '圖片/表情/mood_warm.png' },
    brave: { id: 'brave', name: '充滿勇氣', img: '圖片/表情/mood_brave.png' }
  };

  const GameState = {
    screen: 'cover',           // 'cover' | 'select' | 'game'
    selectedGender: 'boy',     // 'boy' | 'girl' | 'neutral'
    soundEnabled: true,

    // 五維數值 (初始值依 dialogues.json 規格書定義)
    stats: {
      stress: 50,              // 壓力值 (核心)
      peer: 30,                // 同儕關係值
      courage: 40,             // 勇氣值
      safety: 35,              // 安全感
      selfEsteem: 30           // 自我肯定值
    },

    // 每日放學轉場心情札記記錄 (Day 1 ~ 5)
    dailyMoods: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null
    },

    // 玩家在各題的選擇記錄 (支援條件分支，如 Q1: 'B')
    playerChoices: {},

    // 依據規格書 7.2 公式計算「整體狀態值」：[(100 - 壓力) + 同儕 + 勇氣 + 安全感 + 自尊] ÷ 5
    getOverallScore() {
      const s = this.stats;
      const relaxed = 100 - s.stress;
      const total = relaxed + s.peer + s.courage + s.safety + s.selfEsteem;
      return Math.round((total / 5) * 10) / 10;
    },

    // 任務與劇情進度引擎
    quest: {
      step: 1,                 // 當前主線步驟 (1~9)
      activeNodeId: 'node1',   // 當前進行中的劇本節點
      text: '請走到發光的座位查看嘲笑紙條',
      completedNodes: new Set()// 已完成的節點集合，絕不重複觸發！
    },

    // 地面尋路導航狀態 (點擊右側面板按鈕後啟動金色流動光徑)
    navigation: {
      active: false
    },

    // 場景與時間
    currentSceneId: 'S3',
    day: 1,
    timeOfDay: '清晨自習',

    // 玩家在地圖上的座標與物理狀態
    player: {
      x: 700,
      y: 470,
      width: 28,
      height: 20,
      speed: 155,
      direction: 'left',       // 'down' | 'up' | 'left' | 'right'
      moving: false,
      frame: 0,
      animTimer: 0
    },

    // 對話系統狀態
    dialogue: {
      active: false,
      textQueue: [],
      currentLine: null,
      typewriterTimer: null,
      displayedLength: 0,
      isTyping: false,
      waitingChoice: false,
      currentNodeData: null,
      inSubQuestion: false,
      history: []              // 前情對話回顧歷史紀錄
    },

    // 減壓深呼吸小遊戲狀態
    breathing: {
      active: false,
      cycle: 1,
      phase: 'inhale',
      timer: null
    }
  };

  // 劇本資料庫快取 (優先讀取 window.GAME_DIALOGUES)
  let DialoguesDB = window.GAME_DIALOGUES || null;

  // ==========================================================================
  // 2. Web Audio API 音效合成器 (純代碼合成，零外部依賴)
  // ==========================================================================
  const SoundFX = {
    ctx: null,

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },

    playTone(freq, type = 'sine', duration = 0.2, gainLevel = 0.08) {
      if (!GameState.soundEnabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },

    click() {
      this.playTone(520, 'sine', 0.08, 0.07);
    },

    alert() {
      this.playTone(659.25, 'sine', 0.12, 0.09);
      setTimeout(() => this.playTone(880, 'sine', 0.18, 0.09), 90);
    },

    positive() {
      this.playTone(523.25, 'sine', 0.09, 0.09);
      setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.09), 70);
      setTimeout(() => this.playTone(783.99, 'sine', 0.18, 0.09), 140);
    },

    stressUp() {
      this.playTone(220, 'triangle', 0.28, 0.14);
      setTimeout(() => this.playTone(196, 'triangle', 0.32, 0.14), 110);
    },

    breatheBell() {
      this.playTone(174.61, 'sine', 2.2, 0.16);
    },

    // 經典西敏寺放學四音鐘聲（Do-Mi-Re-Sol, Sol-Re-Mi-Do 鐘琴泛音）
    playCampusBell() {
      if (!GameState.soundEnabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const notes = [
          { f: 659.25, time: 0.0,  dur: 1.5 }, // Mi
          { f: 523.25, time: 0.65, dur: 1.5 }, // Do
          { f: 587.33, time: 1.3,  dur: 1.5 }, // Re
          { f: 392.00, time: 1.95, dur: 2.2 }, // Sol (低音)
          { f: 523.25, time: 3.2,  dur: 1.5 }, // Do
          { f: 587.33, time: 3.85, dur: 1.5 }, // Re
          { f: 659.25, time: 4.5,  dur: 1.5 }, // Mi
          { f: 523.25, time: 5.15, dur: 2.5 }  // Do
        ];

        const now = this.ctx.currentTime;
        notes.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.f, now + n.time);

          gain.gain.setValueAtTime(0.0001, now + n.time);
          gain.gain.exponentialRampToValueAtTime(0.12, now + n.time + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + n.time);
          osc.stop(now + n.time + n.dur);
        });
      } catch (e) {}
    },

    _activePhoneNodes: [],

    // 客廳傳統雙鈴電話聲（叮鈴鈴～叮鈴鈴～）
    playTelephoneRing() {
      if (!GameState.soundEnabled) return;
      this.stopTelephoneRing();
      try {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const bursts = [0, 2.0];
        const now = this.ctx.currentTime;

        bursts.forEach(offset => {
          [440, 480].forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + offset);

            gain.gain.setValueAtTime(0.0001, now + offset);
            for (let t = 0; t < 1.3; t += 0.05) {
              gain.gain.setValueAtTime(0.08, now + offset + t);
              gain.gain.setValueAtTime(0.008, now + offset + t + 0.025);
            }
            gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 1.4);

            this._activePhoneNodes.push({ osc, gain });
          });
        });
      } catch (e) {}
    },

    // 立即停止電話鈴聲（接起電話即刻靜音）
    stopTelephoneRing() {
      if (this._activePhoneNodes && this._activePhoneNodes.length) {
        const now = (this.ctx && this.ctx.currentTime) ? this.ctx.currentTime : 0;
        this._activePhoneNodes.forEach(node => {
          try {
            if (node.gain && node.gain.gain) {
              node.gain.gain.cancelScheduledValues(now);
              node.gain.gain.setValueAtTime(0, now);
            }
            if (node.osc) {
              node.osc.stop(now);
              node.osc.disconnect();
            }
          } catch (e) {}
        });
        this._activePhoneNodes = [];
      }
    }
  };

  // ==========================================================================
  // 3. 場景圖資與立繪快取載入器
  // ==========================================================================
  const AssetLoader = {
    scenes: {},
    portraits: {},

    // 邏輯場景規格 (寬x高)
    sceneSpecs: {
      'S1': { w: 1280, h: 960, name: '校園主地圖' },
      'S2': { w: 768,  h: 512, name: '校門口' },
      'S3': { w: 800,  h: 576, name: '班級教室' },
      'S4': { w: 1280, h: 576, name: '走廊' },
      'S5': { w: 768,  h: 576, name: '穿堂大廳' },
      'S6': { w: 640,  h: 480, name: '輔導室' },
      'S7': { w: 704,  h: 512, name: '學務處' },
      'S8': { w: 512,  h: 384, name: '家：臥室' },
      'S9': { w: 640,  h: 480, name: '家：客廳' }
    },

    sceneList: {
      'S1': '圖片/S1校園主題圖.jpg',
      'S2': '圖片/S2 校門口.jpg',
      'S3': '圖片/S3教室.jpg',
      'S4': '圖片/S4走廊.jpg',
      'S5': '圖片/S5 穿堂.jpg',
      'S6': '圖片/S6 輔導室.jpg',
      'S7': '圖片/S7 學務處.jpg',
      'S8': '圖片/S8臥室.jpg',
      'S9': '圖片/S9 【家：客廳】.jpg'
    },

    portraitList: {
      '主角_男孩': '角色/主角_男孩.png',
      '主角_女孩': '角色/主角_女孩.png',
      '主角_中性': '角色/主角_中性.png',
      '老師': '角色/老師.png',
      '導師': '角色/老師.png',
      '同學甲': '角色/同學甲.png',
      '同學乙': '角色/同學乙.png',
      '同學丙': '角色/同學丙.png',
      '同學丁': '角色/同學丁.png',
      '同學戊': '角色/同學戊.png',
      '生輔組長': '角色/生輔組長.png',
      '媽媽': '角色/媽媽.png',
      '同學乙的爸爸': '角色/同學乙的爸爸.png',
      '同學甲的媽媽': '角色/同學甲的媽媽.png',
      '輔導老師': '角色/專任輔導老師.png',
      '專任輔導老師': '角色/專任輔導老師.png'
    },

    init() {
      for (const [key, path] of Object.entries(this.sceneList)) {
        const img = new Image();
        img.src = path;
        this.scenes[key] = img;
      }
      for (const [key, path] of Object.entries(this.portraitList)) {
        const img = new Image();
        img.src = path;
        this.portraits[key] = img;
      }
    }
  };

  // ==========================================================================
  // 4. 地圖全身走動小人與豐富 NPC 繪製器 (精緻五官、差異化角色與目標黃色光暈)
  // ==========================================================================
  const CharacterSpriteRenderer = {
    draw(ctx, x, y, direction, frame, gender, scale = 1.0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // 腳底柔和橢圓陰影
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40, 32, 24, 0.2)';
      ctx.fill();

      const stepOffset = Math.sin(frame * Math.PI) * 4;
      const bobbing = Math.abs(Math.sin(frame * Math.PI)) * 1.8;

      let hairColor = '#4a3326';      // 男孩深棕
      let shirtColor = '#f5f0e6';     // 米白制服
      let bottomColor = '#2f3e58';    // 深藍褲/裙
      let backpackColor = '#4a5d6e';  // 藍灰書包
      let skinColor = '#fae2ce';

      if (gender === 'girl') {
        hairColor = '#302624';
      } else if (gender === 'neutral') {
        hairColor = '#2b2927';
        shirtColor = '#e3edec';       // 體育服淺藍白
        bottomColor = '#2d3748';
      }

      const bodyY = -22 - bobbing;

      // --- A. 背面朝上走路 (方向：up) ---
      if (direction === 'up') {
        ctx.fillStyle = bottomColor;
        ctx.fillRect(-8, bodyY + 12 - stepOffset, 5, 10);
        ctx.fillRect(3, bodyY + 12 + stepOffset, 5, 10);

        ctx.fillStyle = '#444';
        ctx.fillRect(-9, bodyY + 20 - stepOffset, 7, 4);
        ctx.fillRect(2, bodyY + 20 + stepOffset, 7, 4);

        ctx.fillStyle = shirtColor;
        ctx.fillRect(-10, bodyY, 20, 14);

        // 藍灰雙肩書包（背後完整視角）
        ctx.fillStyle = backpackColor;
        ctx.beginPath();
        ctx.roundRect(-8, bodyY + 1, 16, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#657a8c';
        ctx.fillRect(-6, bodyY + 7, 12, 4);

        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 11, 0, Math.PI * 2);
        ctx.fill();

        if (gender === 'girl') {
          ctx.beginPath();
          ctx.ellipse(0, bodyY - 6, 13, 8, 0, 0, Math.PI);
          ctx.fill();
        }
      }

      // --- B. 正面朝下走路 (方向：down) - 精緻靈動五官 ---
      else if (direction === 'down') {
        ctx.fillStyle = backpackColor;
        ctx.fillRect(-11, bodyY + 2, 3, 10);
        ctx.fillRect(8, bodyY + 2, 3, 10);

        ctx.fillStyle = (gender === 'girl') ? skinColor : bottomColor;
        ctx.fillRect(-8, bodyY + 12 + stepOffset, 5, 10);
        ctx.fillRect(3, bodyY + 12 - stepOffset, 5, 10);

        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(-9, bodyY + 20 + stepOffset, 7, 4);
        ctx.fillRect(2, bodyY + 20 - stepOffset, 7, 4);

        ctx.fillStyle = bottomColor;
        if (gender === 'girl') {
          ctx.beginPath();
          ctx.moveTo(-10, bodyY + 10);
          ctx.lineTo(10, bodyY + 10);
          ctx.lineTo(12, bodyY + 16);
          ctx.lineTo(-12, bodyY + 16);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-10, bodyY + 10, 20, 6);
        }

        ctx.fillStyle = shirtColor;
        ctx.fillRect(-10, bodyY, 20, 11);

        ctx.fillStyle = '#dcd4c6';
        ctx.beginPath();
        ctx.moveTo(-4, bodyY);
        ctx.lineTo(0, bodyY + 4);
        ctx.lineTo(4, bodyY);
        ctx.closePath();
        ctx.fill();

        // 臉型本體
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 1. 溫和細緻眉毛
        ctx.strokeStyle = '#5a3d2e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, bodyY - 13);
        ctx.lineTo(-2, bodyY - 13.5);
        ctx.moveTo(2, bodyY - 13.5);
        ctx.lineTo(6, bodyY - 13);
        ctx.stroke();

        // 2. 靈動大眼睛 (黑瞳 + 白高光)
        ctx.fillStyle = '#231c18';
        ctx.beginPath();
        ctx.ellipse(-4, bodyY - 10, 1.7, 2.2, 0, 0, Math.PI * 2);
        ctx.ellipse(4, bodyY - 10, 1.7, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4.6, bodyY - 10.7, 0.7, 0, Math.PI * 2);
        ctx.arc(3.4, bodyY - 10.7, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 3. 雙頰健康微粉腮紅
        ctx.fillStyle = 'rgba(240, 120, 110, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-6.5, bodyY - 7, 2.2, 1.3, 0, 0, Math.PI * 2);
        ctx.ellipse(6.5, bodyY - 7, 2.2, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. 上揚微笑嘴巴
        ctx.strokeStyle = '#c46a60';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, bodyY - 7, 1.8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 頭髮
        ctx.fillStyle = hairColor;
        if (gender === 'boy') {
          ctx.beginPath();
          ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
          ctx.lineTo(8, bodyY - 12);
          ctx.lineTo(5, bodyY - 9);
          ctx.lineTo(1, bodyY - 12);
          ctx.lineTo(-3, bodyY - 8);
          ctx.lineTo(-8, bodyY - 12);
          ctx.closePath();
          ctx.fill();
        } else if (gender === 'girl') {
          ctx.beginPath();
          ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
          ctx.lineTo(10, bodyY - 5);
          ctx.lineTo(6, bodyY - 10);
          ctx.lineTo(-6, bodyY - 10);
          ctx.lineTo(-10, bodyY - 5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
          ctx.lineTo(6, bodyY - 10);
          ctx.lineTo(-6, bodyY - 10);
          ctx.closePath();
          ctx.fill();
        }
      }

      // --- C. 側面走路 (方向：left / right) - 精緻側臉五官 ---
      else {
        const isLeft = (direction === 'left');
        const flip = isLeft ? -1 : 1;
        ctx.scale(flip, 1);

        ctx.fillStyle = backpackColor;
        ctx.beginPath();
        ctx.roundRect(-12, bodyY + 1, 7, 12, 2);
        ctx.fill();

        ctx.fillStyle = (gender === 'girl') ? skinColor : bottomColor;
        ctx.fillRect(-3 - stepOffset, bodyY + 12, 5, 10);
        ctx.fillRect(-1 + stepOffset, bodyY + 12, 5, 10);

        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(-2 - stepOffset, bodyY + 20, 6, 4);
        ctx.fillRect(0 + stepOffset, bodyY + 20, 6, 4);

        ctx.fillStyle = shirtColor;
        ctx.fillRect(-7, bodyY, 13, 11);

        if (gender === 'girl') {
          ctx.fillStyle = bottomColor;
          ctx.fillRect(-7, bodyY + 10, 13, 5);
        }

        ctx.fillStyle = shirtColor;
        ctx.fillRect(-2 + stepOffset, bodyY + 2, 4, 9);

        // 側臉輪廓
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 側面眉毛
        ctx.strokeStyle = '#5a3d2e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2, bodyY - 13.5);
        ctx.lineTo(6, bodyY - 13);
        ctx.stroke();

        // 側面眼睛 (含高光)
        ctx.fillStyle = '#231c18';
        ctx.beginPath();
        ctx.ellipse(4, bodyY - 10, 1.5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(3.4, bodyY - 10.7, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // 側面腮紅與小嘴
        ctx.fillStyle = 'rgba(240, 120, 110, 0.45)';
        ctx.beginPath();
        ctx.ellipse(5, bodyY - 7, 2, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c46a60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(2.5, bodyY - 6.5, 1.6, 0.1, Math.PI * 0.6);
        ctx.stroke();

        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(-2, bodyY - 12, 10, Math.PI * 0.7, Math.PI * 1.9);
        ctx.lineTo(6, bodyY - 11);
        ctx.lineTo(2, bodyY - 6);
        ctx.lineTo(-6, bodyY - 7);
        ctx.closePath();
        ctx.fill();

        if (gender === 'girl') {
          ctx.beginPath();
          ctx.ellipse(-4, bodyY - 5, 5, 8, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    },

    // 繪製差異化 NPC 與路人學生 (支援劇本角色頭頂姓名標籤、目標呼吸光暈與步伐動畫)
    drawNPC(ctx, x, y, role, isTarget = false, direction = 'down', frame = 0, nameTag = '') {
      ctx.save();
      ctx.translate(x, y);

      const pulse = (Math.sin(Date.now() / 380) + 1) * 0.5;

      // 若為當前任務對話目標，腳底與身周亮起醒目的淺黃色呼吸光暈
      if (isTarget) {
        ctx.beginPath();
        ctx.ellipse(0, 2, 22 + pulse * 6, 9 + pulse * 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 210, 85, ${0.35 + pulse * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(0, 2, 16, 6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(235, 175, 45, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 腳底微陰影
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40, 32, 24, 0.2)';
      ctx.fill();

      const bodyY = -22;

      // 角色頭頂姓名標籤 (清楚標註劇本人物，讓玩家一眼辨識目標)
      const defaultRoleNames = {
        'counselor': '輔導老師',
        'discipline_master': '生教組長',
        'mother': '媽媽',
        'guard': '警衛叔叔',
        'classmate_a': '同學甲',
        'classmate_b': '同學乙',
        'classmate_c': '同學丙',
        'classmate_b_dad': '同學乙爸爸'
      };
      const finalName = (nameTag !== undefined && nameTag !== null && nameTag !== '')
        ? nameTag
        : (defaultRoleNames[role] || '');

      if (finalName) {
        ctx.save();
        ctx.font = 'bold 11px "Microsoft JhengHei", "Noto Sans TC", sans-serif';
        const tagText = finalName;
        const tagMetrics = ctx.measureText(tagText);
        const tagW = Math.max(38, tagMetrics.width + 12);
        const tagH = 17;
        // 將姓名標籤大幅上移懸浮於頭頂上方，絕不遮掩任何五官與頭髮
        const tagY = isTarget ? (bodyY - 42 - pulse * 2) : (bodyY - 38);

        // 圓角膠囊底色
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-tagW / 2, tagY, tagW, tagH, 8);
        } else {
          ctx.rect(-tagW / 2, tagY, tagW, tagH);
        }

        if (isTarget) {
          const pulseAlpha = 0.88 + pulse * 0.12;
          ctx.fillStyle = `rgba(228, 135, 22, ${pulseAlpha})`;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // 目標頭頂金黃色驚嘆號標記
          ctx.fillStyle = '#f7b828';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('！', 0, tagY - 6 - pulse * 2);
        } else {
          ctx.fillStyle = 'rgba(38, 30, 24, 0.82)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 姓名文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Microsoft JhengHei", "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, 0, tagY + tagH / 2 + 0.5);
        ctx.restore();
      }

      // 1. 輔導老師 (米色針織開襟衫、長裙、知性金屬眼鏡、束髮)
      if (role === 'counselor') {
        ctx.fillStyle = '#4a382e'; // 長裙
        ctx.fillRect(-9, bodyY + 12, 18, 12);
        ctx.fillStyle = '#3a322d';
        ctx.fillRect(-7, bodyY + 22, 5, 4);
        ctx.fillRect(2, bodyY + 22, 5, 4);

        ctx.fillStyle = '#eae2d0'; // 米白針織開襟衫
        ctx.fillRect(-10, bodyY, 20, 14);
        ctx.fillStyle = '#382f28'; // 內搭高領
        ctx.fillRect(-3, bodyY, 6, 6);

        // 臉部
        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 細框眼鏡
        ctx.strokeStyle = '#c49742';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-6, bodyY - 12, 4.5, 3.5);
        ctx.strokeRect(1.5, bodyY - 12, 4.5, 3.5);
        ctx.beginPath();
        ctx.moveTo(-1.5, bodyY - 10.5);
        ctx.lineTo(1.5, bodyY - 10.5);
        ctx.stroke();

        // 溫和眼睛與微笑
        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-3.8, bodyY - 10.5, 1.2, 0, Math.PI * 2);
        ctx.arc(3.8, bodyY - 10.5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c46a60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, bodyY - 7, 2, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 知性棕色長髮
        ctx.fillStyle = '#423024';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.lineTo(10, bodyY - 2);
        ctx.lineTo(7, bodyY - 10);
        ctx.lineTo(-7, bodyY - 10);
        ctx.lineTo(-10, bodyY - 2);
        ctx.closePath();
        ctx.fill();
      }

      // 2. 學務主任 (深灰西裝、白襯衫、暗紅領帶、威嚴短髮)
      else if (role === 'discipline_master') {
        ctx.fillStyle = '#2d333b'; // 西裝褲
        ctx.fillRect(-8, bodyY + 12, 5, 10);
        ctx.fillRect(3, bodyY + 12, 5, 10);

        ctx.fillStyle = '#3a424d'; // 深灰西裝外套
        ctx.fillRect(-11, bodyY, 22, 13);
        ctx.fillStyle = '#ffffff'; // 白襯衫 V 領
        ctx.beginPath();
        ctx.moveTo(-4, bodyY);
        ctx.lineTo(0, bodyY + 6);
        ctx.lineTo(4, bodyY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#942b2b'; // 紅領帶
        ctx.beginPath();
        ctx.moveTo(-1.5, bodyY + 1);
        ctx.lineTo(1.5, bodyY + 1);
        ctx.lineTo(1, bodyY + 8);
        ctx.lineTo(0, bodyY + 10);
        ctx.lineTo(-1, bodyY + 8);
        ctx.closePath();
        ctx.fill();

        // 臉部
        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 濃眉與雙眼
        ctx.strokeStyle = '#2b231d';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-6, bodyY - 13);
        ctx.lineTo(-1, bodyY - 12);
        ctx.moveTo(1, bodyY - 12);
        ctx.lineTo(6, bodyY - 13);
        ctx.stroke();

        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-3.5, bodyY - 9.5, 1.4, 0, Math.PI * 2);
        ctx.arc(3.5, bodyY - 9.5, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // 短灰黑髮
        ctx.fillStyle = '#33383e';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.lineTo(8, bodyY - 11);
        ctx.lineTo(-8, bodyY - 11);
        ctx.closePath();
        ctx.fill();
      }

      // 2.5 同學乙爸爸 / 家長 (深棕西裝夾克、淺藍襯衫、深灰長褲、俐落短髮)
      else if (role === 'classmate_b_dad' || role === 'parent_b') {
        ctx.fillStyle = '#34383d'; // 深灰長褲
        ctx.fillRect(-8, bodyY + 12, 5, 10);
        ctx.fillRect(3, bodyY + 12, 5, 10);

        ctx.fillStyle = '#594436'; // 深棕西裝夾克
        ctx.fillRect(-11, bodyY, 22, 13);
        ctx.fillStyle = '#c5d9ec'; // 淺藍襯衫
        ctx.beginPath();
        ctx.moveTo(-4, bodyY);
        ctx.lineTo(0, bodyY + 6);
        ctx.lineTo(4, bodyY);
        ctx.closePath();
        ctx.fill();

        // 臉部
        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 雙眼與眉毛
        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-3.5, bodyY - 9.5, 1.4, 0, Math.PI * 2);
        ctx.arc(3.5, bodyY - 9.5, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // 深棕黑短髮
        ctx.fillStyle = '#2c221b';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.lineTo(8, bodyY - 11);
        ctx.lineTo(-8, bodyY - 11);
        ctx.closePath();
        ctx.fill();
      }

      // 3. 媽媽 (溫柔粉米色開襟衫、居家長裙、溫暖側身)
      else if (role === 'mother') {
        ctx.fillStyle = '#7a6458'; // 棕色長裙
        ctx.fillRect(-9, bodyY + 12, 18, 12);

        ctx.fillStyle = '#eddcd2'; // 粉米開襟衫
        ctx.fillRect(-10, bodyY, 20, 13);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 溫柔笑眼
        ctx.strokeStyle = '#4a3326';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-4, bodyY - 10, 2, Math.PI * 0.8, Math.PI * 1.8);
        ctx.arc(4, bodyY - 10, 2, Math.PI * 0.8, Math.PI * 1.8);
        ctx.stroke();

        ctx.fillStyle = 'rgba(235, 130, 120, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-6, bodyY - 7, 2, 1.2, 0, 0, Math.PI * 2);
        ctx.ellipse(6, bodyY - 7, 2, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 溫柔深栗色長髮
        ctx.fillStyle = '#4a3326';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.lineTo(10, bodyY - 3);
        ctx.lineTo(6, bodyY - 9);
        ctx.lineTo(-6, bodyY - 9);
        ctx.lineTo(-10, bodyY - 3);
        ctx.closePath();
        ctx.fill();
      }

      // 4. 警衛叔叔 (淺藍制服、警衛大盤帽、深藍長褲)
      else if (role === 'guard') {
        ctx.fillStyle = '#1e2b3e'; // 深藍警衛褲
        ctx.fillRect(-8, bodyY + 12, 5, 10);
        ctx.fillRect(3, bodyY + 12, 5, 10);

        ctx.fillStyle = '#9ec1e6'; // 淺藍制服
        ctx.fillRect(-10, bodyY, 20, 13);
        ctx.fillStyle = '#2d3e50'; // 深色皮帶
        ctx.fillRect(-10, bodyY + 10, 20, 3);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-3.5, bodyY - 10, 1.3, 0, Math.PI * 2);
        ctx.arc(3.5, bodyY - 10, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // 警衛大盤帽
        ctx.fillStyle = '#1e2b3e';
        ctx.beginPath();
        ctx.ellipse(0, bodyY - 13, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-9, bodyY - 19, 18, 7);
        ctx.fillStyle = '#d4af37'; // 金色警徽
        ctx.fillRect(-2, bodyY - 17, 4, 3);
      }

      // 5. 同學丙 (深藍毛衣背心、溫和笑容、友善支持同儕)
      else if (role === 'classmate_c') {
        ctx.fillStyle = '#2f3e58'; // 深藍校褲
        ctx.fillRect(-8, bodyY + 12, 5, 10);
        ctx.fillRect(3, bodyY + 12, 5, 10);

        ctx.fillStyle = '#f5f0e6'; // 白襯衫
        ctx.fillRect(-10, bodyY, 20, 12);
        ctx.fillStyle = '#253d5b'; // 深藍毛衣背心
        ctx.fillRect(-8, bodyY + 1, 16, 11);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // 溫和眼睛
        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-4, bodyY - 10, 1.6, 0, Math.PI * 2);
        ctx.arc(4, bodyY - 10, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4.5, bodyY - 10.7, 0.6, 0, Math.PI * 2);
        ctx.arc(3.5, bodyY - 10.7, 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c46a60';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, bodyY - 7, 2, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // 平整俐落深黑髮
        ctx.fillStyle = '#27292d';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.lineTo(8, bodyY - 10);
        ctx.lineTo(-8, bodyY - 10);
        ctx.closePath();
        ctx.fill();
      }

      // 6. 同學乙 (捲棕髮、深灰背心、較高身形)
      else if (role === 'classmate_b') {
        ctx.fillStyle = '#2b3648';
        ctx.fillRect(-8, bodyY + 13, 5, 11);
        ctx.fillRect(3, bodyY + 13, 5, 11);

        ctx.fillStyle = '#ece4d4';
        ctx.fillRect(-10, bodyY, 20, 13);
        ctx.fillStyle = '#525a66'; // 深灰背心
        ctx.fillRect(-8, bodyY + 1, 16, 12);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-4, bodyY - 10, 1.4, 0, Math.PI * 2);
        ctx.arc(4, bodyY - 10, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // 棕色微捲髮
        ctx.fillStyle = '#5c4033';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.arc(-6, bodyY - 10, 4, 0, Math.PI * 2);
        ctx.arc(6, bodyY - 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. 同學甲 (短黑微刺髮、白襯衫微開領)
      else if (role === 'classmate_a') {
        ctx.fillStyle = '#27384e';
        ctx.fillRect(-8, bodyY + 12, 5, 10);
        ctx.fillRect(3, bodyY + 12, 5, 10);

        ctx.fillStyle = '#f7f4ec';
        ctx.fillRect(-10, bodyY, 20, 11);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-4, bodyY - 10, 1.5, 0, Math.PI * 2);
        ctx.arc(4, bodyY - 10, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2a2826';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12, 11, Math.PI, 0);
        ctx.lineTo(8, bodyY - 11);
        ctx.lineTo(4, bodyY - 7);
        ctx.lineTo(0, bodyY - 12);
        ctx.lineTo(-4, bodyY - 7);
        ctx.lineTo(-8, bodyY - 11);
        ctx.closePath();
        ctx.fill();
      }

      // 8. 路人女學生 (雙馬尾/短髮、百褶裙、支援走動步態)
      else if (role === 'ambient_girl') {
        const stepOffset = Math.sin(frame * Math.PI) * 3.5;
        const bobbing = Math.abs(Math.sin(frame * Math.PI)) * 1.5;

        ctx.fillStyle = '#fae2ce';
        ctx.fillRect(-7, bodyY + 12 - stepOffset, 4, 9);
        ctx.fillRect(3, bodyY + 12 + stepOffset, 4, 9);

        ctx.fillStyle = '#31445e'; // 百褶裙
        ctx.fillRect(-9, bodyY + 9 - bobbing, 18, 6);

        ctx.fillStyle = '#f7f4ed';
        ctx.fillRect(-9, bodyY - bobbing, 18, 10);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10 - bobbing, 9.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-3.5, bodyY - 10 - bobbing, 1.3, 0, Math.PI * 2);
        ctx.arc(3.5, bodyY - 10 - bobbing, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // 雙馬尾長髮
        ctx.fillStyle = '#3d2d22';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12 - bobbing, 10.5, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-10, bodyY - 7 - bobbing, 3, 7, 0.2, 0, Math.PI * 2);
        ctx.ellipse(10, bodyY - 7 - bobbing, 3, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 9. 路人男學生 (運動校服、支援走動步態)
      else {
        const stepOffset = Math.sin(frame * Math.PI) * 3.5;
        const bobbing = Math.abs(Math.sin(frame * Math.PI)) * 1.5;

        ctx.fillStyle = '#283647';
        ctx.fillRect(-7, bodyY + 12 - stepOffset, 4, 10);
        ctx.fillRect(3, bodyY + 12 + stepOffset, 4, 10);

        ctx.fillStyle = '#e8eff5';
        ctx.fillRect(-9, bodyY - bobbing, 18, 12);

        ctx.fillStyle = '#fae2ce';
        ctx.beginPath();
        ctx.arc(0, bodyY - 10 - bobbing, 9.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.arc(-3.5, bodyY - 10 - bobbing, 1.3, 0, Math.PI * 2);
        ctx.arc(3.5, bodyY - 10 - bobbing, 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3b312b';
        ctx.beginPath();
        ctx.arc(0, bodyY - 12 - bobbing, 10.5, Math.PI, 0);
        ctx.lineTo(8, bodyY - 10 - bobbing);
        ctx.lineTo(-8, bodyY - 10 - bobbing);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  };

  // ==========================================================================
  // 4.5 校園路人自主巡邏與漫步管理器 (路人學生自由走動、動畫步態、面向互動)
  // ==========================================================================
  const AmbientNPCManager = {
    npcs: [
      // S3 教室路人 (走道間漫步)
      {
        id: 'ambient_s3_1',
        sceneId: 'S3',
        role: 'ambient_boy',
        x: 377,
        y: 230,
        minX: 360, maxX: 395, minY: 220, maxY: 480, // 中央大走道
        speed: 25,
        dir: 'down',
        state: 'walk',
        timer: 3.5,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學抬起頭笑了笑：『早自習要專心喔，今天有隨堂小考呢。』」'
      },
      {
        id: 'ambient_s3_2',
        sceneId: 'S3',
        role: 'ambient_girl',
        x: 715,
        y: 350,
        minX: 700, maxX: 740, minY: 230, maxY: 470, // 門口靠牆走道
        speed: 22,
        dir: 'up',
        state: 'idle',
        timer: 2.0,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學正忙著整理書包：『我的筆記本借隔壁班看，還沒拿回來呢。』」'
      },

      // S4 走廊路人 (長走廊漫步與聊天同學群)
      {
        id: 'ambient_s4_1',
        sceneId: 'S4',
        role: 'ambient_girl',
        x: 230,
        y: 310,
        minX: 180, maxX: 460, minY: 290, maxY: 340,
        speed: 32,
        dir: 'right',
        state: 'walk',
        timer: 4.0,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學指著布告欄：『下週好像有校園反霸凌宣導週的演講耶！』」'
      },
      {
        id: 'ambient_s4_2',
        sceneId: 'S4',
        role: 'ambient_boy',
        x: 950,
        y: 310,
        minX: 720, maxX: 1040, minY: 290, maxY: 340,
        speed: 30,
        dir: 'left',
        state: 'walk',
        timer: 3.2,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「走廊窗外的微風吹得很舒服：『站在這裡吹吹風最放鬆了。』」'
      },
      {
        id: 'ambient_s4_3',
        sceneId: 'S4',
        role: 'ambient_girl',
        x: 420,
        y: 315,
        minX: 360, maxX: 640, minY: 295, maxY: 335,
        speed: 26,
        dir: 'right',
        state: 'idle',
        timer: 2.8,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學抱著美術作業：『希望等一下的點名大家都平平安安的。』」'
      },
      {
        id: 'ambient_s4_4',
        sceneId: 'S4',
        role: 'ambient_boy',
        x: 620,
        y: 305,
        minX: 480, maxX: 780, minY: 290, maxY: 340,
        speed: 28,
        dir: 'left',
        state: 'walk',
        timer: 3.6,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學正要回教室：『你還好嗎？如果有需要，隨時可以跟班長說喔。』」'
      },
      {
        id: 'ambient_s4_5',
        sceneId: 'S4',
        role: 'ambient_girl',
        x: 820,
        y: 320,
        minX: 750, maxX: 980, minY: 295, maxY: 335,
        speed: 24,
        dir: 'right',
        state: 'idle',
        timer: 3.0,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學靠在欄杆旁：『看著操場綠油油的草皮，心情好很多呢。』」'
      },

      // S5 穿堂路人 (大廳寬敞穿梭與聚集同學)
      {
        id: 'ambient_s5_1',
        role: 'ambient_boy',
        sceneId: 'S5',
        x: 230,
        y: 280,
        minX: 180, maxX: 560, minY: 220, maxY: 420,
        speed: 30,
        dir: 'right',
        state: 'walk',
        timer: 3.0,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「『穿堂的大鐘好像走得蠻準的，我要趕緊回教室了！』」'
      },
      {
        id: 'ambient_s5_2',
        role: 'ambient_girl',
        sceneId: 'S5',
        x: 520,
        y: 340,
        minX: 200, maxX: 580, minY: 220, maxY: 420,
        speed: 28,
        dir: 'left',
        state: 'idle',
        timer: 2.5,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學向你揮揮手：『早安！今天的天氣真好。』」'
      },
      {
        id: 'ambient_s5_3',
        role: 'ambient_girl',
        sceneId: 'S5',
        x: 290,
        y: 220,
        minX: 160, maxX: 420, minY: 180, maxY: 350,
        speed: 26,
        dir: 'down',
        state: 'walk',
        timer: 3.5,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學端詳著榮譽榜：『學校每個月都有推廣友善校園活動耶。』」'
      },
      {
        id: 'ambient_s5_4',
        role: 'ambient_boy',
        sceneId: 'S5',
        x: 430,
        y: 390,
        minX: 250, maxX: 550, minY: 280, maxY: 450,
        speed: 32,
        dir: 'up',
        state: 'walk',
        timer: 3.2,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學背著運動水壺：『下課走動一下，整個人都有精神了！』」'
      },
      {
        id: 'ambient_s5_5',
        role: 'ambient_boy',
        sceneId: 'S5',
        x: 350,
        y: 260,
        minX: 220, maxX: 500, minY: 200, maxY: 380,
        speed: 22,
        dir: 'right',
        state: 'idle',
        timer: 2.8,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學微笑問候：『嗨！今天要一起加油喔。』」'
      },

      // S1 校園主地圖路人 (操場奔跑、散步與運動群)
      {
        id: 'ambient_s1_1',
        role: 'ambient_girl',
        sceneId: 'S1',
        x: 480,
        y: 420,
        minX: 300, maxX: 600, minY: 360, maxY: 520,
        speed: 35,
        dir: 'right',
        state: 'walk',
        timer: 4.0,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與散步同學交談',
        dialogue: '「同學看著藍天：『操場的陽光好溫暖，心情也跟著開朗起來了。』」'
      },
      {
        id: 'ambient_s1_2',
        role: 'ambient_boy',
        sceneId: 'S1',
        x: 780,
        y: 500,
        minX: 680, maxX: 980, minY: 400, maxY: 650,
        speed: 32,
        dir: 'left',
        state: 'walk',
        timer: 3.0,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與散步同學交談',
        dialogue: '「同學抱著籃球走過：『下課一起去投籃吧！運動最抒壓了。』」'
      },
      {
        id: 'ambient_s1_3',
        role: 'ambient_boy',
        sceneId: 'S1',
        x: 380,
        y: 620,
        minX: 240, maxX: 650, minY: 520, maxY: 780,
        speed: 42,
        dir: 'down',
        state: 'walk',
        timer: 4.5,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與慢跑同學交談',
        dialogue: '「同學正沿著操場慢跑：『一、二、一、二！慢跑流汗能把煩惱都甩掉！』」'
      },
      {
        id: 'ambient_s1_4',
        role: 'ambient_girl',
        sceneId: 'S1',
        x: 880,
        y: 720,
        minX: 650, maxX: 1050, minY: 600, maxY: 860,
        speed: 28,
        dir: 'up',
        state: 'walk',
        timer: 3.8,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與散步同學交談',
        dialogue: '「同學蹲在花圃旁看蝴蝶：『你看，校園裡的花開得好漂亮。』」'
      },
      {
        id: 'ambient_s1_5',
        role: 'ambient_boy',
        sceneId: 'S1',
        x: 580,
        y: 760,
        minX: 420, maxX: 820, minY: 680, maxY: 890,
        speed: 30,
        dir: 'right',
        state: 'idle',
        timer: 2.5,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學仰望大榕樹：『大樹下的陰涼處最適合下課聊天了。』」'
      },
      {
        id: 'ambient_s1_6',
        role: 'ambient_girl',
        sceneId: 'S1',
        x: 640,
        y: 340,
        minX: 450, maxX: 850, minY: 280, maxY: 420,
        speed: 26,
        dir: 'left',
        state: 'walk',
        timer: 3.2,
        frame: 0,
        animTimer: 0,
        prompt: '按 [E] 與同學交談',
        dialogue: '「同學走向司令台：『聽說校長在週會常說：每個人都值得被溫柔對待。』」'
      }
    ],

    update(dt) {
      if (GameState.dialogue.active) return;

      const currentScene = GameState.currentSceneId;
      this.npcs.forEach(npc => {
        if (npc.sceneId !== currentScene) return;

        npc.timer -= dt;

        if (npc.state === 'idle') {
          npc.frame = 0;
          if (npc.timer <= 0) {
            npc.state = 'walk';
            npc.timer = 2.0 + Math.random() * 3.5;
            const dirs = ['left', 'right', 'up', 'down'];
            npc.dir = dirs[Math.floor(Math.random() * dirs.length)];
          }
        } else if (npc.state === 'walk') {
          npc.animTimer += dt * 5;
          npc.frame = npc.animTimer % 4;

          let vx = 0;
          let vy = 0;
          if (npc.dir === 'left') vx = -npc.speed;
          else if (npc.dir === 'right') vx = npc.speed;
          else if (npc.dir === 'up') vy = -npc.speed;
          else if (npc.dir === 'down') vy = npc.speed;

          const nextX = npc.x + vx * dt;
          const nextY = npc.y + vy * dt;

          let turn = false;
          if (nextX < npc.minX || nextX > npc.maxX) {
            npc.dir = (npc.dir === 'left') ? 'right' : 'left';
            turn = true;
          } else {
            npc.x = nextX;
          }

          if (nextY < npc.minY || nextY > npc.maxY) {
            npc.dir = (npc.dir === 'up') ? 'down' : 'up';
            turn = true;
          } else {
            npc.y = nextY;
          }

          if (npc.timer <= 0 || turn) {
            npc.state = 'idle';
            npc.timer = 1.5 + Math.random() * 2.5;
          }
        }
      });
    },

    draw(ctx, currentSceneId) {
      this.npcs.forEach(npc => {
        if (npc.sceneId === currentSceneId) {
          CharacterSpriteRenderer.drawNPC(ctx, npc.x, npc.y, npc.role, false, npc.dir, npc.frame);
        }
      });
    },

    getInteractableInScene(sceneId, px, py, maxDist = 45) {
      for (const npc of this.npcs) {
        if (npc.sceneId === sceneId) {
          const dist = Math.hypot(px - npc.x, py - npc.y);
          if (dist <= maxDist) {
            if (Math.abs(px - npc.x) > Math.abs(py - npc.y)) {
              npc.dir = px > npc.x ? 'right' : 'left';
            } else {
              npc.dir = py > npc.y ? 'down' : 'up';
            }
            npc.state = 'idle';
            npc.timer = 4.0;
            return {
              id: npc.id,
              x: npc.x,
              y: npc.y,
              radius: maxDist,
              prompt: npc.prompt,
              inspectText: npc.dialogue
            };
          }
        }
      }
      return null;
    }
  };

  // ==========================================================================
  // 4.6 天色光影、環境氛圍與心理狀態濾鏡 (依據 GDD 7.2 與五維整體狀態值動態演變)
  // ==========================================================================
  const AtmosphereRenderer = {
    particles: [],
    currentScore: 37, // 遊戲開場初始整體狀態值 37 (落在灰藍黎明前)
    targetScore: 37,

    init() {
      this.particles = [];
      for (let i = 0; i < 36; i++) {
        this.particles.push({
          x: Math.random() * 1280,
          y: Math.random() * 960,
          vx: (Math.random() - 0.5) * 12,
          vy: -10 - Math.random() * 16,
          radius: 1.2 + Math.random() * 2.2,
          alpha: 0.2 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2
        });
      }
      this.currentScore = (GameState && GameState.getOverallScore) ? GameState.getOverallScore() : 37;
      this.targetScore = this.currentScore;
    },

    setTargetScore(val) {
      this.targetScore = Math.min(100, Math.max(0, val));
    },

    getAtmospherePhase(score) {
      if (score < 30) {
        return { name: '深藍夜色', desc: '天色昏暗陰冷・沉重暗夜', level: 1 };
      } else if (score < 45) {
        return { name: '灰藍黎明前', desc: '微光透出・清晨寒意', level: 2 };
      } else if (score < 60) {
        return { name: '曙光初現', desc: '地平線溫暖淡黃・晨光初照', level: 3 };
      } else if (score < 80) {
        return { name: '日出', desc: '暖橘朝陽灑落・破雲而出', level: 4 };
      } else {
        return { name: '晴朗早晨', desc: '陽光破曉・朝氣蓬勃', level: 5 };
      }
    },

    update(dt, w, h) {
      // 若 GameState 狀態有變動，隨時更新目標值
      if (GameState && GameState.getOverallScore) {
        this.targetScore = GameState.getOverallScore();
      }

      // 平滑插值 (Lerp)：讓天色在數值增減時以平滑動態無縫過渡
      this.currentScore += (this.targetScore - this.currentScore) * Math.min(1.0, dt * 2.0);

      const now = Date.now() / 1000;
      this.particles.forEach(p => {
        p.x += (p.vx + Math.sin(now + p.phase) * 6) * dt;
        p.y += p.vy * dt;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
      });
    },

    draw(ctx, w, h, timeOfDay, stats) {
      ctx.save();

      // 依據規格書 7.2 公式：整體狀態值演變動態光影
      const score = this.currentScore;

      // ----------------------------------------------------------------------
      // 1. 五階段全螢幕天色光影演變濾鏡 (平滑過渡)
      // ----------------------------------------------------------------------
      if (score < 30) {
        // [階段 1：0 ～ 29] 深藍夜色：昏暗、陰冷、沉重
        const deepRatio = 1.0 - (score / 30);
        // 全螢幕沉重深藍冷調
        ctx.fillStyle = `rgba(10, 15, 40, ${0.34 + deepRatio * 0.18})`;
        ctx.fillRect(0, 0, w, h);

        // 壓迫感冷暗角 (Vignette)
        const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.28, w / 2, h / 2, Math.max(w, h) * 0.72);
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(0.65, `rgba(8, 12, 32, ${0.35 + deepRatio * 0.25})`);
        vig.addColorStop(1, `rgba(4, 6, 20, ${0.65 + deepRatio * 0.25})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }
      else if (score < 45) {
        // [階段 2：30 ～ 44] 灰藍黎明前：微光透出、清晨寒意 (開場初始值 37 所在)
        const t = (score - 30) / 15; // 0 ~ 1
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        // 天空微光透出，地面帶晨涼灰藍薄霧
        grad.addColorStop(0, `rgba(110, 135, 175, ${0.26 - t * 0.08})`);
        grad.addColorStop(0.6, `rgba(145, 160, 185, ${0.18 - t * 0.05})`);
        grad.addColorStop(1, `rgba(175, 180, 195, ${0.15 - t * 0.05})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 黎明柔和暗角
        const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.8);
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(1, `rgba(25, 32, 50, ${0.28 - t * 0.12})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }
      else if (score < 60) {
        // [階段 3：45 ～ 59] 曙光初現：地平線泛出溫暖淡黃
        const t = (score - 45) / 15;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `rgba(140, 175, 215, ${0.12 - t * 0.04})`);
        grad.addColorStop(0.5, `rgba(255, 235, 170, ${0.15 + t * 0.08})`);
        grad.addColorStop(1, `rgba(255, 220, 130, ${0.22 + t * 0.08})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 微暖色晨曦輕柔光暈
        const sunGlow = ctx.createRadialGradient(w * 0.5, h * 0.7, 50, w * 0.5, h * 0.7, Math.max(w, h) * 0.6);
        sunGlow.addColorStop(0, `rgba(255, 240, 180, ${0.18 + t * 0.10})`);
        sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, w, h);
      }
      else if (score < 80) {
        // [階段 4：60 ～ 79] 日出：暖橘色光線灑落校園
        const t = (score - 60) / 20;
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, `rgba(255, 160, 60, ${0.20 + t * 0.06})`);
        grad.addColorStop(0.5, `rgba(255, 205, 105, ${0.16 + t * 0.06})`);
        grad.addColorStop(1, `rgba(240, 135, 75, ${0.18 + t * 0.05})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 斜照陽光晨曦光芒
        const sunriseRay = ctx.createRadialGradient(w * 0.15, h * 0.15, 60, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
        sunriseRay.addColorStop(0, `rgba(255, 245, 210, ${0.26 + t * 0.08})`);
        sunriseRay.addColorStop(0.5, `rgba(255, 210, 120, ${0.12 + t * 0.06})`);
        sunriseRay.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunriseRay;
        ctx.fillRect(0, 0, w, h);
      }
      else {
        // [階段 5：80 ～ 100] 晴朗早晨／破曉：明亮、朝氣蓬勃、明透陽光！
        const t = Math.min(1.0, (score - 80) / 20);
        // 全場明朗通透的純淨陽光
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `rgba(255, 248, 220, ${0.16 + t * 0.06})`);
        grad.addColorStop(0.5, `rgba(255, 255, 240, ${0.12 + t * 0.04})`);
        grad.addColorStop(1, `rgba(255, 235, 175, ${0.15 + t * 0.05})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 破曉清晨朝陽大光暈
        const sunBurst = ctx.createRadialGradient(w * 0.5, h * 0.25, 80, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
        sunBurst.addColorStop(0, `rgba(255, 255, 230, ${0.24 + t * 0.08})`);
        sunBurst.addColorStop(0.6, `rgba(255, 240, 190, ${0.10 + t * 0.05})`);
        sunBurst.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunBurst;
        ctx.fillRect(0, 0, w, h);
      }

      // ----------------------------------------------------------------------
      // 2. 破曉金色微光與光塵微粒 (狀態越高越活躍美麗)
      // ----------------------------------------------------------------------
      if (score >= 45) {
        const particleAlpha = Math.min(0.85, 0.25 + (score - 45) / 55 * 0.6);
        ctx.fillStyle = `rgba(255, 230, 140, ${particleAlpha})`;
        this.particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (0.8 + score / 100 * 0.4), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ----------------------------------------------------------------------
      // 3. 臨界狀態應急表現：壓力過載前夕 (壓力 > 80 時的心跳警戒警訊)
      // ----------------------------------------------------------------------
      const stress = stats ? stats.stress : 50;
      if (stress > 80) {
        const pulse = (Math.sin(Date.now() / 280) + 1) * 0.5;
        const alertRatio = (stress - 80) / 20;
        const alertVig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
        alertVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        alertVig.addColorStop(0.7, `rgba(90, 15, 15, ${0.18 * alertRatio * pulse})`);
        alertVig.addColorStop(1, `rgba(130, 20, 20, ${0.40 * alertRatio * pulse})`);
        ctx.fillStyle = alertVig;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();
    }
  };

  // ==========================================================================
  // 5. 全地圖場景互通拓撲與碰撞管理 (依據 GDD 6.2 與 6.3 精準建置)
  // ==========================================================================
  const SceneColliders = {
    // 取得障礙物碰撞矩陣
    getColliders(sceneId) {
      if (sceneId === 'S3') {
        // S3 教室 (800x576) - 依據底圖量測之真實 6 欄 x 4 列課桌椅規格
        const colliders = [];
        colliders.push({ x: 115, y: 140, w: 275, h: 55, tag: 'podium' });

        // 24 組課桌椅完整包覆 (w:58, h:58)，垂直走道寬 50~66px，暢行無阻且絕不踩桌
        const cols = [68, 176, 286, 410, 526, 634];
        const rows = [235, 305, 375, 445];
        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < cols.length; c++) {
            colliders.push({
              x: cols[c],
              y: rows[r],
              w: 58,
              h: 58,
              tag: (c === 2 && r === 1) ? 'player_desk' : 'desk'
            });
          }
        }
        colliders.push({ x: 0, y: 0, w: 800, h: 195, tag: 'wall_north' });
        colliders.push({ x: 0, y: 0, w: 55, h: 576, tag: 'wall_west' });
        colliders.push({ x: 0, y: 535, w: 800, h: 41, tag: 'wall_south' });
        colliders.push({ x: 755, y: 0, w: 45, h: 420, tag: 'wall_east_top' });
        colliders.push({ x: 755, y: 520, w: 45, h: 56, tag: 'wall_east_bottom' });
        return colliders;
      }
      else if (sceneId === 'S4') {
        // S4 走廊 (1280x576) - 南牆右側開口 (x >= 1040) 通往穿堂，樓梯底部設阻擋塊防止走出畫面
        return [
          { x: 0, y: 0, w: 1280, h: 220, tag: 'wall_north' },
          { x: 0, y: 400, w: 1040, h: 176, tag: 'wall_south' }, // 南欄杆只擋到 1040，右側開放向下走
          { x: 1040, y: 535, w: 200, h: 41, tag: 'wall_stairs_bottom' }, // 樓梯底部阻擋塊
          { x: 0, y: 0, w: 60, h: 576, tag: 'wall_west' },
          { x: 1240, y: 0, w: 40, h: 576, tag: 'wall_east' }
        ];
      }
      else if (sceneId === 'S5') {
        // S5 穿堂大廳 (768x576)
        return [
          { x: 0, y: 0, w: 320, h: 120, tag: 'wall' },
          { x: 450, y: 0, w: 320, h: 120, tag: 'wall' },
          { x: 0, y: 0, w: 60, h: 576, tag: 'wall' },
          { x: 708, y: 0, w: 60, h: 576, tag: 'wall' },
          { x: 190, y: 200, w: 60, h: 120, tag: 'pillar_left' },
          { x: 518, y: 200, w: 60, h: 120, tag: 'pillar_right' }
        ];
      }
      else if (sceneId === 'S6') {
        // S6 輔導室 (640x480)
        return [
          { x: 0, y: 0, w: 640, h: 160, tag: 'wall_north' },
          { x: 0, y: 0, w: 50, h: 480, tag: 'wall_west' },
          { x: 590, y: 0, w: 50, h: 480, tag: 'wall_east' },
          { x: 0, y: 440, w: 260, h: 40, tag: 'wall_south_left' },
          { x: 380, y: 440, w: 260, h: 40, tag: 'wall_south_right' },
          { x: 330, y: 255, w: 140, h: 100, tag: 'counseling_table' }
        ];
      }
      else if (sceneId === 'S7') {
        // S7 學務處 (704x512) - 長桌實際範圍 (X:215~515, Y:272~368)，保留四周座椅暢行
        return [
          { x: 0, y: 0, w: 704, h: 160, tag: 'wall_north' },
          { x: 0, y: 0, w: 50, h: 512, tag: 'wall_west' },
          { x: 654, y: 0, w: 50, h: 512, tag: 'wall_east' },
          { x: 0, y: 470, w: 290, h: 42, tag: 'wall_south_left' },
          { x: 410, y: 470, w: 294, h: 42, tag: 'wall_south_right' },
          { x: 215, y: 272, w: 300, h: 96, tag: 'meeting_table' }
        ];
      }
      else if (sceneId === 'S1') {
        // S1 校園主地圖 (1280x960)
        return [
          { x: 0, y: 0, w: 580, h: 260, tag: 'building_left' },
          { x: 700, y: 0, w: 580, h: 260, tag: 'building_right' },
          { x: 0, y: 0, w: 40, h: 960, tag: 'boundary_west' },
          { x: 1240, y: 0, w: 40, h: 960, tag: 'boundary_east' },
          { x: 576, y: 326, w: 128, h: 55, tag: 'stage' },
          { x: 0, y: 920, w: 580, h: 40, tag: 'fence_left' },
          { x: 700, y: 920, w: 580, h: 40, tag: 'fence_right' }
        ];
      }
      else if (sceneId === 'S2') {
        // S2 校門口 (768x512)
        const colliders = [
          { x: 0, y: 0, w: 320, h: 60, tag: 'wall_left' },
          { x: 448, y: 0, w: 320, h: 60, tag: 'wall_right' },
          { x: 0, y: 0, w: 60, h: 512, tag: 'boundary' },
          { x: 708, y: 0, w: 60, h: 512, tag: 'boundary' },
          { x: 524, y: 132, w: 123, h: 120, tag: 'guard_booth' },
          { x: 0, y: 430, w: 260, h: 82, tag: 'school_gate_fence_left' },
          { x: 508, y: 430, w: 260, h: 82, tag: 'school_gate_fence_right' }
        ];
        // 尚未抵達結局時，中央鐵門關閉擋住；抵達結局時，中央鐵門開啟可自由步出校門！
        if (!GameState.quest.completedNodes.has('node9') && GameState.quest.step < 10) {
          colliders.push({ x: 260, y: 430, w: 248, h: 82, tag: 'school_gate_fence_mid' });
        }
        return colliders;
      }
      else if (sceneId === 'S8') {
        // S8 家：臥室 (512x384) - 床在右側，門在左上方
        return [
          { x: 0, y: 0, w: 512, h: 130, tag: 'wall_north' },
          { x: 0, y: 250, w: 40, h: 134, tag: 'wall_west_bottom' }, // 左側門在上方開放
          { x: 0, y: 350, w: 512, h: 34, tag: 'wall_south' },
          { x: 480, y: 0, w: 32, h: 384, tag: 'wall_east' },
          { x: 330, y: 150, w: 150, h: 210, tag: 'bed' }, // 右側床鋪
          { x: 130, y: 160, w: 90, h: 100, tag: 'desk' }, // 書桌
          { x: 235, y: 120, w: 90, h: 130, tag: 'bookshelf' } // 書櫃
        ];
      }
      else if (sceneId === 'S9') {
        // S9 家：客廳 (640x480) - 電視在北中央，電話桌在右上，門在左下
        return [
          { x: 0, y: 0, w: 640, h: 140, tag: 'wall_north' },
          { x: 0, y: 0, w: 40, h: 280, tag: 'wall_west_top' },
          { x: 0, y: 420, w: 40, h: 60, tag: 'wall_west_bottom' }, // 左側門在 280~420 開放
          { x: 0, y: 440, w: 640, h: 40, tag: 'wall_south' },
          { x: 600, y: 0, w: 40, h: 480, tag: 'wall_east' },
          { x: 370, y: 140, w: 140, h: 85, tag: 'tv_cabinet' }, // 電視櫃
          { x: 535, y: 140, w: 75, h: 85, tag: 'phone_table' }, // 電視旁小桌子(電話)
          { x: 70, y: 140, w: 230, h: 150, tag: 'sofa' },
          { x: 250, y: 320, w: 140, h: 110, tag: 'dining_table' }
        ];
      }

      // 預設四邊邊界
      return [
        { x: 0, y: 0, w: 800, h: 120, tag: 'wall' },
        { x: 0, y: 0, w: 40, h: 600, tag: 'wall' },
        { x: 0, y: 550, w: 800, h: 50, tag: 'wall' },
        { x: 760, y: 0, w: 40, h: 600, tag: 'wall' }
      ];
    },

    // 取得互動物件與場景傳送門 (全校園 100% 互通)
    getInteractables(sceneId) {
      if (sceneId === 'S3') {
        // S3 教室
        const items = [
          {
            id: 'door_to_s4',
            x: 755,
            y: 470,
            radius: 50,
            prompt: '按 [E] 走出教室前往走廊',
            targetScene: 'S4',
            spawn: { x: 190, y: 290, dir: 'right' }
          },
          // 路人同學 A (認真看書)
          {
            id: 'ambient_s3_1',
            x: 195,
            y: 275,
            radius: 45,
            prompt: '按 [E] 與同學交談',
            inspectText: '「同學抬起頭笑了笑：『早自習要專心喔，今天有隨堂小考呢。』」'
          },
          // 路人同學 B (整理書包)
          {
            id: 'ambient_s3_2',
            x: 495,
            y: 415,
            radius: 45,
            prompt: '按 [E] 與同學交談',
            inspectText: '「同學正忙著整理書包：『我的筆記本借隔壁班看，還沒拿回來呢。』」'
          }
        ];

        // 如果節點 1 尚未完成，座位提供劇本觸發
        if (!GameState.quest.completedNodes.has('node1')) {
          items.push({
            id: 'node1_desk',
            x: 295 + 16,
            y: 345 + 10,
            radius: 52,
            prompt: '按 [E] 檢查座位上的嘲笑紙條',
            nodeId: 'node1'
          });
        } else {
          // 已完成則提供一般探索對話，不重複跳劇本！
          items.push({
            id: 'node1_desk_done',
            x: 295 + 16,
            y: 345 + 10,
            radius: 52,
            prompt: '按 [E] 查看座位',
            inspectText: '（桌上的嘲笑紙條已經妥善收好，抽屜也已經整理乾淨。）'
          });
        }

        // 第 5 天清晨：同學丙在教室座位上支持主角 (Node 9 Q11)
        if (GameState.quest.step === 9 && !GameState.quest.completedNodes.has('node9')) {
          items.push({
            id: 'node9_classmate_c',
            x: 210,
            y: 345,
            radius: 55,
            prompt: '按 [E] 與同學丙對話（聆聽同儕的溫暖支持）',
            nodeId: 'node9'
          });
        } else if (GameState.quest.completedNodes.has('node9')) {
          items.push({
            id: 'node9_classmate_c_done',
            x: 210,
            y: 345,
            radius: 55,
            prompt: '按 [E] 查看同學丙',
            inspectText: '「同學丙笑著對你說：『別擔心，有什麼事我們一起面對！』」'
          });
        }

        return items;
      }
      else if (sceneId === 'S4') {
        // S4 走廊：連接 S3教室、S6輔導室、S7學務處、下方S5穿堂
        const items = [
          // 門1: 回 S3 教室
          {
            id: 'door_to_s3',
            x: 170,
            y: 250,
            radius: 60,
            prompt: '按 [E] 進入班級教室 (S3)',
            targetScene: 'S3',
            spawn: { x: 700, y: 470, dir: 'left' }
          },
          // 門2: 進入 S6 輔導室
          {
            id: 'door_to_s6',
            x: 637,
            y: 250,
            radius: 60,
            prompt: '按 [E] 進入輔導室 (S6)',
            targetScene: 'S6',
            spawn: { x: 320, y: 420, dir: 'up' }
          },
          // 門3: 進入 S7 學務處
          {
            id: 'door_to_s7',
            x: 877,
            y: 250,
            radius: 60,
            prompt: '按 [E] 進入學務處 (S7)',
            targetScene: 'S7',
            spawn: { x: 350, y: 440, dir: 'up' }
          },
          // 下方通道: 通往下層 S5 穿堂 (依據走廊實際空間結構設在下方樓梯口)
          {
            id: 'door_to_s5',
            x: 1120,
            y: 520,
            radius: 65,
            prompt: '按 [E] 走下階梯前往穿堂大廳 (S5)',
            targetScene: 'S5',
            spawn: { x: 384, y: 80, dir: 'down' }
          },
          // 走廊布告欄前路人學生
          {
            id: 'ambient_s4_1',
            x: 230,
            y: 270,
            radius: 50,
            prompt: '按 [E] 與同學交談',
            inspectText: '「同學指著布告欄：『下週好像有校園反霸凌宣導週的演講耶！』」'
          },
          // 走廊東側窗邊路人學生
          {
            id: 'ambient_s4_2',
            x: 1000,
            y: 270,
            radius: 50,
            prompt: '按 [E] 與同學交談',
            inspectText: '「走廊窗外的微風吹得很舒服：『站在這裡吹吹風最放鬆了。』」'
          }
        ];

        // 走廊劇情事件：Node 2（飲水機攔截事件）
        if (GameState.quest.step === 2 && !GameState.quest.completedNodes.has('node2')) {
          items.push({
            id: 'node2_event',
            x: 520,
            y: 310,
            radius: 60,
            prompt: '按 [E] 查看飲水機附近的同學',
            nodeId: 'node2'
          });
        } else if (GameState.quest.step === 5 && !GameState.quest.completedNodes.has('node5')) {
          // Node 5（第 2 天午休走廊同學乙遭遇）
          items.push({
            id: 'node5_event',
            x: 320,
            y: 310,
            radius: 60,
            prompt: '按 [E] 面對走廊上的同學乙',
            nodeId: 'node5'
          });
        }
        return items;
      }
      else if (sceneId === 'S5') {
        // S5 穿堂大廳：北接 S4 走廊，南出 S1 校園主地圖
        const items = [
          {
            id: 'door_to_s4_from_s5',
            x: 384,
            y: 50,
            radius: 60,
            prompt: '按 [E] 走上階梯前往走廊 (S4)',
            targetScene: 'S4',
            spawn: { x: 1120, y: 460, dir: 'up' }
          },
          {
            id: 'door_to_s1_from_s5',
            x: 384,
            y: 530,
            radius: 60,
            prompt: '按 [E] 步出穿堂前往校園 (S1)',
            targetScene: 'S1',
            spawn: { x: 640, y: 290, dir: 'down' }
          },
          // 穿堂立柱旁路人學生
          {
            id: 'ambient_s5_1',
            x: 210,
            y: 310,
            radius: 50,
            prompt: '按 [E] 與同學交談',
            inspectText: '「『穿堂的大鐘好像走得蠻準的，我要趕緊回教室了！』」'
          }
        ];

        // 穿堂劇情事件：Node 4（第 2 天穿堂同學丁戊閒話）
        if (GameState.quest.step === 4 && !GameState.quest.completedNodes.has('node4')) {
          items.push({
            id: 'node4_event',
            x: 384,
            y: 310,
            radius: 60,
            prompt: '按 [E] 聆聽並面對同儕對話',
            nodeId: 'node4'
          });
        }
        return items;
      }
      else if (sceneId === 'S6') {
        // S6 輔導室：門回 S4 走廊
        const items = [
          {
            id: 'door_to_s4_from_s6',
            x: 320,
            y: 450,
            radius: 60,
            prompt: '按 [E] 離開輔導室回走廊 (S4)',
            targetScene: 'S4',
            spawn: { x: 637, y: 280, dir: 'down' }
          }
        ];
        // Node 3（第 1 天向導師傾訴）
        if (GameState.quest.step === 3 && !GameState.quest.completedNodes.has('node3')) {
          items.push({
            id: 'node3_event',
            x: 380,
            y: 280,
            radius: 60,
            prompt: '按 [E] 與輔導老師會談傾訴',
            nodeId: 'node3'
          });
        } else {
          items.push({
            id: 's6_idle',
            x: 380,
            y: 280,
            radius: 60,
            prompt: '按 [E] 查看輔導室',
            inspectText: '「輔導老師溫柔抬起頭：『先喝杯溫水深呼吸，這裡隨時都為你敞開喔。』」'
          });
        }
        return items;
      }
      else if (sceneId === 'S7') {
        // S7 學務處：門回 S4 走廊
        const items = [
          {
            id: 'door_to_s4_from_s7',
            x: 350,
            y: 480,
            radius: 60,
            prompt: '按 [E] 離開學務處回走廊 (S4)',
            targetScene: 'S4',
            spawn: { x: 877, y: 280, dir: 'down' }
          }
        ];
        // Node 6（第 3 天學務處三方家長會談）
        if (GameState.quest.step === 6 && !GameState.quest.completedNodes.has('node6')) {
          items.push({
            id: 'node6_event',
            x: 365,
            y: 395,
            radius: 50,
            prompt: '按 [E] 入座參加三方會談',
            nodeId: 'node6'
          });
        } else {
          items.push({
            id: 's7_idle',
            x: 365,
            y: 395,
            radius: 50,
            prompt: '按 [E] 查看會議長桌',
            inspectText: '「生教組長沉穩地說：『在學校如果遇到任何同儕困擾或不當行為，一定要第一時間向師長反映。』」'
          });
        }
        return items;
      }
      else if (sceneId === 'S1') {
        // S1 校園主地圖：北接 S5 穿堂，南接 S2 校門口
        return [
          {
            id: 'door_to_s5_from_s1',
            x: 640,
            y: 240,
            radius: 65,
            prompt: '按 [E] 進入教學大樓穿堂 (S5)',
            targetScene: 'S5',
            spawn: { x: 384, y: 490, dir: 'up' }
          },
          {
            id: 'door_to_s2_from_s1',
            x: 640,
            y: 910,
            radius: 65,
            prompt: '按 [E] 前往校門口 (S2)',
            targetScene: 'S2',
            spawn: { x: 384, y: 90, dir: 'down' }
          },
          {
            id: 'ambient_s1_1',
            x: 520,
            y: 380,
            radius: 50,
            prompt: '按 [E] 與散步同學交談',
            inspectText: '「同學看著藍天：『操場的陽光好溫暖，心情也跟著開朗起來了。』」'
          }
        ];
      }
      else if (sceneId === 'S2') {
        // S2 校門口：北接 S1，南為結局出校門
        const items = [
          {
            id: 'door_to_s1_from_s2',
            x: 384,
            y: 40,
            radius: 60,
            prompt: '按 [E] 回到校園內部 (S1)',
            targetScene: 'S1',
            spawn: { x: 640, y: 860, dir: 'up' }
          },
          {
            id: 'ambient_guard',
            x: 500,
            y: 220,
            radius: 55,
            prompt: '按 [E] 向警衛叔叔問好',
            inspectText: '「警衛叔叔笑瞇瞇地向你敬禮：『同學早！放學回家路上一定要注意安全喔！』」'
          }
        ];
        // 離開校門：完成全部 9 個節點或 step >= 10 即可走出校門邁向大結局！
        if (GameState.quest.completedNodes.has('node9') || GameState.quest.step >= 10) {
          items.push({
            id: 'ending_gate',
            x: 384,
            y: 415,
            radius: 120,
            prompt: '按 [E] 走出校門，迎接晨光與結局',
            isEndingGate: true
          });
        } else {
          items.push({
            id: 'gate_locked',
            x: 384,
            y: 415,
            radius: 70,
            prompt: '按 [E] 查看校門鐵柵欄',
            inspectText: '「警衛叔叔提醒：上課期間校門維持關閉，請專注校園內的學習與生活。」'
          });
        }
        return items;
      }
      else if (sceneId === 'S8') {
        // S8 家：臥室 (512x384) - 門在左上方 (x:90, y:240)，床在右側 (x:320, y:270)
        const items = [
          {
            id: 'door_to_s9',
            x: 90,
            y: 240,
            radius: 55,
            prompt: '按 [E] 走出臥室前往客廳 (S9)',
            targetScene: 'S9',
            spawn: { x: 140, y: 350, dir: 'right' }
          }
        ];
        if (GameState.quest.step === 7 && !GameState.quest.completedNodes.has('node7')) {
          items.push({
            id: 'node7_event',
            x: 320,
            y: 270,
            radius: 55,
            prompt: '按 [E] 與媽媽敞開心扉交談',
            nodeId: 'node7'
          });
        } else {
          items.push({
            id: 's8_desk',
            x: 320,
            y: 270,
            radius: 55,
            prompt: '按 [E] 查看床邊與書桌',
            inspectText: '（媽媽輕輕撫摸你的頭：「孩子，勇敢把事情說出來，你做得很棒。」）'
          });
        }
        return items;
      }
      else if (sceneId === 'S9') {
        // S9 家：客廳 (640x480) - 門在左下 (x:100, y:350)，電話桌在右上 (x:550, y:270)
        const items = [
          {
            id: 'door_to_s8',
            x: 100,
            y: 350,
            radius: 55,
            prompt: '按 [E] 回臥室 (S8)',
            targetScene: 'S8',
            spawn: { x: 120, y: 250, dir: 'right' }
          }
        ];
        if (GameState.quest.step === 8 && !GameState.quest.completedNodes.has('node8')) {
          items.push({
            id: 'node8_event',
            x: 550,
            y: 220,
            radius: 65,
            prompt: '按 [E] 接聽電視旁小桌上的電話',
            nodeId: 'node8'
          });
        } else {
          items.push({
            id: 's9_phone',
            x: 550,
            y: 220,
            radius: 60,
            prompt: '按 [E] 查看客廳電話機',
            inspectText: '（客廳話筒靜靜放置在小桌上，方才導師溫暖的勉勵猶在耳畔。）'
          });
        }
        return items;
      }

      return [];
    }
  };

  // ==========================================================================
  // 6. 核心遊戲引擎主物件 (Game)
  // ==========================================================================
  const Game = {
    canvas: null,
    ctx: null,
    keys: {},
    lastTime: 0,
    currentInteractable: null,

    // 當前畫面相機與縮放
    camera: { x: 0, y: 0, scale: 1.0 },

    init() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');

      AssetLoader.init();
      this.bindEvents();
      this.initCharacterPreviews();
      this.checkSavedGame();
      this.handleResize();

      window.addEventListener('resize', () => this.handleResize());

      // 啟動主渲染迴圈
      requestAnimationFrame((t) => this.gameLoop(t));
    },

    // 視窗動態自適應 (滿版無黑邊)
    handleResize() {
      const viewport = document.getElementById('canvas-viewport');
      if (viewport && this.canvas) {
        this.canvas.width = viewport.clientWidth;
        this.canvas.height = viewport.clientHeight;
      }
    },

    // 綁定事件監聽
    bindEvents() {
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;

        if (GameState.dialogue.active) {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this.advanceDialogue();
          } else if (['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].includes(e.code)) {
            const idx = parseInt(e.code.slice(-1)) - 1;
            this.selectChoiceByIndex(idx);
          }
        } else if (GameState.screen === 'game') {
          if (e.code === 'KeyE' || e.code === 'Space') {
            e.preventDefault();
            this.triggerInteraction();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      document.getElementById('btn-start-game').addEventListener('click', () => {
        SoundFX.click();
        this.switchScreen('select');
      });

      document.getElementById('btn-continue-game').addEventListener('click', () => {
        SoundFX.click();
        this.loadGame();
      });

      document.getElementById('btn-info').addEventListener('click', () => {
        SoundFX.click();
        document.getElementById('modal-info').classList.add('active');
      });

      document.getElementById('btn-close-info').addEventListener('click', () => {
        SoundFX.click();
        document.getElementById('modal-info').classList.remove('active');
      });

      const cards = document.querySelectorAll('.character-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          SoundFX.click();
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          GameState.selectedGender = card.dataset.gender;
        });
      });

      document.getElementById('btn-back-to-cover').addEventListener('click', () => {
        SoundFX.click();
        this.switchScreen('cover');
      });

      document.getElementById('btn-confirm-char').addEventListener('click', () => {
        SoundFX.positive();
        this.startNewGame();
      });

      document.getElementById('btn-toggle-sound').addEventListener('click', () => {
        GameState.soundEnabled = !GameState.soundEnabled;
        document.getElementById('btn-toggle-sound').textContent = GameState.soundEnabled ? '🔊' : '🔇';
      });

      document.getElementById('btn-save').addEventListener('click', () => {
        SoundFX.positive();
        this.saveGame();
        alert('遊戲進度已安全保存在本機瀏覽器中！');
      });

      document.getElementById('btn-home').addEventListener('click', () => {
        if (confirm('確定要返回標題畫面嗎？（未儲存之即時位置將遺失）')) {
          this.switchScreen('cover');
        }
      });

      document.getElementById('dialogue-layer').addEventListener('click', (e) => {
        if (e.target.closest('.choice-btn') || e.target.closest('.modal-backdrop')) return;
        this.advanceDialogue();
      });

      const promptEl = document.getElementById('interact-prompt');
      if (promptEl) {
        promptEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.triggerInteraction();
        });
      }

      // 頂部 HUD 雷達圖按鈕
      const trophyBtn = document.getElementById('btn-hud-trophy');
      if (trophyBtn) {
        trophyBtn.addEventListener('click', () => {
          SoundFX.positive();
          this.openRadarModal();
        });
      }

      // 雷達圖面板：返回遊戲繼續旅程按鈕
      const backGameBtn = document.getElementById('btn-ending-back-to-game');
      if (backGameBtn) {
        backGameBtn.addEventListener('click', () => {
          SoundFX.click();
          this.switchScreen('game');
        });
      }

      // 雷達圖面板：右上角 ✕ 關閉按鈕
      const closeXBtn = document.getElementById('btn-ending-close-x');
      if (closeXBtn) {
        closeXBtn.addEventListener('click', () => {
          SoundFX.click();
          this.switchScreen('game');
        });
      }

      // 結算畫面：重新體驗旅程按鈕
      const restartBtn = document.getElementById('btn-restart-game');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          SoundFX.positive();
          this.switchScreen('select');
        });
      }

      // 結算畫面：返回封面首頁按鈕
      const toCoverBtn = document.getElementById('btn-ending-to-cover');
      if (toCoverBtn) {
        toCoverBtn.addEventListener('click', () => {
          SoundFX.click();
          this.switchScreen('cover');
        });
      }

      // RPG 任務日誌：收合 / 展開按鈕
      const toggleQuestBtn = document.getElementById('btn-toggle-quest-panel');
      if (toggleQuestBtn) {
        toggleQuestBtn.addEventListener('click', () => {
          this.toggleQuestPanel();
        });
      }

      // RPG 任務日誌：點擊開啟 / 關閉地面導航路線按鈕
      const questNavBtn = document.getElementById('btn-quest-navigate');
      if (questNavBtn) {
        questNavBtn.addEventListener('click', () => {
          this.toggleNavigation();
        });
      }

      this.bindMobileControls();
    },

    bindMobileControls() {
      const bindBtn = (id, code) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[code] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[code] = false; });
        btn.addEventListener('mousedown', (e) => { this.keys[code] = true; });
        btn.addEventListener('mouseup', (e) => { this.keys[code] = false; });
      };

      bindBtn('dpad-up', 'KeyW');
      bindBtn('dpad-down', 'KeyS');
      bindBtn('dpad-left', 'KeyA');
      bindBtn('dpad-right', 'KeyD');

      const actionBtn = document.getElementById('btn-mobile-interact');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => this.triggerInteraction());
      }
    },

    initCharacterPreviews() {
      const previewLoop = () => {
        const time = Date.now() / 1000;
        const frame = (time * 4) % 4;

        ['boy', 'girl', 'neutral'].forEach(gender => {
          const canvas = document.getElementById(`preview-${gender}`);
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            CharacterSpriteRenderer.draw(ctx, 32, 50, 'down', frame, gender, 1.35);
          }
        });

        if (GameState.screen === 'select') {
          requestAnimationFrame(previewLoop);
        }
      };
      previewLoop();
    },

    switchScreen(screenName) {
      GameState.screen = screenName;
      document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));

      const hud = document.getElementById('hud-bar');

      if (screenName === 'cover') {
        document.getElementById('screen-cover').classList.add('active');
        hud.classList.remove('visible');
      } else if (screenName === 'select') {
        document.getElementById('screen-select').classList.add('active');
        hud.classList.remove('visible');
        this.initCharacterPreviews();
      } else if (screenName === 'game') {
        document.getElementById('screen-game').classList.add('active');
        this.handleResize();
        setTimeout(() => hud.classList.add('visible'), 250);
      } else if (screenName === 'ending') {
        const endScreen = document.getElementById('screen-ending');
        if (endScreen) {
          endScreen.classList.add('active');
          endScreen.scrollTop = 0;
        }
        hud.classList.remove('visible');
      }
    },

    startNewGame() {
      GameState.stats = {
        stress: 50,
        peer: 30,
        courage: 40,
        safety: 35,
        selfEsteem: 30
      };
      GameState.dailyMoods = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null
      };
      GameState.quest = {
        step: 1,
        activeNodeId: 'node1',
        text: '請跟隨地面黃色箭頭，走到自己發光的座位查看',
        completedNodes: new Set()
      };
      GameState.currentSceneId = 'S3';
      GameState.day = 1;
      GameState.timeOfDay = '清晨自習';

      GameState.player.x = 700;
      GameState.player.y = 470;
      GameState.player.direction = 'left';

      this.updateHUD();
      this.updateQuestBanner();
      this.switchScreen('game');

      const playerPortraitPath = `角色/主角_${GameState.selectedGender === 'boy' ? '男孩' : (GameState.selectedGender === 'girl' ? '女孩' : '中性')}.png`;
      document.getElementById('img-portrait-player').src = playerPortraitPath;

      setTimeout(() => {
        this.startPrologue();
      }, 700);
    },

    startPrologue() {
      if (!DialoguesDB || !DialoguesDB.prologue) return;

      const lines = DialoguesDB.prologue.map(text => ({
        speaker: '旁白',
        text: text,
        npc: null
      }));

      this.startDialogueSequence(lines, () => {
        this.showToast('前情提要結束。請走回座位查看桌上的嘲笑紙條。');
        setTimeout(() => {
          this.playQuestPanelTutorial();
        }, 600);
      });
    },

    saveGame() {
      const saveData = {
        selectedGender: GameState.selectedGender,
        stats: GameState.stats,
        dailyMoods: GameState.dailyMoods,
        quest: {
          step: GameState.quest.step,
          activeNodeId: GameState.quest.activeNodeId,
          text: GameState.quest.text,
          completed: Array.from(GameState.quest.completedNodes)
        },
        currentSceneId: GameState.currentSceneId,
        day: GameState.day,
        timeOfDay: GameState.timeOfDay,
        playerPos: { x: GameState.player.x, y: GameState.player.y }
      };
      localStorage.setItem('dawn_academy_save', JSON.stringify(saveData));
      this.checkSavedGame();
    },

    loadGame() {
      const raw = localStorage.getItem('dawn_academy_save');
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        GameState.selectedGender = data.selectedGender || 'boy';
        GameState.stats = data.stats || GameState.stats;
        GameState.dailyMoods = data.dailyMoods || { 1: null, 2: null, 3: null, 4: null, 5: null };
        if (data.quest) {
          GameState.quest.step = data.quest.step || 1;
          GameState.quest.activeNodeId = data.quest.activeNodeId || 'node1';
          GameState.quest.text = data.quest.text || '';
          GameState.quest.completedNodes = new Set(data.quest.completed || []);
        }
        GameState.currentSceneId = data.currentSceneId || 'S3';
        GameState.day = data.day || 1;
        GameState.timeOfDay = data.timeOfDay || '清晨自習';
        if (data.playerPos) {
          GameState.player.x = data.playerPos.x;
          GameState.player.y = data.playerPos.y;
        }

        this.updateHUD();
        this.updateQuestBanner();
        this.switchScreen('game');

        const playerPortraitPath = `角色/主角_${GameState.selectedGender === 'boy' ? '男孩' : (GameState.selectedGender === 'girl' ? '女孩' : '中性')}.png`;
        document.getElementById('img-portrait-player').src = playerPortraitPath;
      } catch (e) {
        alert('存檔讀取失敗');
      }
    },

    checkSavedGame() {
      const raw = localStorage.getItem('dawn_academy_save');
      const btn = document.getElementById('btn-continue-game');
      if (raw && btn) {
        btn.disabled = false;
        btn.textContent = '繼續旅程 (讀取存檔)';
      }
    },

    // 更新任務目標橫條與右側 RPG 任務追蹤面板
    updateQuestBanner() {
      const el = document.getElementById('quest-text');
      if (el) {
        el.textContent = GameState.quest.text;
      }

      // 同步更新右側 RPG 任務日誌面板
      const step = GameState.quest.completedNodes.has('node9') ? 10 : GameState.quest.step;
      const questData = QuestDatabase[step] || QuestDatabase[1];

      const titleEl = document.getElementById('quest-tracker-title');
      const descEl = document.getElementById('quest-tracker-desc');
      const objEl = document.getElementById('quest-tracker-objective');
      const locEl = document.getElementById('quest-tracker-location');

      if (titleEl) titleEl.textContent = questData.title;
      if (descEl) descEl.textContent = questData.desc;
      if (objEl) objEl.textContent = `▶ 目標：${questData.objective}`;
      if (locEl) locEl.textContent = `▶ 地點：${questData.location}`;

      // 同步更新右側支線任務日誌描述
      const sideDescEl = document.querySelector('.quest-side-desc');
      if (sideDescEl) {
        const moods = GameState.dailyMoods || {};
        const recordedDays = Object.keys(moods)
          .filter(d => moods[d])
          .map(d => `第${['一','二','三','四','五'][d-1]}天【${moods[d].name}】`);

        if (recordedDays.length === 0) {
          sideDescEl.innerHTML = '🌱 <strong>心靈日記進行中</strong><br>專注體驗今日校園探索，今日心情將於放學轉場時開放填寫。';
        } else {
          sideDescEl.innerHTML = `🌱 <strong>心靈日記（已記錄 ${recordedDays.length}/5 天）</strong><br>最近記錄：${recordedDays[recordedDays.length - 1]}<br>今日新經歷將於放學轉場時開放填寫。`;
        }
      }
    },

    // 更新 HUD 與五維數值長條圖 (支援 2 秒浮動增減標籤)
    updateHUD(deltas = null) {
      const s = GameState.stats;
      const score = (GameState && GameState.getOverallScore) ? GameState.getOverallScore() : 37;
      const phase = (AtmosphereRenderer && AtmosphereRenderer.getAtmospherePhase)
        ? AtmosphereRenderer.getAtmospherePhase(score)
        : { name: '灰藍黎明前', desc: '清晨微光' };

      const hudDay = document.getElementById('hud-day');
      if (hudDay) {
        hudDay.textContent = `Day ${GameState.day}・${GameState.timeOfDay} ｜ 天色：${phase.name} ｜ 整體狀態值：${score} 分`;
      }

      const spec = AssetLoader.sceneSpecs[GameState.currentSceneId];
      document.getElementById('hud-scene-name').textContent = `${GameState.currentSceneId} ${spec ? spec.name : ''}`;

      // 壓力值
      const stressVal = Math.min(100, Math.max(0, s.stress));
      document.getElementById('stat-val-stress').textContent = `${stressVal} / 100`;
      const stressFill = document.getElementById('stat-bar-stress');
      stressFill.style.width = `${stressVal}%`;
      stressFill.className = 'stat-bar-fill fill-stress';
      if (stressVal < 60) {
        stressFill.classList.add('stress-low');
      } else if (stressVal < 85) {
        stressFill.classList.add('stress-mid');
      } else {
        stressFill.classList.add('stress-high');
      }

      // 同儕、勇氣、安全、自我肯定
      const updateBar = (id, val) => {
        const clamped = Math.min(100, Math.max(0, val));
        document.getElementById(`stat-val-${id}`).textContent = `${clamped} / 100`;
        document.getElementById(`stat-bar-${id}`).style.width = `${clamped}%`;
      };

      updateBar('peer', s.peer);
      updateBar('courage', s.courage);
      updateBar('safety', s.safety);
      updateBar('self', s.selfEsteem);

      // 若有傳入增減數值 (deltas)，觸發頂部 2 秒浮動提示！
      if (deltas) {
        this.triggerDeltaBadge('delta-stress', deltas.stress, true);
        this.triggerDeltaBadge('delta-peer', deltas.peer);
        this.triggerDeltaBadge('delta-courage', deltas.courage);
        this.triggerDeltaBadge('delta-safety', deltas.safety);
        this.triggerDeltaBadge('delta-self', deltas.selfEsteem);
      }
    },

    // 觸發數值增減浮動指示 (維持約 2 秒後優雅消失)
    triggerDeltaBadge(elementId, val, isStress = false) {
      if (!val || val === 0) return;
      const el = document.getElementById(elementId);
      if (!el) return;

      const sign = val > 0 ? `+${val}` : `${val}`;
      el.textContent = sign;

      // 壓力上升為紅/負向，其他數值上升為綠/正向
      let isPositive = val > 0;
      if (isStress) isPositive = val < 0;

      el.className = `stat-delta visible ${isPositive ? 'pos' : 'neg'}`;

      clearTimeout(el._timer);
      el._timer = setTimeout(() => {
        el.className = 'stat-delta';
      }, 2400);
    },

    // ========================================================================
    // 7. 滿版相機運鏡、地圖移動與導引箭頭渲染
    // ========================================================================
    gameLoop(timestamp) {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;

      if (GameState.screen === 'game') {
        this.update(dt);
        this.render();
      }

      requestAnimationFrame((t) => this.gameLoop(t));
    },

    update(dt) {
      // 1. 更新路人學生自主漫步巡邏
      AmbientNPCManager.update(dt);

      // 2. 更新環境光影與平靜光塵微粒
      const spec = AssetLoader.sceneSpecs[GameState.currentSceneId] || { w: 800, h: 576 };
      AtmosphereRenderer.update(dt, spec.w, spec.h);

      if (GameState.dialogue.active || GameState.breathing.active) {
        GameState.player.moving = false;
        return;
      }

      let dx = 0;
      let dy = 0;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const p = GameState.player;
      p.moving = (dx !== 0 || dy !== 0);

      if (p.moving) {
        if (Math.abs(dx) > Math.abs(dy)) {
          p.direction = dx > 0 ? 'right' : 'left';
        } else {
          p.direction = dy > 0 ? 'down' : 'up';
        }

        p.animTimer += dt * 6;
        p.frame = p.animTimer % 4;

        // 滑移物理碰撞
        const nextX = p.x + dx * p.speed * dt;
        const nextY = p.y + dy * p.speed * dt;

        if (!this.checkCollision(nextX, p.y)) {
          p.x = nextX;
        }
        if (!this.checkCollision(p.x, nextY)) {
          p.y = nextY;
        }

        // 大結局走出校門判定：若抵達校門出口步出學校
        if (GameState.currentSceneId === 'S2' && (GameState.quest.completedNodes.has('node9') || GameState.quest.step >= 10)) {
          if (p.y >= 430 && p.x >= 260 && p.x <= 508 && !GameState.dialogue.active) {
            this.evaluateEnding();
          }
        }
      } else {
        p.frame = 0;
      }

      this.checkInteractables();
      this.updateNavTrail();
    },

    checkCollision(x, y) {
      // 1. 全地圖世界絕對邊界檢查（防止走出底圖或消失在畫面外）
      const spec = AssetLoader.sceneSpecs[GameState.currentSceneId];
      if (spec) {
        const margin = 14;
        if (x < margin || x > spec.w - margin || y < margin || y > spec.h - margin) {
          return true;
        }
      }

      // 2. 場景內部障礙物與課桌椅碰撞檢測
      const colliders = SceneColliders.getColliders(GameState.currentSceneId);
      const pr = 7; // 腳底碰撞半徑

      for (const box of colliders) {
        if (
          x + pr > box.x &&
          x - pr < box.x + box.w &&
          y + pr > box.y &&
          y - pr < box.y + box.h
        ) {
          return true;
        }
      }
      return false;
    },

    checkInteractables() {
      const interactables = SceneColliders.getInteractables(GameState.currentSceneId);
      const p = GameState.player;
      let found = null;

      // 先檢查固定互動物件與傳送門
      for (const item of interactables) {
        const dist = Math.hypot(p.x - item.x, p.y - item.y);
        if (dist <= item.radius) {
          found = item;
          break;
        }
      }

      // 若未觸發固定場景物件，檢查動態漫步的路人學生
      if (!found) {
        const ambientFound = AmbientNPCManager.getInteractableInScene(GameState.currentSceneId, p.x, p.y, 48);
        if (ambientFound) {
          found = ambientFound;
        }
      }

      this.currentInteractable = found;
      const promptEl = document.getElementById('interact-prompt');

      if (found && !GameState.dialogue.active) {
        promptEl.style.display = 'block';
        promptEl.textContent = found.prompt;

        // 轉換為螢幕畫面坐標
        const screenPos = this.worldToScreen(found.x, found.y);
        promptEl.style.left = `${screenPos.x}px`;
        promptEl.style.top = `${screenPos.y - 38}px`;
      } else {
        promptEl.style.display = 'none';
      }
    },

    triggerInteraction() {
      if (!this.currentInteractable || GameState.dialogue.active) return;

      SoundFX.click();
      const item = this.currentInteractable;

      if (item.nodeId) {
        this.triggerNode(item.nodeId);
      } else if (item.targetScene) {
        this.changeScene(item.targetScene, item.spawn);
      } else if (item.isEndingGate) {
        this.evaluateEnding();
      } else if (item.inspectText) {
        this.showToast(item.inspectText);
      }
    },

    changeScene(sceneId, spawn = null) {
      GameState.currentSceneId = sceneId;
      this.updateHUD();

      if (spawn) {
        GameState.player.x = spawn.x;
        GameState.player.y = spawn.y;
        GameState.player.direction = spawn.dir || 'down';

        // 碰撞防卡死防呆機制：若傳送座標落在障礙物內，自動向相鄰空曠處微調解卡
        if (this.isColliding(GameState.player.x, GameState.player.y)) {
          const offsets = [
            { dx: 40, dy: 0 }, { dx: -40, dy: 0 }, { dx: 0, dy: 40 }, { dx: 0, dy: -40 },
            { dx: 50, dy: 0 }, { dx: 60, dy: 0 }, { dx: -60, dy: 0 }
          ];
          for (const off of offsets) {
            if (!this.isColliding(GameState.player.x + off.dx, GameState.player.y + off.dy)) {
              GameState.player.x += off.dx;
              GameState.player.y += off.dy;
              break;
            }
          }
        }
      }

      SoundFX.alert();

      // 若進入客廳且處於接聽電話任務 (Node 8)，響起電話鈴聲！
      if (this._phoneRingTimer) {
        clearInterval(this._phoneRingTimer);
        this._phoneRingTimer = null;
      }

      if (sceneId === 'S9' && GameState.quest.step === 8 && !GameState.quest.completedNodes.has('node8')) {
        setTimeout(() => {
          SoundFX.playTelephoneRing();
        }, 400);

        this._phoneRingTimer = setInterval(() => {
          if (GameState.currentSceneId === 'S9' && GameState.quest.step === 8 && !GameState.quest.completedNodes.has('node8') && !GameState.dialogue.active) {
            SoundFX.playTelephoneRing();
          } else {
            clearInterval(this._phoneRingTimer);
            this._phoneRingTimer = null;
          }
        }, 4200);
      }

      // 切換場景時：若玩家原已開啟導航模式，維持導航活躍狀態並為新場景生成全新地面箭頭路徑
      if (GameState.navigation.active && !GameState.dialogue.active) {
        const btn = document.getElementById('btn-quest-navigate');
        const text = document.getElementById('nav-btn-text');
        if (btn) btn.classList.add('nav-active');
        if (text) text.textContent = '點擊取消地面導航';
        if (btn) btn.title = '點擊取消地面導航路線';
        this.initNavTrail();
      }
    },

    // 世界座標轉螢幕座標 (精確對齊 Contain 全貌縮放視角)
    worldToScreen(wx, wy) {
      const c = this.camera;
      const spec = AssetLoader.sceneSpecs[GameState.currentSceneId] || { w: 800, h: 576 };
      return {
        x: (wx - spec.w / 2) * c.scale + this.canvas.width / 2,
        y: (wy - spec.h / 2) * c.scale + this.canvas.height / 2
      };
    },

    // 各場景地板走道路徑拓撲網 (最短路徑導航，避免穿牆穿桌)
    sceneWaypoints: {
      'S3': [
        // 黑板前上方走道 (Y: 220)
        { id: 'w1', x: 60,  y: 220, to: ['w2', 'w5'] },
        { id: 'w2', x: 360, y: 220, to: ['w1', 'w3', 'w4'] },
        { id: 'w3', x: 740, y: 220, to: ['w2', 'w_door'] },
        // 中央縱向主走道 (X: 360)
        { id: 'w4', x: 360, y: 355, to: ['w2', 'w6', 'w_seat1'] },
        // 教室後方橫向走道 (Y: 520)
        { id: 'w5', x: 60,  y: 520, to: ['w1', 'w6'] },
        { id: 'w6', x: 360, y: 520, to: ['w5', 'w4', 'w7'] },
        { id: 'w7', x: 740, y: 520, to: ['w6', 'w_door'] },
        // 門口 (X: 740, Y: 470) - 連接後側走道與上方走道，避開課桌！
        { id: 'w_door',  x: 740, y: 470, to: ['w3', 'w7'] },
        // 目標座位交互點
        { id: 'w_seat1', x: 311, y: 355, to: ['w4'] },
        { id: 'w_seatC', x: 210, y: 345, to: ['w1', 'w5'] }
      ],
      'S4': [
        { id: 'w_s3',  x: 170,  y: 270, to: ['w_c1'] },
        { id: 'w_c1',  x: 190,  y: 310, to: ['w_s3', 'w_c2'] },
        { id: 'w_c2',  x: 320,  y: 310, to: ['w_c1', 'w_c3'] },
        { id: 'w_c3',  x: 520,  y: 310, to: ['w_c2', 'w_c4'] },
        { id: 'w_c4',  x: 637,  y: 310, to: ['w_c3', 'w_s6', 'w_c5'] },
        { id: 'w_s6',  x: 637,  y: 250, to: ['w_c4'] },
        { id: 'w_c5',  x: 877,  y: 310, to: ['w_c4', 'w_s7', 'w_c6'] },
        { id: 'w_s7',  x: 877,  y: 250, to: ['w_c5'] },
        { id: 'w_c6',  x: 1120, y: 310, to: ['w_c5', 'w_s5'] },
        { id: 'w_s5',  x: 1120, y: 520, to: ['w_c6'] } // 走廊通往下層穿堂之樓梯口 (下方)
      ],
      'S5': [
        { id: 'w_n', x: 384, y: 80,  to: ['w_m'] },
        { id: 'w_m', x: 384, y: 310, to: ['w_n', 'w_s'] },
        { id: 'w_s', x: 384, y: 520, to: ['w_m'] }
      ],
      'S6': [
        { id: 'w_door', x: 320, y: 440, to: ['w_mid'] },
        { id: 'w_mid',  x: 320, y: 340, to: ['w_door', 'w_desk'] },
        { id: 'w_desk', x: 380, y: 280, to: ['w_mid'] }
      ],
      'S7': [
        { id: 'w_door', x: 350, y: 470, to: ['w_table'] },
        { id: 'w_table',x: 350, y: 365, to: ['w_door'] }
      ],
      'S1': [
        { id: 'w_n', x: 640, y: 260, to: ['w_m'] },
        { id: 'w_m', x: 640, y: 580, to: ['w_n', 'w_s'] },
        { id: 'w_s', x: 640, y: 910, to: ['w_m'] }
      ],
      'S2': [
        { id: 'w_n', x: 384, y: 80,  to: ['w_m'] },
        { id: 'w_m', x: 384, y: 250, to: ['w_n', 'w_g'] },
        { id: 'w_g', x: 384, y: 415, to: ['w_m'] }
      ],
      'S8': [
        { id: 'w_door', x: 90,  y: 240, to: ['w_mid'] }, // 臥室門在左上方
        { id: 'w_mid',  x: 210, y: 260, to: ['w_door', 'w_bed'] },
        { id: 'w_bed',  x: 320, y: 270, to: ['w_mid'] } // 媽媽在右側床邊
      ],
      'S9': [
        { id: 'w_door',  x: 100, y: 350, to: ['w_mid'] }, // 回臥室門在左下
        { id: 'w_mid',   x: 320, y: 350, to: ['w_door', 'w_table'] },
        { id: 'w_table', x: 550, y: 270, to: ['w_mid'] } // 電視旁電話小桌在右上
      ]
    },

    // 收合或展開任務日誌面板
    toggleQuestPanel() {
      const panel = document.getElementById('quest-tracker-panel');
      const btn = document.getElementById('btn-toggle-quest-panel');
      const tooltip = document.getElementById('quest-toggle-tooltip');
      if (!panel || !btn) return;
      const isCollapsed = panel.classList.toggle('collapsed');
      btn.textContent = isCollapsed ? '◀' : '▶';
      btn.title = isCollapsed ? '展開任務日誌' : '收合任務日誌';
      if (btn.classList.contains('pulse-hint')) btn.classList.remove('pulse-hint');
      if (tooltip) tooltip.classList.remove('visible');
      SoundFX.click();
    },

    // 新手教學：引導玩家認識任務日誌收合功能 (自動平滑演練一次)
    playQuestPanelTutorial() {
      const panel = document.getElementById('quest-tracker-panel');
      const btn = document.getElementById('btn-toggle-quest-panel');
      const tooltip = document.getElementById('quest-toggle-tooltip');
      if (!panel || !btn) return;

      // 1. 啟用按鈕金色高亮呼吸光圈與指示氣泡
      btn.classList.add('pulse-hint');
      if (tooltip) tooltip.classList.add('visible');

      // 2. 0.8 秒後自動示範平滑收合
      setTimeout(() => {
        panel.classList.add('collapsed');
        btn.textContent = '◀';
        btn.title = '展開任務日誌';

        // 3. 停留 1.3 秒後自動展開回原狀
        setTimeout(() => {
          panel.classList.remove('collapsed');
          btn.textContent = '▶';
          btn.title = '收合任務日誌';

          this.showToast('💡 小提示：點擊右側 ◀ / ▶ 按鈕可自由收合／展開任務日誌！');

          // 4. 4 秒後平滑淡出提示氣泡與呼吸光圈
          setTimeout(() => {
            btn.classList.remove('pulse-hint');
            if (tooltip) tooltip.classList.remove('visible');
          }, 4000);
        }, 1300);
      }, 800);
    },

    // 啟動地面尋路導航 (點擊後直到對話完成或手動取消才會消失，箭頭走過即滅，未走到的持續保留)
    startNavigation() {
      const targetLoc = this.getCurrentTargetLocation();
      if (!targetLoc) {
        this.showToast('當前區域暫無導航目標');
        return;
      }

      GameState.navigation.active = true;
      this.initNavTrail();

      const btn = document.getElementById('btn-quest-navigate');
      const text = document.getElementById('nav-btn-text');
      if (btn) btn.classList.add('nav-active');
      if (text) text.textContent = '點擊取消地面導航';
      if (btn) btn.title = '點擊取消地面導航路線';

      SoundFX.positive();
      this.showToast('🧭 導航已開啟：地面箭頭已標示前進路線！');
    },

    // 關閉地面導航 (僅在手動點擊取消、或完成劇情對話時調用)
    stopNavigation() {
      GameState.navigation.active = false;
      this._navTrail = null;

      const btn = document.getElementById('btn-quest-navigate');
      const text = document.getElementById('nav-btn-text');
      if (btn) btn.classList.remove('nav-active');
      if (text) text.textContent = '點擊開啟地面導航路線';
      if (btn) btn.title = '在地面浮現前往目標的金色導航路徑';
    },

    // 切換地面尋路導航 (點擊開啟 / 點擊取消)
    toggleNavigation() {
      if (GameState.navigation.active) {
        this.stopNavigation();
        SoundFX.click();
        this.showToast('已取消地面導航');
      } else {
        this.startNavigation();
      }
    },

    // 拓撲路網前瞻最短路徑搜尋 (Dijkstra + 走過即隱方向鎖定，杜絕逆向回溯與身後殘留)
    findScenePath(startPos, endPos) {
      const sId = GameState.currentSceneId;
      const nodes = this.sceneWaypoints[sId];
      if (!nodes || nodes.length === 0) {
        return [startPos, endPos];
      }

      // 若起點與終點距離極近，直接連線
      const directDist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);
      if (directDist <= 32) {
        return [startPos, endPos];
      }

      const nodeMap = new Map();
      nodes.forEach(n => nodeMap.set(n.id, n));

      // 1. 尋找最接近 endPos 的節點作為 endNode
      let endNode = null;
      let minEndDist = Infinity;
      for (const n of nodes) {
        const d = Math.hypot(n.x - endPos.x, n.y - endPos.y);
        if (d < minEndDist) {
          minEndDist = d;
          endNode = n;
        }
      }

      if (!endNode) {
        return [startPos, endPos];
      }

      // 2. 建立雙向無向圖鄰接表
      const adj = new Map();
      nodes.forEach(n => adj.set(n.id, []));
      nodes.forEach(n => {
        if (n.to) {
          n.to.forEach(tid => {
            const targetNode = nodeMap.get(tid);
            if (targetNode) {
              const d = Math.hypot(n.x - targetNode.x, n.y - targetNode.y);
              if (!adj.get(n.id).some(e => e.id === tid)) {
                adj.get(n.id).push({ id: tid, dist: d });
              }
              if (adj.has(tid) && !adj.get(tid).some(e => e.id === n.id)) {
                adj.get(tid).push({ id: n.id, dist: d });
              }
            }
          });
        }
      });

      // 3. 從 endNode 反向執行 Dijkstra，計算所有節點到終點的最短距離與後繼節點 nextMap
      const distToTarget = new Map();
      const nextMap = new Map();
      distToTarget.set(endNode.id, 0);

      const pq = [{ id: endNode.id, dist: 0 }];
      while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const cur = pq.shift();
        if (cur.dist > distToTarget.get(cur.id)) continue;

        const neighbors = adj.get(cur.id) || [];
        for (const edge of neighbors) {
          const newD = cur.dist + edge.dist;
          if (!distToTarget.has(edge.id) || newD < distToTarget.get(edge.id)) {
            distToTarget.set(edge.id, newD);
            nextMap.set(edge.id, cur.id); // 從 edge.id 走向 cur.id 朝終點前進
            pq.push({ id: edge.id, dist: newD });
          }
        }
      }

      // 4. 尋找與玩家最近的基準節點 nearestStartNode
      let nearestStartNode = null;
      let minStartDist = Infinity;
      for (const n of nodes) {
        const d = Math.hypot(n.x - startPos.x, n.y - startPos.y);
        if (d < minStartDist) {
          minStartDist = d;
          nearestStartNode = n;
        }
      }

      if (!nearestStartNode || !distToTarget.has(nearestStartNode.id)) {
        return [startPos, endPos];
      }

      // 候選節點：包含 nearestStartNode 與其相鄰節點（保證不跨越障礙穿牆）
      const candidateIds = new Set([nearestStartNode.id]);
      const neighbors = adj.get(nearestStartNode.id) || [];
      neighbors.forEach(e => candidateIds.add(e.id));

      // 5. 評估 Cost(n) = dist(player, n) + distToTarget(n) 最小者，前進節點勝出！
      let bestStartNode = nearestStartNode;
      let minCost = Infinity;

      candidateIds.forEach(cid => {
        if (!distToTarget.has(cid)) return;
        const node = nodeMap.get(cid);
        if (!node) return;
        const dFromPlayer = Math.hypot(node.x - startPos.x, node.y - startPos.y);
        const cost = dFromPlayer + distToTarget.get(cid);
        if (cost < minCost) {
          minCost = cost;
          bestStartNode = node;
        }
      });

      // 6. 沿著 nextMap 串接通往終點的路徑序列
      const pathPoints = [];
      let currId = bestStartNode.id;
      const visited = new Set();
      while (currId && !visited.has(currId)) {
        visited.add(currId);
        const node = nodeMap.get(currId);
        if (node) pathPoints.push({ x: node.x, y: node.y });
        if (currId === endNode.id) break;
        currId = nextMap.get(currId);
      }

      // 若玩家已經幾乎與第一個路徑點重合（小於 14px），省略該點避免原地折返抖動
      if (pathPoints.length > 1) {
        const dFirst = Math.hypot(pathPoints[0].x - startPos.x, pathPoints[0].y - startPos.y);
        if (dFirst < 14) {
          pathPoints.shift();
        }
      }

      const points = [startPos, ...pathPoints];
      // 確保目標點為最後一點
      const last = points[points.length - 1];
      if (Math.hypot(last.x - endPos.x, last.y - endPos.y) > 10) {
        points.push(endPos);
      }

      return points;
    },

    // 生成地面實體箭頭路徑（像麵包屑般釘在地面上，未走到的永遠保留，走過的立即消失）
    initNavTrail() {
      const targetLoc = this.getCurrentTargetLocation();
      if (!targetLoc) {
        this._navTrail = null;
        return;
      }

      const p = GameState.player;
      const points = this.findScenePath({ x: p.x, y: p.y }, targetLoc);
      if (!points || points.length < 2) {
        this._navTrail = null;
        return;
      }

      // 1. 計算各線段與累計總長度
      const segments = [];
      let totalLength = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        segments.push({ p1, p2, len: segLen, angle, startDist: totalLength });
        totalLength += segLen;
      }

      if (totalLength < 18) {
        this._navTrail = {
          sceneId: GameState.currentSceneId,
          targetLoc,
          arrows: []
        };
        return;
      }

      // 2. 沿路徑每隔 spacing = 32px 鋪設實體地面箭頭
      const spacing = 32;
      const arrows = [];
      let arrowId = 0;

      for (let d = 22; d <= totalLength - 16; d += spacing) {
        const seg = segments.find(s => d >= s.startDist && d <= s.startDist + s.len);
        if (!seg || seg.len === 0) continue;

        const ratio = (d - seg.startDist) / seg.len;
        const ax = seg.p1.x + (seg.p2.x - seg.p1.x) * ratio;
        const ay = seg.p1.y + (seg.p2.y - seg.p1.y) * ratio;

        arrows.push({
          id: arrowId++,
          x: ax,
          y: ay,
          angle: seg.angle,
          passed: false
        });
      }

      this._navTrail = {
        sceneId: GameState.currentSceneId,
        targetLoc,
        arrows
      };
    },

    // 遊戲迴圈每幀更新地面箭頭：學生走過之箭頭即刻消失，未走到的持續保留
    updateNavTrail() {
      if (!GameState.navigation.active || GameState.dialogue.active) return;

      const curSceneId = GameState.currentSceneId;
      const curTarget = this.getCurrentTargetLocation();
      if (!curTarget) return;

      // 若場景改變或尚未建立路徑，立刻重新生成新場景箭頭
      if (!this._navTrail || this._navTrail.sceneId !== curSceneId) {
        this.initNavTrail();
        return;
      }

      // 若目標座標改變超過 25px，重新規劃
      const t = this._navTrail.targetLoc;
      if (Math.hypot(t.x - curTarget.x, t.y - curTarget.y) > 25) {
        this.initNavTrail();
        return;
      }

      const p = GameState.player;
      const arrows = this._navTrail.arrows;
      if (!arrows || arrows.length === 0) return;

      // 檢測學生是否走過箭頭（走過之箭頭立即消失，未走過之箭頭持續保留）
      let maxPassedIdx = -1;
      for (let i = 0; i < arrows.length; i++) {
        const a = arrows[i];
        if (a.passed) {
          maxPassedIdx = i;
          continue;
        }
        const dist = Math.hypot(a.x - p.x, a.y - p.y);
        if (dist < 30) {
          a.passed = true;
          maxPassedIdx = i;
        }
      }

      // 當踩到第 i 個箭頭時，前序箭頭皆視為已走過，確保身後 100% 乾淨零殘留
      if (maxPassedIdx >= 0) {
        for (let i = 0; i <= maxPassedIdx; i++) {
          arrows[i].passed = true;
        }
      }

      // 防呆：若學生大幅偏離路徑超過 130px，重新為其規劃引導路線
      const nextUnpassed = arrows.find(a => !a.passed);
      if (nextUnpassed) {
        const distToNext = Math.hypot(nextUnpassed.x - p.x, nextUnpassed.y - p.y);
        if (distToNext > 130) {
          this.initNavTrail();
        }
      }
    },

    // 繪製地面實體箭頭與導引微光 (未走到的箭頭一直存在，走過的即刻消失)
    drawNavTrail(ctx) {
      if (!GameState.navigation.active || !this._navTrail || GameState.dialogue.active) return;
      if (this._navTrail.sceneId !== GameState.currentSceneId) return;

      const p = GameState.player;
      const targetLoc = this._navTrail.targetLoc;
      const arrows = this._navTrail.arrows;
      const unpassed = arrows.filter(a => !a.passed);

      const now = performance.now();
      ctx.save();

      // 1. 若前方還有未走到的箭頭，繪製從玩家通往目標的柔和導引光束
      if (unpassed.length > 0 && targetLoc) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        unpassed.forEach(a => ctx.lineTo(a.x, a.y));
        ctx.lineTo(targetLoc.x, targetLoc.y);
        ctx.strokeStyle = 'rgba(255, 205, 50, 0.22)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // 核心向前流動虛線微光
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        unpassed.forEach(a => ctx.lineTo(a.x, a.y));
        ctx.lineTo(targetLoc.x, targetLoc.y);
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -(now / 28) % 20;
        ctx.strokeStyle = 'rgba(255, 240, 160, 0.55)';
        ctx.lineWidth = 2.0;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. 繪製所有「未走過」的地面實體箭頭（一直存在，走過即滅）
      unpassed.forEach(a => {
        // 微細呼吸律動
        const pulse = Math.sin(now / 240 + a.id * 0.45) * 0.12;
        const scale = 1.0 + pulse;

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        ctx.scale(scale, scale);

        // A. 箭頭背後金光圓形光暈
        ctx.beginPath();
        ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 40, 0.32)';
        ctx.fill();

        // B. 飽滿立體金色指引箭頭 (向前推進形狀，常駐可見)
        ctx.beginPath();
        ctx.moveTo(7.5, 0);          // 尖端頂點
        ctx.lineTo(-4.5, -5.5);      // 左翼
        ctx.lineTo(-1.8, 0);         // 內縮後腰
        ctx.lineTo(-4.5, 5.5);       // 右翼
        ctx.closePath();

        ctx.fillStyle = '#ffe066';
        ctx.fill();
        ctx.strokeStyle = '#c67d10';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      });

      // 3. 終點動態光環
      if (targetLoc) {
        const ringProgress = (now / 750) % 1;
        const r = 12 + ringProgress * 18;
        const alphaRing = (1 - ringProgress) * 0.75;

        ctx.beginPath();
        ctx.ellipse(targetLoc.x, targetLoc.y, r, r * 0.55, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 0, ${alphaRing})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    },

    // 向下相容空函式
    drawGuidanceWaves(ctx, player, targetLoc) {
      this.drawNavTrail(ctx);
    },

    drawNavigationRoute(ctx, player, targetLoc) {
      this.drawNavTrail(ctx);
    },

    // 更新左上方單一羅盤箭頭角度 (僅在開啟導航時指示，保持平時乾淨)
    updateNavArrow(player, targetLoc) {
      const pointer = document.getElementById('nav-arrow-pointer');
      if (!pointer) return;
      if (!targetLoc || !GameState.navigation.active) {
        pointer.style.display = 'none';
        return;
      }
      pointer.style.display = 'block';
      const dx = targetLoc.x - player.x;
      const dy = targetLoc.y - player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 32) {
        pointer.textContent = '●';
        pointer.style.transform = 'scale(1.3)';
        pointer.style.color = '#2e7d32';
      } else {
        pointer.textContent = '▲';
        pointer.style.color = '#df9824';
        const angleRad = Math.atan2(dy, dx);
        const deg = angleRad * (180 / Math.PI) + 90;
        pointer.style.transform = `rotate(${deg}deg)`;
      }
    },

    // 繪製玩家角色頭頂黃色倒三角形指示標記 (提示玩家目前操控的角色)
    drawPlayerIndicator(ctx, player) {
      if (!player) return;
      if (GameState.dialogue && GameState.dialogue.active) return;

      const px = player.x;
      const py = player.y;

      // 角色身高縮放 1.1，頭頂約在 py - 48 處；在 py - 54 處上下柔和浮動
      const now = performance.now();
      const floatOffset = Math.sin(now / 220) * 3.5;
      const tipY = py - 54 + floatOffset;

      ctx.save();
      ctx.translate(px, tipY);

      // 倒三角形 (頂點朝下指著主角頭部)：下尖端 (0, 0)，左上 (-7.5, -11.5)，右上 (7.5, -11.5)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7.5, -11.5);
      ctx.lineTo(7.5, -11.5);
      ctx.closePath();

      // 金黃立體漸層
      const grad = ctx.createLinearGradient(0, -11.5, 0, 0);
      grad.addColorStop(0, '#fff475');
      grad.addColorStop(1, '#f1c40f');

      // 柔和金光光暈
      ctx.shadowColor = 'rgba(240, 180, 20, 0.75)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = grad;
      ctx.fill();

      // 鮮明深琥珀描邊
      ctx.strokeStyle = '#7c4a00';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.restore();
    },

    // 繪製目標地點淺黃色優雅呼吸光暈 (地面不繪製整排多餘箭頭，保持乾淨)
    drawTargetAura(ctx, targetLoc) {
      if (!targetLoc) return;
      const pulse = (Math.sin(Date.now() / 650) + 1) * 0.5;
      ctx.save();

      // 外圈柔和呼吸黃暈
      ctx.beginPath();
      ctx.ellipse(targetLoc.x, targetLoc.y + 4, 26 + pulse * 7, 12 + pulse * 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248, 208, 75, ${0.30 + pulse * 0.30})`;
      ctx.fill();

      // 內圈黃金光環
      ctx.beginPath();
      ctx.ellipse(targetLoc.x, targetLoc.y + 4, 16, 7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(235, 170, 40, 0.9)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 核心高光
      ctx.beginPath();
      ctx.arc(targetLoc.x, targetLoc.y + 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#e8a530';
      ctx.fill();

      // 目標懸浮指引標記
      if (targetLoc.isFinal) {
        ctx.fillStyle = '#e8a530';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▼', targetLoc.x, targetLoc.y - 28 - pulse * 4);
      }
      ctx.restore();
    },

    // 計算當前指引目標座標 (用於左上方羅盤指針與地面黃色呼吸光暈)
    getCurrentTargetLocation() {
      const q = GameState.quest;
      const sId = GameState.currentSceneId;

      // S3 班級教室
      if (sId === 'S3') {
        if (!q.completedNodes.has('node1')) {
          return { x: 311, y: 355, isFinal: true }; // 座位嘲笑紙條
        } else if (q.step === 9 && !q.completedNodes.has('node9')) {
          return { x: 210, y: 345, isFinal: true }; // 第 5 天：同學丙座位
        } else {
          return { x: 755, y: 470, isFinal: false }; // 走出教室門
        }
      }
      // S4 走廊 (接到穿堂的位置在下方樓梯口 x:1120, y:520)
      else if (sId === 'S4') {
        if (q.step === 2 && !q.completedNodes.has('node2')) {
          return { x: 520, y: 310, isFinal: true }; // 飲水機
        } else if (q.step === 3 && !q.completedNodes.has('node3')) {
          return { x: 637, y: 250, isFinal: false }; // 輔導室門
        } else if (q.step === 4) {
          return { x: 1120, y: 520, isFinal: false }; // 走下樓梯前往穿堂 (下方)
        } else if (q.step === 5 && !q.completedNodes.has('node5')) {
          return { x: 320, y: 310, isFinal: true }; // 同學乙
        } else if (q.step === 6 && !q.completedNodes.has('node6')) {
          return { x: 877, y: 250, isFinal: false }; // 學務處門
        } else if (q.step >= 9) {
          return { x: 1120, y: 520, isFinal: false }; // 大結局：走下樓梯前往穿堂 (下方)
        }
      }
      // S5 穿堂
      else if (sId === 'S5') {
        if (q.step === 4 && !q.completedNodes.has('node4')) {
          return { x: 384, y: 310, isFinal: true }; // 穿堂同儕閒話
        } else if (q.step === 5) {
          return { x: 384, y: 60, isFinal: false }; // 回走廊北階梯
        } else if (q.step >= 9) {
          return { x: 384, y: 530, isFinal: false }; // 大結局：步出穿堂往 S1
        }
      }
      // S6 輔導室
      else if (sId === 'S6') {
        if (q.step === 3 && !q.completedNodes.has('node3')) {
          return { x: 380, y: 280, isFinal: true }; // 導師傾訴會談
        } else {
          return { x: 320, y: 450, isFinal: false }; // 離開門
        }
      }
      // S7 學務處
      else if (sId === 'S7') {
        if (q.step === 6 && !q.completedNodes.has('node6')) {
          return { x: 365, y: 395, isFinal: true }; // 三方會談主角座椅
        } else {
          return { x: 350, y: 480, isFinal: false }; // 離開門
        }
      }
      // S8 家：臥室 (門在左上 x:90, y:240，床在右側 x:320, y:270)
      else if (sId === 'S8') {
        if (q.step === 7 && !q.completedNodes.has('node7')) {
          return { x: 320, y: 270, isFinal: true }; // 臥室媽媽談話
        } else {
          return { x: 90, y: 240, isFinal: false }; // 往客廳門 (左上方)
        }
      }
      // S9 家：客廳 (門在左下 x:100, y:350，電話在右上小桌 x:550, y:270)
      else if (sId === 'S9') {
        if (q.step === 8 && !q.completedNodes.has('node8')) {
          return { x: 550, y: 270, isFinal: true }; // 導師關心電話 (右上桌子)
        } else {
          return { x: 100, y: 350, isFinal: false }; // 回臥室門 (左下方)
        }
      }
      // S1 校園主地圖
      else if (sId === 'S1') {
        if (q.step >= 9) {
          return { x: 640, y: 910, isFinal: false }; // 大結局：前往校門口
        } else {
          return { x: 640, y: 250, isFinal: false };
        }
      }
      // S2 校門口
      else if (sId === 'S2') {
        if (q.completedNodes.has('node9') || q.step >= 10) {
          return { x: 384, y: 420, isFinal: true }; // 大結局：走出校門
        } else {
          return { x: 384, y: 415, isFinal: false };
        }
      }

      return null;
    },

    // 渲染遊戲世界 (Contain 縮放全貌視野、角色身周導引箭頭、自由漫步路人、動態天色光影)
    render() {
      const ctx = this.ctx;
      const cw = this.canvas.width;
      const ch = this.canvas.height;

      // 畫布背景填充典雅深木色底，消除刺眼純黑邊
      ctx.fillStyle = '#1e1a17';
      ctx.fillRect(0, 0, cw, ch);

      // 取得當前場景規格
      const spec = AssetLoader.sceneSpecs[GameState.currentSceneId] || { w: 800, h: 576 };

      // Contain 縮放計算：整張場景圖片剛好完整顯示在畫面上，絕不裁切，一眼掌握全貌
      const scale = Math.min(cw / spec.w, ch / spec.h);
      this.camera.scale = scale;
      this.camera.x = spec.w / 2;
      this.camera.y = spec.h / 2;
      const p = GameState.player;

      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.scale(scale, scale);
      ctx.translate(-spec.w / 2, -spec.h / 2);

      // 1. 繪製手繪背景圖
      const sceneImg = AssetLoader.scenes[GameState.currentSceneId];
      if (sceneImg && sceneImg.complete) {
        ctx.drawImage(sceneImg, 0, 0, spec.w, spec.h);
      } else {
        ctx.fillStyle = '#f7f4ea';
        ctx.fillRect(0, 0, spec.w, spec.h);
      }

      // 2. 指引目標：地面呼吸光暈與導航路線
      const targetLoc = this.getCurrentTargetLocation();

      if (targetLoc) {
        this.updateNavArrow(p, targetLoc);
        if (!GameState.dialogue.active) {
          this.drawTargetAura(ctx, targetLoc);
        }
      }

      // 繪製地面實體導航箭頭路徑 (未走到的持續保留，走過後立即消失，直到對話或手動取消)
      if (GameState.navigation.active && !GameState.dialogue.active) {
        this.drawNavTrail(ctx);
      }

      // 3. 繪製各場景關鍵劇情 NPC
      const sId = GameState.currentSceneId;
      const q = GameState.quest;

      if (sId === 'S3') {
        // 同學丙：僅在 Day 5 (Node 9 重返校園同儕支持) 時坐在座位上
        if (q.step === 9 && !q.completedNodes.has('node9')) {
          CharacterSpriteRenderer.drawNPC(ctx, 210, 345, 'classmate_c', true, 'down', 0, '同學丙');
        }
        // 第一幕及其他自習時段教室保持靜態，不出現同學甲與同學丙
      }
      else if (sId === 'S4') {
        // Node 2 (飲水機攔截事件)：僅同學甲攔截，絕不提前出現同學乙！
        if (q.step === 2 && !q.completedNodes.has('node2')) {
          CharacterSpriteRenderer.drawNPC(ctx, 520, 310, 'classmate_a', true, 'down', 0, '同學甲');
        }
        // Node 5 (午休走廊遭遇)：同學乙首度在此正式現身！
        else if (q.step === 5 && !q.completedNodes.has('node5')) {
          CharacterSpriteRenderer.drawNPC(ctx, 320, 310, 'classmate_b', true, 'down', 0, '同學乙');
        }
      }
      else if (sId === 'S5') {
        // Node 4 (同儕閒話事件)：穿堂路人同學丁與同學戊（不出現同學乙）
        if (q.step === 4 && !q.completedNodes.has('node4')) {
          CharacterSpriteRenderer.drawNPC(ctx, 370, 310, 'classmate_d', true, 'right', 0, '同學丁');
          CharacterSpriteRenderer.drawNPC(ctx, 400, 310, 'classmate_e', true, 'left', 0, '同學戊');
        }
      }
      else if (sId === 'S6') {
        // 輔導室：輔導老師長駐
        const isTargetCounselor = (q.step === 3 && !q.completedNodes.has('node3'));
        CharacterSpriteRenderer.drawNPC(ctx, 380, 240, 'counselor', isTargetCounselor, 'down', 0, '輔導老師');
      }
      else if (sId === 'S7') {
        // 學務處三方會談 (長桌 X:220~515, Y:275~365)：生教組長、家長、學生分別坐在會議桌座椅上
        const isTargetDiscipline = (q.step === 6 && !q.completedNodes.has('node6'));

        // 1. 北側主席椅 (長桌正上方主位)：生教組長長駐主持 (精準座標 365, 258)
        CharacterSpriteRenderer.drawNPC(ctx, 365, 258, 'discipline_master', false, 'down', 0, '生教組長');

        // 2. 三方會談期間 (Node 6)：雙方家長與學生皆坐在會議桌座椅，呈現嚴肅真實的面對面三方會談！
        if (isTargetDiscipline) {
          // 西側家長席 (左邊木椅)：主角媽媽面對會議桌 (精準座標 190, 325)
          CharacterSpriteRenderer.drawNPC(ctx, 190, 325, 'mother', false, 'right', 0, '媽媽');

          // 東側對立席 (右邊木椅)：同學乙爸爸面對會議桌 (精準座標 540, 325)
          CharacterSpriteRenderer.drawNPC(ctx, 540, 325, 'classmate_b_dad', false, 'left', 0, '同學乙爸爸');
          // 北側右席 (爸爸身旁)：同學乙依序入座 (精準座標 475, 258)
          CharacterSpriteRenderer.drawNPC(ctx, 475, 258, 'classmate_b', false, 'down', 0, '同學乙');

          // 南側主角座位引導：入座長桌南側中央木椅 (精準座標 365, 395)
          ctx.save();
          const chairPulse = (Math.sin(Date.now() / 320) + 1) * 0.5;

          // 座位金黃色光圈與入座標記
          ctx.beginPath();
          ctx.ellipse(365, 395, 20 + chairPulse * 4, 8 + chairPulse * 2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(235, 160, 30, ${0.7 + chairPulse * 0.3})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#e8a530';
          ctx.textAlign = 'center';
          ctx.fillText('【你的座位】', 365, 370 - chairPulse * 3);
          ctx.restore();
        }
      }
      else if (sId === 'S2') {
        // 校門口：警衛叔叔長駐
        CharacterSpriteRenderer.drawNPC(ctx, 500, 220, 'guard', false, 'down', 0, '警衛叔叔');
      }
      else if (sId === 'S8') {
        // 臥室：第 4 天媽媽談話 (床邊 320, 270)
        if (q.step === 7 && !q.completedNodes.has('node7')) {
          CharacterSpriteRenderer.drawNPC(ctx, 320, 270, 'mother', true, 'left', 0, '媽媽');
        }
      }
      else if (sId === 'S9') {
        // 客廳：電視旁小桌上的電話機微光與鈴響提示
        if (q.step === 8 && !q.completedNodes.has('node8')) {
          const phonePulse = (Math.sin(Date.now() / 320) + 1) * 0.5;
          ctx.save();
          // 電話桌光暈
          ctx.beginPath();
          ctx.arc(550, 215, 22 + phonePulse * 7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 185, 45, ${0.35 + phonePulse * 0.35})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(550, 215, 11, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(235, 160, 30, 0.95)';
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // 叮鈴鈴來電聲波震動符號
          ctx.fillStyle = '#d4881e';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('☎ 鈴～', 550, 182 - phonePulse * 3);
          ctx.restore();
        }
      }

      // 4. 繪製全校園自由走動漫步的路人學生！
      AmbientNPCManager.draw(ctx, sId);

      // 5. 繪製玩家角色 (全身走動小人，精緻靈動五官)
      CharacterSpriteRenderer.draw(
        ctx,
        p.x,
        p.y,
        p.direction,
        p.frame,
        GameState.selectedGender,
        1.1
      );

      // 6. 玩家角色頭頂黃色倒三角形指示標記 (提示玩家目前操控的角色)
      this.drawPlayerIndicator(ctx, p);

      // 7. 疊加全場景動態天色光影、環境氛圍與心理狀態濾鏡！
      AtmosphereRenderer.draw(ctx, spec.w, spec.h, GameState.timeOfDay, GameState.stats);

      ctx.restore();
    },

    // ========================================================================
    // 8. 視覺小說對話系統 (支援心靈小提醒與自主操作節奏)
    // ========================================================================
    triggerNode(nodeId) {
      // 進入對話時自動關閉地面尋路導航
      if (GameState.navigation.active) {
        this.stopNavigation();
      }

      if (this._phoneRingTimer) {
        clearInterval(this._phoneRingTimer);
        this._phoneRingTimer = null;
      }

      if (!DialoguesDB || !DialoguesDB.nodes) return;
      if (GameState.quest.completedNodes.has(nodeId)) {
        this.showToast('此事件已經處理完成。請依目標指引前往下一地點。');
        return;
      }

      const node = DialoguesDB.nodes.find(n => n.id === nodeId);
      if (!node) return;

      GameState.dialogue.currentNodeData = node;
      GameState.dialogue.inSubQuestion = false;
      GameState.dialogue.history = [];

      const lines = [];
      if (node.intro && node.intro.length) {
        node.intro.forEach(item => {
          if (item.type === 'narrative') {
            lines.push({ speaker: '旁白', text: item.text, npc: null });
          } else if (item.type === 'conditional') {
            // 條件分支解析 (例如 Q1 == '2' 照片存證分支，向下相容 'B')
            const cond = item.condition || '';
            let isMet = false;
            const parts = cond.split('||');
            for (const part of parts) {
              const match = part.trim().match(/(\w+)\s*==\s*['"](\w+)['"]/);
              if (match) {
                const qKey = match[1];
                const val = match[2];
                if (GameState.playerChoices[qKey] === val) {
                  isMet = true;
                  break;
                }
              }
            }
            if (isMet) {
              const c = item.content || {};
              lines.push({ speaker: c.speaker || '輔導老師', text: c.text, npc: c.speaker || '輔導老師' });
            } else {
              // 若未拍照存證（非選 2 情況），依指示以「（沉默不語）」呈現受凌學生的心理狀態
              lines.push({ speaker: '你', text: '（沉默不語）', npc: null });
            }
          } else if (item.speaker && item.text) {
            lines.push({ speaker: item.speaker, text: item.text, npc: item.speaker });
          }
        });
      }

      this.startDialogueSequence(lines, () => {
        this.presentQuestion(node.question);
      });
    },

    startDialogueSequence(lines, onComplete) {
      GameState.dialogue.active = true;
      GameState.dialogue.textQueue = [...lines];
      GameState.dialogue.onComplete = onComplete;

      document.getElementById('dialogue-layer').classList.add('active');
      document.getElementById('choices-container').style.display = 'none';
      document.getElementById('feedback-card').style.display = 'none';
      document.getElementById('dialogue-prompt').style.display = 'block';
      const histContainer = document.getElementById('dialogue-history-container');
      if (histContainer) histContainer.style.display = 'none';

      this.advanceDialogue();
    },

    advanceDialogue() {
      const d = GameState.dialogue;

      if (d.isTyping) {
        clearInterval(d.typewriterTimer);
        d.isTyping = false;
        document.getElementById('dialogue-content').textContent = d.currentLine.text;
        return;
      }

      if (d.waitingChoice) return;

      if (d.textQueue.length > 0) {
        d.currentLine = d.textQueue.shift();
        this.displayLine(d.currentLine);
      } else {
        if (d.onComplete) {
          const cb = d.onComplete;
          d.onComplete = null;
          cb();
        } else {
          this.closeDialogue();
        }
      }
    },

    displayLine(line) {
      const d = GameState.dialogue;
      if (line && line.text && !line.isTip) {
        if (!Array.isArray(d.history)) d.history = [];
        d.history.push({
          speaker: line.speaker || '你',
          text: line.text
        });
      }

      const speakerEl = document.getElementById('speaker-name');
      speakerEl.textContent = line.speaker || '你';

      // 若是心靈小提醒，套用溫暖色調標籤
      if (line.isTip) {
        speakerEl.style.background = 'linear-gradient(135deg, #d98a2b, #be5b3b)';
      } else {
        speakerEl.style.background = 'var(--primary-wood)';
      }

      // 立繪切換 (透明去背圖)
      const npcWrapper = document.getElementById('portrait-npc');
      const npcImg = document.getElementById('img-portrait-npc');
      const playerWrapper = document.getElementById('portrait-player');

      if (line.npc && AssetLoader.portraits[line.npc]) {
        npcImg.src = AssetLoader.portraitList[line.npc];
        npcWrapper.classList.add('active');
        if (line.speaker === '你') {
          playerWrapper.classList.remove('dimmed');
          npcWrapper.classList.add('dimmed');
        } else {
          playerWrapper.classList.add('dimmed');
          npcWrapper.classList.remove('dimmed');
        }
      } else {
        npcWrapper.classList.remove('active');
        playerWrapper.classList.remove('dimmed');
      }

      // 打字機動畫效果
      const contentEl = document.getElementById('dialogue-content');
      contentEl.textContent = '';
      d.isTyping = true;
      let charIdx = 0;

      SoundFX.click();
      clearInterval(d.typewriterTimer);
      d.typewriterTimer = setInterval(() => {
        if (charIdx < line.text.length) {
          contentEl.textContent += line.text[charIdx];
          charIdx++;
        } else {
          clearInterval(d.typewriterTimer);
          d.isTyping = false;
        }
      }, 24);
    },

    // 展現問題與三個選項 (A, B, C)
    presentQuestion(qData) {
      if (!qData) {
        this.closeDialogue();
        return;
      }

      const d = GameState.dialogue;
      d.waitingChoice = true;
      document.getElementById('dialogue-prompt').style.display = 'none';

      // 呈現前情對話滾動回顧（讓玩家能在作答前隨時回顧情境）
      const histContainer = document.getElementById('dialogue-history-container');
      const histList = document.getElementById('dialogue-history-list');
      if (histContainer && histList) {
        if (d.history && d.history.length > 0) {
          histList.textContent = '';
          d.history.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            const spkSpan = document.createElement('span');
            spkSpan.className = 'history-item-speaker';
            spkSpan.textContent = (item.speaker || '對話') + '：';
            const txtSpan = document.createElement('span');
            txtSpan.className = 'history-item-text';
            txtSpan.textContent = item.text || '';
            itemDiv.appendChild(spkSpan);
            itemDiv.appendChild(txtSpan);
            histList.appendChild(itemDiv);
          });
          histContainer.style.display = 'block';
          histList.scrollTop = histList.scrollHeight;
        } else {
          histContainer.style.display = 'none';
        }
      }

      document.getElementById('speaker-name').textContent = '抉擇時刻';
      document.getElementById('dialogue-content').textContent = qData.prompt || '這時候，你會怎麼做？';

      const container = document.getElementById('choices-container');
      container.textContent = '';
      container.style.display = 'flex';

      const optionsList = qData.choices || qData.options || [];

      optionsList.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        const letterKey = opt.letter || opt.key || String(idx + 1);
        
        const keySpan = document.createElement('span');
        keySpan.className = 'choice-key';
        keySpan.textContent = String(idx + 1);

        const textSpan = document.createElement('span');
        textSpan.textContent = opt.text;

        btn.appendChild(keySpan);
        btn.appendChild(textSpan);

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleOptionChosen(opt);
        });
        container.appendChild(btn);
      });
    },

    selectChoiceByIndex(idx) {
      if (!GameState.dialogue.waitingChoice) return;
      const btns = document.querySelectorAll('.choice-btn');
      if (btns && btns[idx]) {
        btns[idx].click();
      }
    },

    // 處理選項結算 (數值增減2秒浮動回饋 ＋ 心靈小提醒)
    handleOptionChosen(option) {
      const d = GameState.dialogue;
      d.waitingChoice = false;
      document.getElementById('choices-container').style.display = 'none';

      // 記錄玩家在該題目的抉擇代號 (例如 { Q1: 'B' })
      const node = d.currentNodeData;
      const qId = (node && node.question) ? node.question.id : null;
      if (qId && option.letter) {
        GameState.playerChoices[qId] = option.letter;
      }

      // 將玩家的抉擇回答加入對話歷程清單中
      if (!Array.isArray(d.history)) d.history = [];
      d.history.push({
        speaker: '你（你的抉擇）',
        text: option.text
      });

      // 依使用者指示：若選擇完後還會繼續對話，將玩家回答即時加入上方對話歷程並保持顯示
      const histContainer = document.getElementById('dialogue-history-container');
      const histList = document.getElementById('dialogue-history-list');
      if (histContainer && histList) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        itemDiv.style.borderLeft = '3px solid #3b82f6';
        itemDiv.style.background = 'rgba(235, 245, 255, 0.85)';
        const spkSpan = document.createElement('span');
        spkSpan.className = 'history-item-speaker';
        spkSpan.style.color = '#1d4ed8';
        spkSpan.textContent = '你（你的抉擇）：';
        const txtSpan = document.createElement('span');
        txtSpan.className = 'history-item-text';
        txtSpan.textContent = option.text;
        itemDiv.appendChild(spkSpan);
        itemDiv.appendChild(txtSpan);
        histList.appendChild(itemDiv);
        histContainer.style.display = 'block';
        histList.scrollTop = histList.scrollHeight;
      }

      // 1. 數值變更結算
      const eff = option.effects || { stress: 0, peer: 0, courage: 0, safety: 0, selfEsteem: 0 };
      GameState.stats.stress = Math.min(100, Math.max(0, GameState.stats.stress + (eff.stress || 0)));
      GameState.stats.peer = Math.min(100, Math.max(0, GameState.stats.peer + (eff.peer || 0)));
      GameState.stats.courage = Math.min(100, Math.max(0, GameState.stats.courage + (eff.courage || 0)));
      GameState.stats.safety = Math.min(100, Math.max(0, GameState.stats.safety + (eff.safety || 0)));
      GameState.stats.selfEsteem = Math.min(100, Math.max(0, GameState.stats.selfEsteem + (eff.selfEsteem || 0)));

      // 依據整體狀態值更新全場景動態光影演變目標
      if (AtmosphereRenderer && AtmosphereRenderer.setTargetScore) {
        AtmosphereRenderer.setTargetScore(GameState.getOverallScore());
      }

      // 觸發頂部 2 秒浮動增減標籤回饋！
      this.updateHUD(eff);

      if (eff.stress > 0) {
        SoundFX.stressUp();
      } else {
        SoundFX.positive();
      }

      // 2. 準備後續對話隊列 (角色台詞 ＋ 劇本心靈小提醒)
      const responseLines = [];
      const repliesList = option.replies || option.response || [];
      repliesList.forEach(r => {
        responseLines.push({ speaker: r.speaker || '同學甲', text: r.text, npc: r.speaker || '同學甲' });
      });

      // 將劇本中的「小提醒」作為專屬對話台詞呈現，讓學生清晰閱讀理解
      if (option.tip) {
        responseLines.push({
          speaker: '💡 心靈小提醒',
          text: option.tip,
          npc: null,
          isTip: true
        });
      }

      this.startDialogueSequence(responseLines, () => {
        // 3. 檢查是否觸發壓力過載 (>= 100)
        if (GameState.stats.stress >= 100) {
          this.triggerStressOverload();
          return;
        }

        // 4. 檢查是否有子問題 (如 Node 3 的 Q4，Node 5 的 Q7)
        const node = d.currentNodeData;
        if (node && node.subQuestion && !d.inSubQuestion) {
          d.inSubQuestion = true;
          if (node.bridge && node.bridge.length) {
            const bridgeLines = node.bridge.map(b => ({ speaker: b.speaker || '旁白', text: b.text, npc: b.speaker }));
            this.startDialogueSequence(bridgeLines, () => {
              this.presentQuestion(node.subQuestion);
            });
            return;
          } else {
            this.presentQuestion(node.subQuestion);
            return;
          }
        }

        // 5. 當前節點正式完成！關閉對話，交由玩家自主自由操控移動！
        this.completeCurrentNode(node ? node.id : 'node1');
      });
    },

    // 跨天與放學黑底白字轉場標題卡 (支援西敏寺放學鐘聲)
    showDayTransition({ badge, title, subtitle, playBell = false }, onComplete) {
      const modal = document.getElementById('modal-day-transition');
      if (!modal) {
        if (onComplete) onComplete();
        return;
      }

      document.getElementById('trans-badge').textContent = badge || '';
      document.getElementById('trans-title').textContent = title || '';
      document.getElementById('trans-subtitle').textContent = subtitle || '';

      modal.classList.add('active');

      if (playBell) {
        SoundFX.playCampusBell();
      } else {
        SoundFX.positive();
      }

      let isProceeding = false;
      const proceed = (e) => {
        if (e && e.type === 'keydown' && e.code !== 'Space' && e.code !== 'Enter') return;
        if (isProceeding) return;
        isProceeding = true;

        window.removeEventListener('keydown', proceed);
        modal.removeEventListener('click', proceed);

        SoundFX.click();
        modal.classList.remove('active');
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      };

      setTimeout(() => {
        window.addEventListener('keydown', proceed);
        modal.addEventListener('click', proceed);
      }, 350);
    },

    // 完成節點，不強制跳關，轉為自由 RPG 操作指引！
    completeCurrentNode(nodeId) {
      GameState.quest.completedNodes.add(nodeId);
      this.closeDialogue();

      // Q1 完成 (Day 1 清晨自習)
      if (nodeId === 'node1') {
        GameState.quest.step = 2;
        GameState.quest.activeNodeId = 'node2';
        GameState.quest.text = 'Q1 完成！請走出教室右側木門，前往走廊查看飲水機附近情況。';
        this.showToast('Q1 完成！請跟隨地面黃色箭頭，走出教室前往走廊。');
        this.updateHUD();
        this.updateQuestBanner();
      }
      // Q2 完成 (Day 1 第一節下課)
      else if (nodeId === 'node2') {
        GameState.quest.step = 3;
        GameState.quest.activeNodeId = 'node3';

        const choice = GameState.playerChoices['Q2'];
        // 選項二：不回話，先找一位信任的同學，請對方陪你走回教室。
        if (choice === '2' || choice === 'B') {
          this.changeScene('S3', { x: 720, y: 470, dir: 'left' });
          GameState.quest.text = '遭遇同儕威脅！雖然同學陪伴回到了教室，仍請走出教室前往輔導室（S6）尋求輔導老師協助。';
          this.showToast('同學已陪你走回教室。但遇到威脅仍請走出教室，前往走廊旁的輔導室尋求大人協助。');
          this.updateHUD();
          this.updateQuestBanner();
        } else {
          // 選項三或選項一：保持原本在走廊，讓玩家自行從走廊走去輔導室
          GameState.quest.text = '遭遇同儕威脅！請進入輔導室（S6）尋求輔導老師協助。';
          this.showToast('請跟隨黃色箭頭，進入中間木門（輔導室）。');
          this.updateHUD();
          this.updateQuestBanner();
        }
      }
      // Q3 完成 (Day 1 放學 ➔ 心情札記 ➔ 進入 Day 2)
      else if (nodeId === 'node3') {
        this.showDayTransition({
          badge: '第一天・放學',
          title: '下課鐘聲響起，今天辛苦了。',
          subtitle: '走出校門，回家好好休息。明天又是新的一天。',
          playBell: true
        }, () => {
          this.showMoodCheckin(1, () => {
            this.showDayTransition({
              badge: '第二天・清晨',
              title: '第二天，早上',
              subtitle: '晨光灑入校園，深吸一口氣，迎接新的一天。',
              playBell: false
            }, () => {
              GameState.day = 2;
              GameState.timeOfDay = '早上';
              GameState.quest.step = 4;
              GameState.quest.activeNodeId = 'node4';
              GameState.quest.text = '第 2 天早上：請經由走廊前往穿堂大廳（S5）面對同儕閒話。';
              this.changeScene('S4', { x: 900, y: 310, dir: 'right' });
              this.updateHUD();
              this.updateQuestBanner();
            });
          });
        });
      }
      // Q4 完成 (Day 2 早上)
      else if (nodeId === 'node4') {
        GameState.quest.step = 5;
        GameState.quest.activeNodeId = 'node5';
        GameState.timeOfDay = '午休';
        GameState.quest.text = '第 2 天午休：請走回走廊（S4），注意同學乙的行蹤。';
        this.showToast('午休時間，請走回走廊。');
        this.updateHUD();
        this.updateQuestBanner();
      }
      // Q5 完成 (Day 2 放學 ➔ 心情札記 ➔ 進入 Day 3)
      else if (nodeId === 'node5') {
        this.showDayTransition({
          badge: '第二天・放學',
          title: '放學鐘聲迴盪，夕陽染紅了走廊。',
          subtitle: '面對困境的勇氣正在累積，回家養足精神。',
          playBell: true
        }, () => {
          this.showMoodCheckin(2, () => {
            this.showDayTransition({
              badge: '第三天・白天',
              title: '第三天，白天',
              subtitle: '學校安排了親師三方會談，請前往學務處。',
              playBell: false
            }, () => {
              GameState.day = 3;
              GameState.timeOfDay = '白天';
              GameState.quest.step = 6;
              GameState.quest.activeNodeId = 'node6';
              GameState.quest.text = '第 3 天：請進入走廊右側學務處（S7），參加三方家長會談。';
              this.changeScene('S4', { x: 750, y: 310, dir: 'right' });
              this.updateHUD();
              this.updateQuestBanner();
            });
          });
        });
      }
      // Q6~Q8 完成 (Day 3 三方會談結束 ➔ 心情札記 ➔ 進入 Day 4 回家臥室)
      else if (nodeId === 'node6') {
        this.showDayTransition({
          badge: '第三天・傍晚',
          title: '三方會談告一段落，校方與家長正式介入。',
          subtitle: '收拾好書包，搭車回到溫暖的家中。',
          playBell: true
        }, () => {
          this.showMoodCheckin(3, () => {
            this.showDayTransition({
              badge: '第四天・傍晚',
              title: '第四天，傍晚',
              subtitle: '家：臥室。媽媽敲了敲房門，走進房間關心你……',
              playBell: false
            }, () => {
              GameState.day = 4;
              GameState.timeOfDay = '傍晚';
              GameState.quest.step = 7;
              GameState.quest.activeNodeId = 'node7';
              GameState.quest.text = '第 4 天傍晚：在臥室床邊與媽媽坦誠溝通（Node 7）。';
              this.changeScene('S8', { x: 300, y: 300, dir: 'left' });
              this.updateHUD();
              this.updateQuestBanner();
            });
          });
        });
      }
      // Q9 完成 (Day 4 臥室媽媽談話 ➔ 前往客廳接電話)
      else if (nodeId === 'node7') {
        GameState.quest.step = 8;
        GameState.quest.activeNodeId = 'node8';
        GameState.timeOfDay = '晚上';
        GameState.quest.text = '第 4 天晚上：走出臥室前往客廳，接聽導師的關心電話（Node 8）。';
        this.showToast('媽媽給予了你堅定的支持！請走入客廳接聽導師電話。');
        this.updateHUD();
        this.updateQuestBanner();
      }
      // Q10 完成 (Day 4 客廳導師電話 ➔ 心情札記 ➔ 進入 Day 5 重返教室)
      else if (nodeId === 'node8') {
        this.showDayTransition({
          badge: '第四天・夜深',
          title: '夜深了，今晚安穩地睡個好覺。',
          subtitle: '有了家人與老師的堅定後盾，你不再孤單。',
          playBell: false
        }, () => {
          this.showMoodCheckin(4, () => {
            this.showDayTransition({
              badge: '第五天・清晨',
              title: '第五天，清晨',
              subtitle: '破曉時分，帶著堅定的信心重返班級教室。',
              playBell: false
            }, () => {
              GameState.day = 5;
              GameState.timeOfDay = '清晨';
              GameState.quest.step = 9;
              GameState.quest.activeNodeId = 'node9';
              GameState.quest.text = '第 5 天清晨：回到教室（S3），接受同學丙的支持與善意。';
              this.changeScene('S3', { x: 700, y: 470, dir: 'left' });
              this.updateHUD();
              this.updateQuestBanner();
            });
          });
        });
      }
      // Q11 完成 (Day 5 班級教室同學丙 ➔ 第 5 天心情札記 ➔ 全劇本圓滿達成，邁向大結局)
      else if (nodeId === 'node9') {
        GameState.quest.step = 10;
        GameState.quest.text = '全劇情圓滿達成！請走出校門口（S2），迎接陽光破曉大結局。';
        this.updateHUD();
        this.updateQuestBanner();
        this.showMoodCheckin(5, () => {
          this.showToast('感受到了同儕的溫暖！請走出校門口，邁向破曉結局！');
        });
      }
    },

    closeDialogue() {
      GameState.dialogue.active = false;
      document.getElementById('dialogue-layer').classList.remove('active');
      const histContainer = document.getElementById('dialogue-history-container');
      if (histContainer) histContainer.style.display = 'none';
    },

    // ========================================================================
    // 9. 壓力過載 (4-6 深呼吸減壓小遊戲)
    // ========================================================================
    triggerStressOverload() {
      SoundFX.stressUp();
      const bModal = document.getElementById('modal-breathing');
      bModal.classList.add('active');

      GameState.breathing.active = true;
      GameState.breathing.cycle = 1;

      const bubble = document.getElementById('breathing-bubble');
      const statusText = document.getElementById('breathing-status');
      const finishBtn = document.getElementById('btn-finish-breathing');
      finishBtn.style.display = 'none';

      const runCycle = () => {
        if (GameState.breathing.cycle > 3) {
          statusText.textContent = '心率已平復，你做得很好。';
          bubble.textContent = '平靜';
          bubble.className = 'breathing-circle-inner';
          finishBtn.style.display = 'inline-block';
          SoundFX.positive();
          return;
        }

        bubble.textContent = '吸氣 4s';
        bubble.className = 'breathing-circle-inner inhale';
        statusText.textContent = `第 ${GameState.breathing.cycle} / 3 次呼吸：深深吸氣，感受胸腔放鬆...`;
        SoundFX.breatheBell();

        setTimeout(() => {
          bubble.textContent = '吐氣 6s';
          bubble.className = 'breathing-circle-inner exhale';
          statusText.textContent = `第 ${GameState.breathing.cycle} / 3 次呼吸：緩緩吐氣，將不安與緊繃吐出...`;

          setTimeout(() => {
            GameState.breathing.cycle++;
            runCycle();
          }, 6000);
        }, 4000);
      };

      runCycle();

      finishBtn.onclick = () => {
        SoundFX.click();
        bModal.classList.remove('active');
        GameState.breathing.active = false;

        GameState.stats.stress = 60;
        this.updateHUD();
        this.showToast('身心狀態已調節，壓力重設至 60。請繼續你的旅程。');

        const cur = GameState.dialogue.currentNodeData;
        this.completeCurrentNode(cur ? cur.id : 'node1');
      };
    },

    // ========================================================================
    // 10. 五維心靈成長雷達圖與結算系統 (雙層正五角形對比、即時預覽不卡死、平滑重開)
    // ========================================================================

    // ========================================================================
    // 依據五維心理數值動態推導 15 種深度心靈評語、專屬稱號與心靈給力站
    // ========================================================================
    getDetailedEndingEvaluation(s) {
      const relaxed = Math.max(0, Math.min(100, 100 - s.stress));
      const overall = Math.round((relaxed + s.peer + s.courage + s.safety + s.selfEsteem) / 5);

      const arr = [relaxed, s.peer, s.courage, s.safety, s.selfEsteem];
      const maxVal = Math.max(...arr);
      const minVal = Math.min(...arr);

      // 第一大類：破曉晴空型 (整體狀態值 >= 60 分・全面蛻變)
      if (overall >= 60) {
        // 5. 全維卓越型 (各指標均衡且均 >= 55，最大與最小差距 <= 15)
        if (minVal >= 55 && (maxVal - minVal) <= 15) {
          return {
            tier: '破曉',
            badge: `🏆 評估完成・陽光破曉 ｜ 綜合評價：${overall} 分 ｜ 晨曦破曉者・全維心靈典範`,
            title: '陽光破曉：走出陰霾',
            insight: '這是一場無懈可擊的心靈成長旅程！你兼具面對問題的勇氣、接納善意的胸襟、堅定不移的自尊，以及調節情緒的成熟度。這場考驗沒有打倒你，反而讓你提早磨練出能迎向未來一切挑戰的完整人格防護傘。',
            tip: '你已經完整破曉！在現實生活裡，你完全具備成為反霸凌友善大使的潛力。請記得這段破曉時分的感動，把這份正向力量傳遞給每一個需要溫暖的人。'
          };
        }
        // 2. 內在自尊型 (自尊最突出且 >= 62)
        if (s.selfEsteem === maxVal && s.selfEsteem >= 62) {
          return {
            tier: '破曉',
            badge: `🏆 評估完成・陽光破曉 ｜ 綜合評價：${overall} 分 ｜ 晨曦的領航員・自信之光`,
            title: '陽光破曉：自尊自重',
            insight: '在排擠與冷言冷語的風浪中，你的內心就像一座堅固的燈塔，始終堅守著自我價值。你深刻體會到：「照規定做事沒有錯，錯的是惡意欺負人的行為。」你沒有讓別人的不成熟言行貶低自己，展現了強韌的心理免疫力。',
            tip: '強大的自我肯定能保護你免於自責。記得，在展現堅定的同時，也允許身旁關心你的人分擔你的感受，讓愛你的師長與家人能與你並肩作戰。'
          };
        }
        // 3. 溫暖修復型 (同儕關係最突出且 >= 62)
        if (s.peer === maxVal && s.peer >= 62) {
          return {
            tier: '破曉',
            badge: `🏆 評估完成・陽光破曉 ｜ 綜合評價：${overall} 分 ｜ 晴朗的同行者・友善之橋`,
            title: '陽光破曉：重啟信任',
            insight: '受過傷的心靈往往容易築起高牆，但你卻展現了極其難得的柔軟與寬容。面對同學丙真誠的筆記與問候，你選擇放下戒備、重新建立連結。你學會了分清「個別同學的惡意」與「多數同儕的善意」，成功將陰霾轉化為溫暖的陽光。',
            tip: '願意再次相信朋友，是極具力量的選擇。維持這份溫暖，同時別忘了保留健康的個人界線，讓每段友誼都在彼此尊重中滋養成長。'
          };
        }
        // 1. 智慧求助型 (勇氣與安全感均高)
        if (s.courage >= 58 && s.safety >= 52) {
          return {
            tier: '破曉',
            badge: `🏆 評估完成・陽光破曉 ｜ 綜合評價：${overall} 分 ｜ 破曉的守護者・正義之盾`,
            title: '陽光破曉：智慧求助',
            insight: '你在面對惡意嘲弄與威脅時，展現了極為成熟的清醒與從容。你沒有落入情緒對抗的陷阱，而是果斷留下照片證據，並第一時間讓媽媽、導師與學務處介入。能把體制與信任大人化為自己的堅強防護網，這份「帶著智慧的勇敢」，是你一生中最寶貴的護身符。',
            tip: '你的冷靜示範了面對不公義時的最佳解方。未來在班級或生活中，當你看到其他人遭遇孤立時，請繼續發揮這股力量，成為那個願意伸出援手的主動守護者。'
          };
        }
        // 4. 沉著調節型 (放鬆度最突出)
        return {
          tier: '破曉',
          badge: `🏆 評估完成・陽光破曉 ｜ 綜合評價：${overall} 分 ｜ 平靜的行者・心靈綠洲`,
          title: '陽光破曉：身心安穩',
          insight: '面對風暴，你展現了令人驚豔的身心調節能力。無論是在輔導室還是家裡的沙發旁，你都能透過深呼吸穩住心跳，不讓焦慮與委屈在體內發酵。因為你深信背後有安穩的支持，所以能以最平穩的步伐走出困境。',
          tip: '維持內在的平靜是你最大的天賦。當身邊的人因為衝突而心慌意亂時，你的從容與定靜，將會是同儕群體中最安定的力量。'
        };
      }

      // 第二大類：曙光初現型 (整體狀態值 45 ~ 59 分・穩健調適)
      if (overall >= 45) {
        // 6. 孤勇前行型 (勇氣高，但同儕或安全感較低)
        if (s.courage >= 50 && (s.peer <= 40 || s.safety <= 40)) {
          return {
            tier: '曙光',
            badge: `🌱 評估完成・曙光初現 ｜ 綜合評價：${overall} 分 ｜ 破霧的先鋒・堅毅之劍`,
            title: '曙光初現：孤勇前行',
            insight: '你非常有骨氣與正義感，在面對霸凌時敢於表明立場、不畏懼威脅。然而，你習慣了一個人咬牙苦撐，對學校體制與同儕仍帶有一層防衛心，甚至有時會不自覺地把求助當成示弱。',
            tip: '真正的勇敢，不代表凡事都必須單打獨鬥。適時向值得信任的師長伸出手，不是認輸，而是聰明地借用體制力量來保護自己。'
          };
        }
        // 7. 渴望被愛型 (同儕較高，但自尊偏低)
        if (s.peer >= 45 && s.selfEsteem <= 35) {
          return {
            tier: '曙光',
            badge: `🌱 評估完成・曙光初現 ｜ 綜合評價：${overall} 分 ｜ 尋光的旅人・溫柔之星`,
            title: '曙光初現：溫柔尋光',
            insight: '你非常重視人際和諧，總希望班級氣氛能好起來，甚至寧可委屈自己也不想打破關係。但也正因如此，在遭遇排擠時，你最容易偷偷懷疑是不是自己不夠討人喜歡。',
            tip: '你的善良與體貼是優點，但不需要靠卑微討好來換取友誼。請深深記住：真正值得交往的朋友，會欣賞原本的你，而不是只喜歡百依百順的你。'
          };
        }
        // 8. 隱忍負重型 (壓力偏高 >= 55)
        if (s.stress >= 55) {
          return {
            tier: '曙光',
            badge: `🌱 評估完成・曙光初現 ｜ 綜合評價：${overall} 分 ｜ 負重的行者・堅韌之盾`,
            title: '曙光初現：卸下重擔',
            insight: '你是一個非常有責任感且堅強的孩子，即使心裡七上八下、緊繃難耐，依然一步一腳印地完成了所有求助流程。這份堅持非常了不起，但你的身體與心靈，其實已經默默承擔了太多重量。',
            tip: '事情已經告一段落，現在是你好好卸下防備的時候了。多給自己一點時間發呆、聽音樂，難受時別忘了再做幾次 4-6 深呼吸，好好跟辛苦的自己說聲謝謝。'
          };
        }
        // 9. 自我防衛型 (自尊尚可，但同儕封閉 <= 35)
        if (s.peer <= 35 && s.selfEsteem >= 40) {
          return {
            tier: '曙光',
            badge: `🌱 評估完成・曙光初現 ｜ 綜合評價：${overall} 分 ｜ 築心的高牆者・冷靜之石`,
            title: '曙光初現：守護心靈',
            insight: '在受到傷害之後，你迅速築起了一座保護自尊的心牆。你對同學抱持高度戒心，甚至在同學丙釋出善意時，你寧願選擇獨來獨往。這是一種本能的心理自我保護機制，沒有對錯。',
            tip: '受傷後保持距離完全是合情合理的。不用強迫自己立刻融入團體，給自己一個安全的情感緩衝區，等信任慢慢修復，再讓溫暖的光線透進心牆。'
          };
        }
        // 10. 依賴安心型 (安全感高，勇氣偏低)
        if (s.safety >= 50 && s.courage <= 40) {
          return {
            tier: '曙光',
            badge: `🌱 評估完成・曙光初現 ｜ 綜合評價：${overall} 分 ｜ 港灣的避風者・純真之羽`,
            title: '曙光初現：尋得港灣',
            insight: '你很幸運地擁有值得信賴的媽媽與輔導老師，你願意在遇到困難時投奔避風港。然而，在面對同儕第一線的衝突時，你往往容易慌亂退縮，不敢第一時間堅定表達自己的拒絕界線。',
            tip: '有了大人的支持作為後盾，下一次你可以試著更堅定地看著對方的眼睛說：「請你停止，我不喜歡這樣。」你會發現，自己的聲音其實很有力量。'
          };
        }
        // 11. 平衡中庸型 (預設曙光)
        return {
          tier: '曙光',
          badge: `🌱 評估完成・曙光初現 ｜ 綜合評價：${overall} 分 ｜ 踏光的前行者・踏實之印`,
          title: '曙光初現：邁向希望',
          insight: '面對校園中的突發風暴，你以非常平穩踏實的步調處理每一個難題。你既沒有衝動生事，也沒有完全退縮隱忍，而是在摸索中找到了讓自己漸漸安全的平衡點。',
          tip: '天邊的第一道曙光已經破雲而出。維持這份節奏，隨著時間與經驗累積，你會越來越清楚如何守護自己的權益與尊嚴。'
        };
      }

      // 第三大類：破曉微光型 (整體狀態值 < 45 分・深層接納)
      // 12. 自責壓抑型 (自尊最低且壓力大)
      if (s.selfEsteem === minVal && s.stress >= 50) {
        return {
          tier: '微光',
          badge: `🕯️ 評估完成・破曉微光 ｜ 綜合評價：${overall} 分 ｜ 風雨中的堅持者・微光星火`,
          title: '破曉微光：打破自責',
          insight: '這段經歷一定讓你感到無比痛苦與委屈。在遭遇嘲弄與孤立時，你的內心反覆懷疑是不是自己做錯了什麼。你承受了超乎常人的心理煎熬，卻依然咬著牙走到了最後。',
          tip: '請抬起頭，看著這句話：被排擠或霸凌，絕對不是你的錯！錯的是欺凌別人的行為。你不需要為了別人的惡意而懲罰自己，輔導老師與家人隨時準備好抱抱受傷的你。'
        };
      }
      // 14. 恐懼猶豫型 (勇氣最低且壓力大)
      if (s.courage === minVal && s.stress >= 50) {
        return {
          tier: '微光',
          badge: `🕯️ 評估完成・破曉微光 ｜ 綜合評價：${overall} 分 ｜ 黑暗中摸索的雛鳥・勇氣萌芽`,
          title: '破曉微光：萌生勇氣',
          insight: '面對同學的威脅，恐懼一度佔據了你整個心靈。你害怕把事情鬧大、害怕被報復，每一次選擇都讓你感到猶豫與顫抖。這種恐懼是人的本能，絲毫不用感到羞愧。',
          tip: '即使雙腳顫抖，你最終依然沒有放棄求助，並一路走到了校門口。這證明了你心底那份不向恐懼低頭的生命力。請給自己一個大大的掌聲，你比自己想像的更堅強。'
        };
      }
      // 13. 孤立無助型 (同儕或安全感最低)
      if (s.peer === minVal || s.safety === minVal) {
        return {
          tier: '微光',
          badge: `🕯️ 評估完成・破曉微光 ｜ 綜合評價：${overall} 分 ｜ 尋找港灣的迷途者・堅韌之苗`,
          title: '破曉微光：找尋依靠',
          insight: '在你的感受中，學校的走廊是冰冷的，似乎沒有人真正理解你的委屈，連找大人求助都讓你感到猶豫與不信任。這種「全世界只剩自己一人」的孤獨感，是最沉重的負擔。',
          tip: '請相信，世界比眼前的人際圈大得多。如果身邊找不到能說話的人，教育部 24 小時反霸凌專線 1953、安心專線 1925 永遠有專業的師長在傾聽你。你真的不必一個人扛。'
        };
      }
      // 15. 微光啟程型 (預設微光)
      return {
        tier: '微光',
        badge: `🕯️ 評估完成・破曉微光 ｜ 綜合評價：${overall} 分 ｜ 穿越長夜的破冰者・生命初曉`,
        title: '破曉微光：勇氣的起點',
        insight: '雖然天空還帶著寒意、天色依然昏暗，但最艱難的長夜已經被你跨越了。你用真實的腳步證明：只要不放棄向前走，任何人都能走出那段讓人窒息的陰霾。',
        tip: '天亮之前總是最冷的。今天這段冒險只是一次演練，在現實生活中，隨時撥打 1953 專線或告訴你最信賴的長輩，他們一定會陪你迎來真正的破曉日出。'
      };
    },

    // 預覽五維心靈成長雷達圖 (遊玩中隨時點擊 🏆 預覽，不卡死，可隨時返回遊戲)
    openRadarModal() {
      const s = GameState.stats;

      // 切換至結算/雷達圖面板並重設捲動位置至頂端
      this.switchScreen('ending');
      const screenEl = document.getElementById('screen-ending');
      if (screenEl) screenEl.scrollTop = 0;

      const isCompleted = GameState.quest.completedNodes.has('node9') || GameState.quest.step >= 10;
      const evalRes = isCompleted ? this.getDetailedEndingEvaluation(s) : null;

      const badgeEl = document.getElementById('ending-badge');
      if (badgeEl) {
        if (isCompleted && evalRes) {
          badgeEl.textContent = evalRes.badge;
        } else {
          badgeEl.textContent = `📊 五維心理狀態檢視（旅程進行中・Day ${GameState.day}）｜ 當前整體狀態值：${GameState.getOverallScore()} 分`;
        }
      }

      const titleEl = document.getElementById('ending-title');
      if (titleEl) {
        titleEl.textContent = isCompleted && evalRes ? evalRes.title : '心靈羅盤：五維成長檢視';
      }

      const storyEl = document.getElementById('ending-story');
      if (storyEl) {
        storyEl.textContent = ''; // 清空原有內容以原生 DOM 安全建構
        if (isCompleted && evalRes) {
          // 深度心靈解析主文
          const insightP = document.createElement('p');
          insightP.style.margin = '0 0 14px 0';
          insightP.style.lineHeight = '1.8';
          insightP.textContent = evalRes.insight;
          storyEl.appendChild(insightP);

          // 專屬心靈給力站小卡片 (高雅溫暖邊框，提升可讀性與深度)
          const tipBox = document.createElement('div');
          tipBox.style.padding = '12px 16px';
          tipBox.style.background = 'rgba(212, 155, 45, 0.08)';
          tipBox.style.borderLeft = '4px solid #d49b2d';
          tipBox.style.borderRadius = '8px';
          tipBox.style.fontSize = '14px';
          tipBox.style.lineHeight = '1.7';
          tipBox.style.color = '#5a3d0b';

          const tipTitle = document.createElement('strong');
          tipTitle.textContent = '💡 心靈給力站：';
          tipBox.appendChild(tipTitle);

          const tipText = document.createTextNode(evalRes.tip);
          tipBox.appendChild(tipText);

          storyEl.appendChild(tipBox);
        } else {
          const guideP = document.createElement('p');
          guideP.style.margin = '0 0 8px 0';
          guideP.style.lineHeight = '1.8';
          guideP.textContent = `當前主線進度：${GameState.quest.text}`;
          storyEl.appendChild(guideP);

          const backNotice = document.createElement('p');
          backNotice.style.margin = '0';
          backNotice.style.fontSize = '14px';
          backNotice.style.color = 'var(--text-sub)';
          backNotice.textContent = '你可以隨時點擊下方「返回遊戲繼續旅程」回到校園中操作！';
          storyEl.appendChild(backNotice);
        }
      }

      // 動態注入五維數值條到 #ending-stats-breakdown
      this.populateStatsBreakdown(s);

      // 繪製雙層五角形對比雷達圖 (初始淡色 vs 當前深色)
      this.drawRadarChart(s);

      // 渲染雷達圖下方 5 天橫向心靈日記時間軸
      this.populateMoodTimeline();

      // 雙重保證延遲渲染，確保 Canvas 在 CSS 顯現後必定繪出
      requestAnimationFrame(() => this.drawRadarChart(s));
      setTimeout(() => this.drawRadarChart(s), 60);
    },

    // 渲染結算畫面：雷達圖下方 5 天橫向時間軸 (第一天到第五天橫排，表情在下面橫排)
    populateMoodTimeline() {
      const container = document.getElementById('ending-mood-timeline');
      if (!container) return;
      container.textContent = '';

      const dayNames = ['第一天', '第二天', '第三天', '第四天', '第五天'];
      for (let day = 1; day <= 5; day++) {
        const mood = GameState.dailyMoods ? GameState.dailyMoods[day] : null;

        const col = document.createElement('div');
        col.className = 'timeline-day-col';

        // 1. 第一排：天數標籤 (第一天、第二天...)
        const label = document.createElement('div');
        label.className = 'timeline-day-label';
        label.textContent = dayNames[day - 1];
        col.appendChild(label);

        // 2. 第二排：表情去背圖
        const img = document.createElement('img');
        img.className = 'timeline-mood-img';
        if (mood && mood.img) {
          img.src = mood.img;
          img.alt = mood.name;
          img.title = `${dayNames[day - 1]}：${mood.name}`;
        } else {
          // 未到或未記錄時顯示半透明預設圖
          img.src = '圖片/表情/mood_confused.png';
          img.style.opacity = '0.25';
          img.style.filter = 'grayscale(100%)';
          img.alt = '待記錄';
          img.title = '尚未記錄此日心情';
        }
        col.appendChild(img);

        // 3. 第三排：表情名稱
        const name = document.createElement('div');
        name.className = 'timeline-mood-name';
        name.textContent = mood ? mood.name : '（待記錄）';
        if (!mood) {
          name.style.color = '#a6b4b8';
          name.style.fontSize = '12px';
        }
        col.appendChild(name);

        container.appendChild(col);
      }
    },

    // 每日放學轉場心情札記彈出視窗 (六宮格・上3下3・去背表情)
    showMoodCheckin(dayNumber, onComplete) {
      const modal = document.getElementById('modal-mood-checkin');
      if (!modal) {
        if (onComplete) onComplete();
        return;
      }

      const dayChinese = ['一', '二', '三', '四', '五'][dayNumber - 1] || dayNumber;
      const badgeEl = document.getElementById('mood-checkin-badge');
      if (badgeEl) {
        badgeEl.textContent = `第${dayChinese}天・心靈沉澱`;
      }

      const titleEl = document.getElementById('mood-checkin-title');
      if (titleEl) {
        titleEl.textContent = `🌱 第${dayChinese}天結束了・今天的心情是什麼呢？`;
      }

      modal.classList.add('active');

      const buttons = modal.querySelectorAll('.mood-btn');
      const handleSelect = (btn) => {
        const moodKey = btn.getAttribute('data-mood');
        const moodData = MoodDatabase[moodKey];
        if (moodData) {
          GameState.dailyMoods[dayNumber] = moodData;
          SoundFX.positive();
          this.showToast(`已記錄第${dayChinese}天心情：${moodData.name}`);
          this.updateQuestBanner();
          this.saveGame();
        }

        modal.classList.remove('active');
        // 清理監聽避免重複
        buttons.forEach(b => b.onclick = null);

        setTimeout(() => {
          if (onComplete) onComplete();
        }, 350);
      };

      buttons.forEach(btn => {
        btn.onclick = () => handleSelect(btn);
      });
    },

    // 大結局結算 (走出校門或完成全部劇情時觸發)
    evaluateEnding() {
      SoundFX.stopTelephoneRing();
      this.openRadarModal();
      SoundFX.positive();
    },

    // 填充五維心理成長數值清單 (顯示初始值與增長幅度)
    populateStatsBreakdown(s) {
      const breakdownEl = document.getElementById('ending-stats-breakdown');
      if (!breakdownEl) return;

      const statsList = [
        {
          name: '放鬆度（原壓力值，公式：100 - 壓力值）',
          val: 100 - s.stress,
          initial: 50,
          color: '#c0392b',
          desc: `💡 分數來源：由 100 - 當前壓力值（${s.stress}）計算得出，代表身心平復與走出陰霾的程度。`
        },
        { name: '同儕關係值', val: s.peer, initial: 30, color: '#8e44ad' },
        { name: '勇氣值', val: s.courage, initial: 40, color: '#e67e22' },
        { name: '安全感', val: s.safety, initial: 35, color: '#27ae60' },
        { name: '自我肯定', val: s.selfEsteem, initial: 30, color: '#2980b9' }
      ];

      breakdownEl.textContent = '';
      statsList.forEach(item => {
        const delta = item.val - item.initial;
        const deltaText = delta >= 0 ? `+${delta}` : `${delta}`;
        const deltaColor = delta >= 0 ? '#27ae60' : '#c0392b';
        const currentVal = Math.min(100, Math.max(0, item.val));

        const itemDiv = document.createElement('div');
        itemDiv.className = 'breakdown-item';
        itemDiv.style.marginBottom = '12px';

        const rowDiv = document.createElement('div');
        rowDiv.style.display = 'flex';
        rowDiv.style.justifyContent = 'space-between';
        rowDiv.style.marginBottom = '4px';
        rowDiv.style.fontWeight = '600';
        rowDiv.style.color = '#4a382e';
        rowDiv.style.fontSize = '13.5px';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;

        const valSpan = document.createElement('span');
        const strong = document.createElement('strong');
        strong.textContent = currentVal;
        const baseTxt = document.createTextNode(' / 100 ');
        const small = document.createElement('small');
        small.style.color = deltaColor;
        small.style.fontWeight = '700';
        small.style.marginLeft = '6px';
        small.textContent = `(${deltaText})`;

        valSpan.appendChild(strong);
        valSpan.appendChild(baseTxt);
        valSpan.appendChild(small);

        rowDiv.appendChild(nameSpan);
        rowDiv.appendChild(valSpan);

        const barBg = document.createElement('div');
        barBg.style.height = '10px';
        barBg.style.background = '#e8dfd2';
        barBg.style.borderRadius = '5px';
        barBg.style.overflow = 'hidden';

        const barFill = document.createElement('div');
        barFill.style.width = `${currentVal}%`;
        barFill.style.height = '100%';
        barFill.style.background = item.color;
        barFill.style.borderRadius = '5px';
        barFill.style.transition = 'width 0.8s ease';

        barBg.appendChild(barFill);

        itemDiv.appendChild(rowDiv);
        itemDiv.appendChild(barBg);

        if (item.desc) {
          const descDiv = document.createElement('div');
          descDiv.style.fontSize = '11.5px';
          descDiv.style.color = '#7a6452';
          descDiv.style.marginTop = '5px';
          descDiv.style.lineHeight = '1.45';
          descDiv.textContent = item.desc;
          itemDiv.appendChild(descDiv);
        }

        breakdownEl.appendChild(itemDiv);
      });
    },

    // 繪製五維心靈成長數值雷達圖 (正五角形雙層對比：初始淺色 vs 結束深色)
    drawRadarChart(stats) {
      const canvas = document.getElementById('ending-radar-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 中心與最大半徑
      const cx = w / 2;
      const cy = h / 2 + 10; // 稍微下移，留頂部給圖例
      const R = 96;

      // 五維數值規格（正五角形分佈，順時針：放鬆度、安全感、自我肯定、同儕關係值、勇氣值）
      const initialAxes = [
        { name: '放鬆度 (100-壓力值)', val: 50 },
        { name: '安全感', val: 35 },
        { name: '自我肯定', val: 30 },
        { name: '同儕關係值', val: 30 },
        { name: '勇氣值', val: 40 }
      ];

      const currentAxes = [
        { name: '放鬆度 (100-壓力值)', val: Math.min(100, Math.max(0, stats ? (100 - stats.stress) : 50)) },
        { name: '安全感', val: Math.min(100, Math.max(0, stats ? stats.safety : 35)) },
        { name: '自我肯定', val: Math.min(100, Math.max(0, stats ? stats.selfEsteem : 30)) },
        { name: '同儕關係值', val: Math.min(100, Math.max(0, stats ? stats.peer : 30)) },
        { name: '勇氣值', val: Math.min(100, Math.max(0, stats ? stats.courage : 40)) }
      ];

      const totalAxes = 5;
      const getAngle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / totalAxes;

      // --- A. 頂部圖例 (Legend) ---
      ctx.save();
      ctx.font = 'bold 12px "Microsoft JhengHei", "Noto Sans TC", sans-serif';

      // 1. 初始狀態圖例 (淺青藍色)
      ctx.fillStyle = 'rgba(120, 160, 200, 0.45)';
      ctx.fillRect(cx - 150, 14, 14, 10);
      ctx.strokeStyle = '#5a8cb8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 150, 14, 14, 10);
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('初始基準 (淺色)', cx - 130, 20);

      // 2. 蛻變後狀態圖例 (深金橘色)
      ctx.fillStyle = 'rgba(235, 140, 35, 0.65)';
      ctx.fillRect(cx + 25, 14, 14, 10);
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx + 25, 14, 14, 10);
      ctx.fillStyle = '#b45309';
      ctx.fillText('蛻變成長 (深色)', cx + 45, 20);
      ctx.restore();

      // --- B. 繪製 4 層同心正五角形格線網格 (25%, 50%, 75%, 100%) ---
      const levels = [0.25, 0.50, 0.75, 1.0];
      levels.forEach((lvl, idx) => {
        ctx.beginPath();
        for (let i = 0; i < totalAxes; i++) {
          const angle = getAngle(i);
          const x = cx + Math.cos(angle) * (R * lvl);
          const y = cy + Math.sin(angle) * (R * lvl);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const isOuter = (idx === levels.length - 1);
        ctx.strokeStyle = isOuter ? 'rgba(160, 120, 80, 0.75)' : 'rgba(215, 190, 160, 0.45)';
        ctx.lineWidth = isOuter ? 2.0 : 1.0;
        ctx.stroke();

        if (idx === 0) {
          ctx.fillStyle = 'rgba(253, 248, 240, 0.6)';
          ctx.fill();
        }
      });

      // --- C. 繪製 5 條軸線 ---
      for (let i = 0; i < totalAxes; i++) {
        const angle = getAngle(i);
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(195, 160, 125, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // --- D. 繪製軸向頂點標籤與當前數值 ---
      ctx.save();
      ctx.font = 'bold 12.5px "Microsoft JhengHei", "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#4a382e';
      for (let i = 0; i < totalAxes; i++) {
        const angle = getAngle(i);
        const labelDist = R + 22;
        const lx = cx + Math.cos(angle) * labelDist;
        const ly = cy + Math.sin(angle) * labelDist;

        if (i === 0) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
        } else if (i === 1) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
        } else if (i === 2) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
        } else if (i === 3) {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
        } else {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
        }

        ctx.fillText(`${currentAxes[i].name} ${currentAxes[i].val}`, lx, ly);
      }
      ctx.restore();

      // --- E. 繪製第一層：初始五維數值多邊形 (淺色淡藍層) ---
      ctx.save();
      ctx.beginPath();
      const initPoints = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = getAngle(i);
        const r = Math.max(8, R * (initialAxes[i].val / 100));
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        initPoints.push({ x: px, y: py });
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // 淡藍色半透明填充
      ctx.fillStyle = 'rgba(140, 185, 225, 0.35)';
      ctx.fill();

      // 淡藍色細實線邊框
      ctx.strokeStyle = '#5a8cb8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 初始多邊形端點小圓
      initPoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#5a8cb8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      ctx.restore();

      // --- F. 繪製第二層：當前/蛻變後五維數值多邊形 (深色飽和金橘層) ---
      ctx.save();
      ctx.beginPath();
      const currPoints = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = getAngle(i);
        const r = Math.max(8, R * (currentAxes[i].val / 100));
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        currPoints.push({ x: px, y: py });
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // 溫暖金色徑向漸層填充 (深色)
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
      gradient.addColorStop(0, 'rgba(245, 175, 45, 0.70)');
      gradient.addColorStop(1, 'rgba(220, 120, 25, 0.45)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // 深色加粗邊框
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 2.8;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // 深色多邊形雙層立體端點
      currPoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      });
      ctx.restore();
    },

    showToast(msg) {
      let toast = document.getElementById('game-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'game-toast';
        toast.style.cssText = `
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(45, 36, 28, 0.94);
          color: #fff;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 14px;
          letter-spacing: 0.5px;
          z-index: 150;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: opacity 0.4s ease;
        `;
        document.getElementById('game-wrapper').appendChild(toast);
      }
      toast.textContent = msg;
      toast.style.opacity = '1';
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
      }, 3500);
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    Game.init();
  });

})();
