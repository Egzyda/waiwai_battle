// ==========================
// わいわいバトル - ミニゲーム
// 新しいミニゲームは Minigames.list に追加するだけでローテーションに入る
// ==========================

// ひらがな以外にはルビを振る
function mgWord(w) {
    return w.reading ? `<ruby>${w.label}<rt>${w.reading}</rt></ruby>` : w.label;
}
const MG_TAP = { label: 'タップ', reading: 'たっぷ' };

const Minigames = {
    // あつめる系で使う記号（順番にローテーション）
    _symbols: [
        { char: '⭐', label: 'ほし' },
        { char: '🍎', label: 'りんご' },
        { char: '🍀', label: 'よつば' },
        { char: '🌸', label: 'はな' },
        { char: '🍩', label: 'ドーナツ', reading: 'どーなつ' },
        { char: '⚽', label: 'ボール', reading: 'ぼーる' }
    ],
    _symbolIndex: 0,

    // なぞる形（順番にローテーション）
    _nazoriShapes: [
        { label: 'さんかく', points: [{x:0.5,y:0.15},{x:0.85,y:0.8},{x:0.15,y:0.8}] },
        { label: 'しかく', points: [{x:0.2,y:0.2},{x:0.8,y:0.2},{x:0.8,y:0.8},{x:0.2,y:0.8}] },
        { label: 'ひしがた', points: [{x:0.5,y:0.12},{x:0.85,y:0.5},{x:0.5,y:0.88},{x:0.15,y:0.5}] },
        { label: 'ほし', points: [
            {x:0.5,y:0.08},{x:0.62,y:0.38},{x:0.94,y:0.38},{x:0.68,y:0.58},
            {x:0.78,y:0.9},{x:0.5,y:0.7},{x:0.22,y:0.9},{x:0.32,y:0.58},
            {x:0.06,y:0.38},{x:0.38,y:0.38}
        ] },
        { label: 'いえ', points: [{x:0.5,y:0.1},{x:0.85,y:0.42},{x:0.85,y:0.85},{x:0.15,y:0.85},{x:0.15,y:0.42}] }
    ],
    _nazoriIndex: 0,

    // タイミングで使う形（リングそのものの形を変える）
    _timingShapes: [
        { label: 'まる', sides: 0 },
        { label: 'さんかく', sides: 3 },
        { label: 'しかく', sides: 4, rot: Math.PI / 4 },
        { label: 'ひしがた', sides: 4 },
        { label: 'ほし', sides: 5, star: true }
    ],
    _timingIndex: 0,

    // ひらがな学習で使う基本文字（清音のみ）
    _hiragana: ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ',
        'た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ',
        'ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','を','ん'],
    // 見た目が似ていて間違えやすい文字の組（おとなモードの意地悪な選択肢用）
    _confusable: {
        'ぬ':'め','め':'ぬ','わ':'ね','ね':'わ','れ':'わ','る':'ろ','ろ':'る',
        'さ':'ち','ち':'さ','は':'ほ','ほ':'は','き':'さ','り':'い','い':'り',
        'こ':'し','し':'こ','す':'む','む':'す','を':'お','お':'を','ま':'も','も':'ま'
    },
    _letterIndex: 0,

    // ことばづくりで使う単語（覚えやすいように絵文字つき）
    // 知育ねらいで2〜4文字までいろいろな長さをまぜてある
    _words: [
        // どうぶつ
        { word: 'いぬ', emoji: '🐶' },
        { word: 'ねこ', emoji: '🐱' },
        { word: 'とり', emoji: '🐦' },
        { word: 'うし', emoji: '🐮' },
        { word: 'うま', emoji: '🐴' },
        { word: 'ぶた', emoji: '🐷' },
        { word: 'くま', emoji: '🐻' },
        { word: 'とら', emoji: '🐯' },
        { word: 'さる', emoji: '🐵' },
        { word: 'ぞう', emoji: '🐘' },
        { word: 'かめ', emoji: '🐢' },
        { word: 'へび', emoji: '🐍' },
        { word: 'ひつじ', emoji: '🐑' },
        { word: 'ぱんだ', emoji: '🐼' },
        { word: 'きつね', emoji: '🦊' },
        { word: 'たぬき', emoji: '🦝' },
        { word: 'うさぎ', emoji: '🐰' },
        { word: 'らいおん', emoji: '🦁' },
        { word: 'ことり', emoji: '🐤' },
        { word: 'あひる', emoji: '🦆' },
        { word: 'ふくろう', emoji: '🦉' },
        { word: 'かえる', emoji: '🐸' },
        { word: 'ぺんぎん', emoji: '🐧' },
        { word: 'こあら', emoji: '🐨' },
        // すいちゅう
        { word: 'さかな', emoji: '🐟' },
        { word: 'たこ', emoji: '🐙' },
        { word: 'かに', emoji: '🦀' },
        { word: 'えび', emoji: '🦐' },
        { word: 'いか', emoji: '🦑' },
        { word: 'くじら', emoji: '🐳' },
        { word: 'いるか', emoji: '🐬' },
        // むし
        { word: 'あり', emoji: '🐜' },
        { word: 'はち', emoji: '🐝' },
        { word: 'ちょう', emoji: '🦋' },
        { word: 'せみ', emoji: '🦗' },
        { word: 'かたつむり', emoji: '🐌' },
        // たべもの
        { word: 'すいか', emoji: '🍉' },
        { word: 'りんご', emoji: '🍎' },
        { word: 'ばなな', emoji: '🍌' },
        { word: 'いちご', emoji: '🍓' },
        { word: 'ぶどう', emoji: '🍇' },
        { word: 'もも', emoji: '🍑' },
        { word: 'めろん', emoji: '🍈' },
        { word: 'れもん', emoji: '🍋' },
        { word: 'ぱん', emoji: '🍞' },
        { word: 'おにぎり', emoji: '🍙' },
        { word: 'らーめん', emoji: '🍜' },
        { word: 'けーき', emoji: '🍰' },
        { word: 'あめ', emoji: '🍬' },
        { word: 'ちょこ', emoji: '🍫' },
        { word: 'あいす', emoji: '🍦' },
        { word: 'たまご', emoji: '🥚' },
        { word: 'にんじん', emoji: '🥕' },
        { word: 'とまと', emoji: '🍅' },
        { word: 'おちゃ', emoji: '🍵' },
        { word: 'ぎゅうにゅう', emoji: '🥛' },
        // しぜん・てんき
        { word: 'つき', emoji: '🌙' },
        { word: 'ほし', emoji: '⭐' },
        { word: 'たいよう', emoji: '☀️' },
        { word: 'そら', emoji: '☁️' },
        { word: 'あめ', emoji: '☔' },
        { word: 'ゆき', emoji: '❄️' },
        { word: 'にじ', emoji: '🌈' },
        { word: 'かみなり', emoji: '⚡' },
        { word: 'やま', emoji: '⛰️' },
        { word: 'うみ', emoji: '🌊' },
        { word: 'かわ', emoji: '🏞️' },
        { word: 'き', emoji: '🌳' },
        { word: 'はな', emoji: '🌸' },
        { word: 'は', emoji: '🍃' },
        { word: 'みず', emoji: '💧' },
        { word: 'ひ', emoji: '🔥' },
        // みのまわり
        { word: 'くつ', emoji: '👞' },
        { word: 'かさ', emoji: '☂️' },
        { word: 'ふね', emoji: '🚢' },
        { word: 'くるま', emoji: '🚗' },
        { word: 'でんしゃ', emoji: '🚃' },
        { word: 'ひこうき', emoji: '✈️' },
        { word: 'じてんしゃ', emoji: '🚲' },
        { word: 'ばす', emoji: '🚌' },
        { word: 'ぼうし', emoji: '👒' },
        { word: 'ふく', emoji: '👕' },
        { word: 'かばん', emoji: '🎒' },
        { word: 'めがね', emoji: '👓' },
        { word: 'とけい', emoji: '⏰' },
        { word: 'ほん', emoji: '📖' },
        { word: 'えんぴつ', emoji: '✏️' },
        { word: 'はさみ', emoji: '✂️' },
        { word: 'いす', emoji: '🪑' },
        { word: 'つくえ', emoji: '💺' },
        { word: 'いえ', emoji: '🏠' },
        { word: 'かぎ', emoji: '🔑' },
        { word: 'でんわ', emoji: '☎️' },
        { word: 'ぼーる', emoji: '⚽' },
        { word: 'ふうせん', emoji: '🎈' },
        { word: 'つみき', emoji: '🧱' },
        { word: 'たいこ', emoji: '🥁' },
        { word: 'ぴあの', emoji: '🎹' },
        // からだ
        { word: 'め', emoji: '👀' },
        { word: 'みみ', emoji: '👂' },
        { word: 'はな', emoji: '👃' },
        { word: 'くち', emoji: '👄' },
        { word: 'て', emoji: '✋' },
        { word: 'あし', emoji: '🦶' },
        // かぞく
        { word: 'ぱぱ', emoji: '👨' },
        { word: 'まま', emoji: '👩' },
        { word: 'あかちゃん', emoji: '👶' },
        { word: 'おじいちゃん', emoji: '👴' },
        { word: 'おばあちゃん', emoji: '👵' },
        // いろ・かたち
        { word: 'あか', emoji: '🔴' },
        { word: 'あお', emoji: '🔵' },
        { word: 'きいろ', emoji: '🟡' },
        { word: 'みどり', emoji: '🟢' },
        { word: 'しろ', emoji: '⚪' },
        { word: 'くろ', emoji: '⚫' },
        { word: 'はーと', emoji: '❤️' }
    ],
    _wordIndex: 0,

    reset: function() {
        this._symbolIndex = 0;
        this._nazoriIndex = 0;
        this._timingIndex = 0;
        this._letterIndex = 0;
        this._wordIndex = 0;
    },

    nextSymbol: function() {
        return this._symbols[this._symbolIndex % this._symbols.length];
    },
    nextNazoriShape: function() {
        return this._nazoriShapes[this._nazoriIndex % this._nazoriShapes.length];
    },
    nextTimingShape: function() {
        return this._timingShapes[this._timingIndex % this._timingShapes.length];
    },
    nextLetter: function() {
        return this._hiragana[this._letterIndex % this._hiragana.length];
    },
    nextWord: function() {
        return this._words[this._wordIndex % this._words.length];
    },

    // ==========================
    // 共通ヘルパー
    // ==========================

    // グリッドに1個ずつ割り当てることで「絶対に重ならない」配置をつくる
    placeInGrid: function(count, itemSize, areaW, areaH) {
        const ratio = areaH > 0 ? (areaW / areaH) : 1;
        let cols = Math.max(1, Math.round(Math.sqrt(count * ratio)));
        let rows = Math.ceil(count / cols);
        while (cols * rows < count) rows++;

        const cellW = areaW / cols;
        const cellH = areaH / rows;

        // セルをシャッフルして、どのセルを使うかをばらけさせる
        const cells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) cells.push({ r, c });
        }
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        const positions = [];
        for (let i = 0; i < count; i++) {
            const cell = cells[i];
            const jitterX = Math.max(0, cellW - itemSize);
            const jitterY = Math.max(0, cellH - itemSize);
            positions.push({
                x: cell.c * cellW + Math.random() * jitterX,
                y: cell.r * cellH + Math.random() * jitterY
            });
        }
        return positions;
    },

    // 好きな文言・色で結果テキストを出す（ひっさつわざの成功表示などでも共用）
    showResultText: function(container, text, color) {
        const fb = document.createElement('div');
        fb.style.position = 'absolute';
        fb.style.top = '50%';
        fb.style.left = '50%';
        fb.style.transform = 'translate(-50%, -50%)';
        fb.style.fontSize = '46px';
        fb.style.fontWeight = '900';
        fb.style.whiteSpace = 'nowrap';
        fb.style.zIndex = '50';
        fb.style.color = color;
        fb.style.textShadow = '0 2px 10px #000';
        fb.innerText = text;
        container.appendChild(fb);
        return fb;
    },

    // 結果テキストを出して終わる
    showResult: function(container, ratio, goodText, badText) {
        const good = ratio >= 0.7;
        return this.showResultText(container, good ? goodText : badText, good ? 'var(--success)' : 'var(--danger)');
    },

    // のこり時間などの見出し
    makeInfo: function(container, html) {
        const info = document.createElement('div');
        info.style.position = 'absolute';
        info.style.top = '16px';
        info.style.left = '0';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.style.fontSize = '28px';
        info.style.fontWeight = '900';
        info.style.color = 'white';
        info.style.textShadow = '0 2px 4px black';
        info.style.lineHeight = '1.3';
        info.innerHTML = html;
        container.appendChild(info);
        return info;
    },

    // 秒読みタイマー（0.5秒単位で表示を更新する）
    startTimer: function(seconds, onTick, onEnd) {
        let left = seconds;
        const id = setInterval(() => {
            left -= 0.1;
            if (left < 0) left = 0;
            onTick(left);
            if (left <= 0) {
                clearInterval(id);
                onEnd();
            }
        }, 100);
        return () => clearInterval(id);
    },

    // 多角形／星形の頂点を返す（sides:0 は円）
    shapePoints: function(shape, cx, cy, r) {
        if (!shape.sides) return null;
        const n = shape.star ? shape.sides * 2 : shape.sides;
        const pts = [];
        for (let i = 0; i < n; i++) {
            const rr = (shape.star && i % 2 === 1) ? r * 0.48 : r;
            const a = -Math.PI / 2 + (i * 2 * Math.PI / n) + (shape.rot || 0);
            pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
        }
        return pts;
    },

    strokeShape: function(ctx, shape, cx, cy, r) {
        const pts = this.shapePoints(shape, cx, cy, r);
        ctx.beginPath();
        if (!pts) {
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
        } else {
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
        }
        ctx.lineJoin = 'round';
        ctx.stroke();
    },

    // ==========================
    // 1. あつめる（記号をタップ）
    // ==========================
    startCollect: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const timeLimit = isChild ? 10 : 3.5;
        const total = 10;
        let tapped = 0;

        const symbol = this._symbols[this._symbolIndex % this._symbols.length];
        this._symbolIndex++;

        const info = this.makeInfo(container,
            `<span id="mg-time">のこり: ${timeLimit.toFixed(1)}</span><br><span id="mg-score">0 / ${total}</span>`);

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        playArea.style.top = '110px';
        playArea.style.bottom = '60px';
        playArea.style.left = '28px';
        playArea.style.right = '28px';
        container.appendChild(playArea);

        const SIZE = 70;
        const positions = this.placeInGrid(total, SIZE, playArea.clientWidth, playArea.clientHeight);

        for (let i = 0; i < total; i++) {
            const el = document.createElement('div');
            el.innerHTML = symbol.char;
            el.style.position = 'absolute';
            el.style.fontSize = '60px';
            el.style.lineHeight = '1';
            el.style.left = positions[i].x + 'px';
            el.style.top = positions[i].y + 'px';
            el.style.filter = 'drop-shadow(0 0 10px gold) drop-shadow(0 0 4px orange)';
            el.addEventListener('pointerdown', () => {
                if (!el.isConnected) return;
                el.remove(); // 要素ごと消して、フィルター効果の残像が残らないようにする
                tapped++;
                const scoreEl = info.querySelector('#mg-score');
                if (scoreEl) scoreEl.innerText = tapped + ' / ' + total;
                if (tapped >= total) end();
            });
            playArea.appendChild(el);
        }

        const stop = this.startTimer(timeLimit, (left) => {
            const t = info.querySelector('#mg-time');
            if (t) t.innerText = 'のこり: ' + left.toFixed(1);
        }, () => end());

        let ended = false;
        const self = this;
        function end() {
            if (ended) return;
            ended = true;
            stop();
            playArea.remove(); // 残っている記号を結果表示の裏に残さない
            const ratio = tapped / total;
            self.showResult(container, ratio, 'すごい', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 2. なぞる（形をなぞる／実際の一致率で判定）
    // ==========================
    startNazori: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const timeLimit = isChild ? 10 : 3;
        // 判定の甘さ（線からどれだけ離れてよいか）
        const tolerance = isChild ? 42 : 16;

        const shape = this._nazoriShapes[this._nazoriIndex % this._nazoriShapes.length];
        this._nazoriIndex++;

        const info = this.makeInfo(container, `<span id="mg-time-nz">のこり: ${timeLimit.toFixed(1)}</span>`);

        const canvas = document.createElement('canvas');
        const cw = Math.min(container.clientWidth * 0.9, container.clientHeight * 0.62);
        canvas.width = cw;
        canvas.height = cw;
        canvas.style.position = 'absolute';
        canvas.style.top = '96px';
        canvas.style.left = '50%';
        canvas.style.transform = 'translateX(-50%)';
        canvas.style.background = 'rgba(255,255,255,0.08)';
        canvas.style.borderRadius = '20px';
        canvas.style.touchAction = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const path = shape.points.map(p => ({ x: canvas.width * p.x, y: canvas.height * p.y }));

        // 線上に等間隔のチェックポイントを敷き詰め、どれだけ通れたかで採点する
        const checkpoints = [];
        for (let i = 0; i < path.length; i++) {
            const a = path[i];
            const b = path[(i + 1) % path.length];
            const segLen = Math.hypot(b.x - a.x, b.y - a.y);
            const steps = Math.max(2, Math.round(segLen / 10));
            for (let s = 0; s < steps; s++) {
                const t = s / steps;
                checkpoints.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, hit: false });
            }
        }

        function coverage() {
            let hit = 0;
            for (const c of checkpoints) if (c.hit) hit++;
            return hit / checkpoints.length;
        }

        const strokes = []; // 実際になぞった線（見た目用。判定はcheckpointsで行う）

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // お手本の線
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
            ctx.closePath();
            ctx.lineWidth = tolerance * 1.4;
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.stroke();

            // 実際になぞった軌跡をそのまま描く
            ctx.lineWidth = 14;
            ctx.strokeStyle = '#4facfe';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 8;
            for (const stroke of strokes) {
                if (stroke.length < 2) continue;
                ctx.beginPath();
                ctx.moveTo(stroke[0].x, stroke[0].y);
                for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }
        draw();

        let drawing = false;
        let currentStroke = null;
        function pos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) * (canvas.width / rect.width),
                y: (e.clientY - rect.top) * (canvas.height / rect.height)
            };
        }
        function mark(p) {
            for (const c of checkpoints) {
                if (c.hit) continue;
                if (Math.hypot(c.x - p.x, c.y - p.y) <= tolerance) c.hit = true;
            }
            currentStroke.push(p);
            draw();
            // ぜんぶなぞれたら自動で終了
            if (coverage() >= 0.995) end();
        }

        canvas.addEventListener('pointerdown', (e) => {
            drawing = true;
            currentStroke = [];
            strokes.push(currentStroke);
            canvas.setPointerCapture(e.pointerId);
            mark(pos(e));
        });
        canvas.addEventListener('pointermove', (e) => { if (drawing) mark(pos(e)); });
        canvas.addEventListener('pointerup', () => { drawing = false; });
        canvas.addEventListener('pointercancel', () => { drawing = false; });

        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-primary mg-done-btn';
        doneBtn.innerText = 'できた';
        doneBtn.onclick = () => end();
        container.appendChild(doneBtn);

        const stop = this.startTimer(timeLimit, (left) => {
            const t = info.querySelector('#mg-time-nz');
            if (t) t.innerText = 'のこり: ' + left.toFixed(1);
        }, () => end());

        let ended = false;
        const self = this;
        function end() {
            if (ended) return;
            ended = true;
            stop();
            doneBtn.remove();
            const ratio = Math.min(1, coverage());
            self.showResult(container, ratio, 'すごい', 'もういっかい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 3. タイミング（形が重なったらタップ）
    // ==========================
    startTiming: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';

        const shape = this._timingShapes[this._timingIndex % this._timingShapes.length];
        this._timingIndex++;

        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const targetRadius = 95;
        let radius = Math.min(canvas.width, canvas.height) * 0.85;

        // こどもでも「ぴったり」は狙わないと出ないくらいの判定にする
        const speed = isChild ? 2.2 : 9;
        const perfect = isChild ? 26 : 9;
        const good = isChild ? 52 : 20;
        const ringWidth = isChild ? 16 : 8;

        let req;
        const self = this;
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = ringWidth;
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            self.strokeShape(ctx, shape, cx, cy, targetRadius);

            ctx.lineWidth = ringWidth;
            const near = Math.abs(radius - targetRadius) <= perfect;
            ctx.strokeStyle = near ? '#4ecdc4' : '#4facfe';
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = near ? 24 : 12;
            self.strokeShape(ctx, shape, cx, cy, radius);
            ctx.shadowBlur = 0;

            radius -= speed;
            if (radius < 8) end(0);
            else req = requestAnimationFrame(loop);
        }
        req = requestAnimationFrame(loop);

        function onTap() {
            if (ended) return;
            const diff = Math.abs(radius - targetRadius);
            if (diff <= perfect) end(1.0);
            else if (diff <= good) end(0.55);
            else end(0.15);
        }
        container.addEventListener('pointerdown', onTap);

        let ended = false;
        function end(ratio) {
            if (ended) return;
            ended = true;
            cancelAnimationFrame(req);
            container.removeEventListener('pointerdown', onTap);
            self.showResult(container, ratio, 'ぴったり', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 4. れんだ（まんなかのボタンを連打）
    // ==========================
    startRenda: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const timeLimit = isChild ? 5 : 4.5;
        // おとなモードは「激ムズ」ではあるが人間が実際に押しきれる速さにする
        // (以前は60回/4秒=毎秒15回で理論上到達不可能だった)
        const goal = isChild ? 18 : 34;
        let taps = 0;

        const info = this.makeInfo(container,
            `<span id="mg-time-rd">のこり: ${timeLimit.toFixed(1)}</span><br><span id="mg-score-rd">0 / ${goal}</span>`);

        const btn = document.createElement('div');
        btn.className = 'mg-renda-btn';
        btn.innerText = 'れんだ';
        container.appendChild(btn);

        btn.addEventListener('pointerdown', () => {
            if (ended) return;
            taps++;
            const s = info.querySelector('#mg-score-rd');
            if (s) s.innerText = Math.min(taps, goal) + ' / ' + goal;
            btn.classList.remove('pop');
            void btn.offsetWidth;
            btn.classList.add('pop');

            // 押すたびに広がるリングを出して、押せたことを分かりやすくする
            const ring = document.createElement('div');
            ring.className = 'mg-renda-ring';
            container.appendChild(ring);
            setTimeout(() => ring.remove(), 400);

            if (taps >= goal) end();
        });

        const stop = this.startTimer(timeLimit, (left) => {
            const t = info.querySelector('#mg-time-rd');
            if (t) t.innerText = 'のこり: ' + left.toFixed(1);
        }, () => end());

        let ended = false;
        const self = this;
        function end() {
            if (ended) return;
            ended = true;
            stop();
            btn.remove();
            const ratio = Math.min(1, taps / goal);
            self.showResult(container, ratio, 'すごい', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 5. きりさく（スワイプで切る）
    // ==========================
    startSlash: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const timeLimit = isChild ? 6 : 2.5;
        const total = 6;
        const hitRadius = isChild ? 52 : 26;
        let slashed = 0;

        const info = this.makeInfo(container,
            `<span id="mg-time-sl">のこり: ${timeLimit.toFixed(1)}</span><br><span id="mg-score-sl">0 / ${total}</span>`);

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        playArea.style.top = '110px';
        playArea.style.bottom = '60px';
        playArea.style.left = '28px';
        playArea.style.right = '28px';
        playArea.style.touchAction = 'none';
        container.appendChild(playArea);

        const SIZE = 74;
        const positions = this.placeInGrid(total, SIZE, playArea.clientWidth, playArea.clientHeight);
        const targets = [];
        for (let i = 0; i < total; i++) {
            const el = document.createElement('div');
            el.className = 'mg-slash-target';
            el.style.left = positions[i].x + 'px';
            el.style.top = positions[i].y + 'px';
            const angle = Math.floor(Math.random() * 4) * 45;
            el.innerHTML = `<span class="mg-arrow-glyph" style="transform:rotate(${angle}deg)">➤</span>`;
            playArea.appendChild(el);
            targets.push({ el, done: false, angle });
        }

        // 矢印の向きに沿ってスワイプした時だけ判定する（軸は両方向OK）
        function angle180(a) { a = ((a % 180) + 180) % 180; return a; }
        function checkAt(clientX, clientY, moveAngleDeg) {
            for (const t of targets) {
                if (t.done) continue;
                const r = t.el.getBoundingClientRect();
                const dx = (r.left + r.width / 2) - clientX;
                const dy = (r.top + r.height / 2) - clientY;
                if (Math.hypot(dx, dy) > hitRadius) continue;
                let diff = Math.abs(angle180(moveAngleDeg) - angle180(t.angle));
                if (diff > 90) diff = 180 - diff;
                if (diff > ANGLE_TOLERANCE) continue;
                t.done = true;
                t.el.classList.add('slashed');
                slashed++;
                const s = info.querySelector('#mg-score-sl');
                if (s) s.innerText = slashed + ' / ' + total;
                if (slashed >= total) end();
            }
        }

        // タップだけでクリアできないよう、実際に指を動かした距離が
        // 一定を超えてから初めて判定を始める
        const SWIPE_THRESHOLD = 24;
        const ANGLE_TOLERANCE = 28; // 矢印の向きからのずれの許容度(度)
        let swiping = false;
        let lastX = 0, lastY = 0, swipedDist = 0;
        playArea.addEventListener('pointerdown', (e) => {
            swiping = true;
            swipedDist = 0;
            lastX = e.clientX;
            lastY = e.clientY;
            playArea.setPointerCapture(e.pointerId);
        });
        playArea.addEventListener('pointermove', (e) => {
            if (!swiping) return;
            const moveDx = e.clientX - lastX;
            const moveDy = e.clientY - lastY;
            swipedDist += Math.hypot(moveDx, moveDy);
            lastX = e.clientX;
            lastY = e.clientY;
            if (swipedDist >= SWIPE_THRESHOLD && (moveDx !== 0 || moveDy !== 0)) {
                const moveAngle = Math.atan2(moveDy, moveDx) * 180 / Math.PI;
                checkAt(e.clientX, e.clientY, moveAngle);
            }
        });
        playArea.addEventListener('pointerup', () => { swiping = false; });
        playArea.addEventListener('pointercancel', () => { swiping = false; });

        const stop = this.startTimer(timeLimit, (left) => {
            const t = info.querySelector('#mg-time-sl');
            if (t) t.innerText = 'のこり: ' + left.toFixed(1);
        }, () => end());

        let ended = false;
        const self = this;
        function end() {
            if (ended) return;
            ended = true;
            stop();
            playArea.remove(); // 残っている的を結果表示の裏に残さない
            const ratio = slashed / total;
            self.showResult(container, ratio, 'すごい', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 6. もぐらたたき（出てきたらタップ）
    // ==========================
    startMogura: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const total = isChild ? 8 : 14;
        const upTime = isChild ? 1250 : 380;
        let spawned = 0;
        let hits = 0;

        const info = this.makeInfo(container, `<span id="mg-score-mg">0 / ${total}</span>`);

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        playArea.style.top = '100px';
        playArea.style.bottom = '50px';
        playArea.style.left = '24px';
        playArea.style.right = '24px';
        playArea.style.display = 'grid';
        playArea.style.gridTemplateColumns = 'repeat(3, 1fr)';
        playArea.style.gridAutoRows = 'auto';
        playArea.style.alignContent = 'center';
        playArea.style.gap = '14px';
        container.appendChild(playArea);

        const holes = [];
        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.className = 'mg-hole';
            const mole = document.createElement('div');
            mole.className = 'mg-mole';
            mole.innerText = '🐹';
            hole.appendChild(mole);
            playArea.appendChild(hole);
            holes.push({ hole, mole, up: false });
        }

        holes.forEach(h => {
            h.mole.addEventListener('pointerdown', () => {
                if (!h.up || ended) return;
                h.up = false;
                h.mole.classList.remove('up');
                hits++;
                const s = info.querySelector('#mg-score-mg');
                if (s) s.innerText = hits + ' / ' + total;

                // もぐら自身のtransformとぶつからないよう、当たり演出は
                // 別要素で出して確実に消す（残像防止）
                const holeRect = h.hole.getBoundingClientRect();
                const areaRect = playArea.getBoundingClientRect();
                const burst = document.createElement('div');
                burst.className = 'mg-hit-burst';
                burst.innerText = '💥';
                burst.style.left = (holeRect.left - areaRect.left + holeRect.width / 2) + 'px';
                burst.style.top = (holeRect.top - areaRect.top + holeRect.height / 2) + 'px';
                playArea.appendChild(burst);
                setTimeout(() => burst.remove(), 300);
            });
        });

        let ended = false;
        let timeoutId = null;
        const self = this;

        function spawn() {
            if (ended) return;
            if (spawned >= total) { setTimeout(() => end(), upTime); return; }
            spawned++;
            const free = holes.filter(h => !h.up);
            const h = free[Math.floor(Math.random() * free.length)];
            h.up = true;
            h.mole.classList.add('up');
            timeoutId = setTimeout(() => {
                if (h.up) { h.up = false; h.mole.classList.remove('up'); }
                spawn();
            }, upTime);
        }
        spawn();
        function end() {
            if (ended) return;
            ended = true;
            if (timeoutId) clearTimeout(timeoutId);
            playArea.remove(); // アニメーション中のもぐら・エフェクトを結果表示の裏に残さない
            const ratio = hits / total;
            self.showResult(container, ratio, 'すごい', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 7. もじさがし（ひらがなを覚える）
    // ==========================
    startLetterFind: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const timeLimit = isChild ? 12 : 6;
        const total = isChild ? 9 : 12;
        const matchCount = isChild ? 3 : 2;

        const target = this._hiragana[this._letterIndex % this._hiragana.length];
        this._letterIndex++;
        let found = 0;

        const info = this.makeInfo(container,
            `<span style="font-size:0.6em;">この もじを さがそう</span><br>` +
            `<span style="font-size:1.7em;">${target}</span>`);
        info.style.top = '10px';

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        playArea.style.top = '150px';
        playArea.style.bottom = '60px';
        playArea.style.left = '28px';
        playArea.style.right = '28px';
        container.appendChild(playArea);

        // 残りの文字候補を作る（おとなモードは似た形の文字を混ぜて意地悪にする）
        const others = this._hiragana.filter(c => c !== target);
        let pool = [];
        if (!isChild && this._confusable[target]) pool.push(this._confusable[target]);
        while (pool.length < total - matchCount) {
            const c = others[Math.floor(Math.random() * others.length)];
            pool.push(c);
        }
        const letters = [target];
        for (let i = 1; i < matchCount; i++) letters.push(target);
        letters.push(...pool.slice(0, total - matchCount));
        // シャッフル
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }

        const SIZE = 62;
        const positions = this.placeInGrid(letters.length, SIZE, playArea.clientWidth, playArea.clientHeight);
        letters.forEach((ch, i) => {
            const el = document.createElement('div');
            el.className = 'mg-letter-tile';
            el.innerText = ch;
            el.style.left = positions[i].x + 'px';
            el.style.top = positions[i].y + 'px';
            el.addEventListener('pointerdown', () => {
                if (!el.isConnected || ended) return;
                if (ch === target) {
                    el.remove();
                    found++;
                    if (found >= matchCount) end();
                } else {
                    el.classList.add('wrong');
                    setTimeout(() => el.classList.remove('wrong'), 250);
                }
            });
            playArea.appendChild(el);
        });

        const stop = this.startTimer(timeLimit, () => {}, () => end());

        let ended = false;
        const self = this;
        function end() {
            if (ended) return;
            ended = true;
            stop();
            playArea.remove();
            const ratio = Math.min(1, found / matchCount);
            self.showResult(container, ratio, 'せいかい', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    },

    // ==========================
    // 8. ことばづくり（かんたんな単語を覚える）
    // ==========================
    startWordBuild: function(difficulty, container, callback) {
        container.innerHTML = '';
        const isChild = difficulty === 'child';
        const timeLimit = isChild ? 16 : 10;
        const distractorCount = isChild ? 5 : 7;

        const entry = this._words[this._wordIndex % this._words.length];
        this._wordIndex++;
        const wordChars = entry.word.split('');
        let filled = 0;

        const info = this.makeInfo(container,
            `<span style="font-size:2em;">${entry.emoji}</span><br>` +
            `<span id="mg-word-blanks" style="font-size:1.3em; letter-spacing:6px;">${'＿'.repeat(wordChars.length)}</span>`);
        info.style.top = '20px';

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        playArea.style.top = '150px';
        playArea.style.bottom = '60px';
        playArea.style.left = '28px';
        playArea.style.right = '28px';
        container.appendChild(playArea);

        // 文字タイル：正解の文字(順番はシャッフル)＋おじゃまの文字
        const tiles = wordChars.map(c => ({ ch: c, isCorrectSlot: true }));
        const others = this._hiragana.filter(c => !wordChars.includes(c));
        for (let i = 0; i < distractorCount; i++) {
            tiles.push({ ch: others[Math.floor(Math.random() * others.length)], isCorrectSlot: false });
        }
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        const SIZE = 64;
        const positions = this.placeInGrid(tiles.length, SIZE, playArea.clientWidth, playArea.clientHeight);
        let expectedIndex = 0;

        function updateBlanks() {
            const shown = wordChars.map((c, i) => i < filled ? c : '＿').join('');
            const el = document.getElementById('mg-word-blanks');
            if (el) el.innerText = shown;
        }

        tiles.forEach((tile, i) => {
            const el = document.createElement('div');
            el.className = 'mg-letter-tile';
            el.innerText = tile.ch;
            el.style.left = positions[i].x + 'px';
            el.style.top = positions[i].y + 'px';
            el.addEventListener('pointerdown', () => {
                if (!el.isConnected || ended) return;
                if (tile.ch === wordChars[expectedIndex]) {
                    el.remove();
                    filled++;
                    expectedIndex++;
                    updateBlanks();
                    if (filled >= wordChars.length) end();
                } else {
                    el.classList.add('wrong');
                    setTimeout(() => el.classList.remove('wrong'), 250);
                }
            });
            playArea.appendChild(el);
        });

        const stop = this.startTimer(timeLimit, () => {}, () => end());

        let ended = false;
        const self = this;
        function end() {
            if (ended) return;
            ended = true;
            stop();
            playArea.remove();
            const ratio = Math.min(1, filled / wordChars.length);
            self.showResult(container, ratio, 'せいかい', 'おしい');
            setTimeout(() => callback(ratio), 1400);
        }
    }
};

// ローテーションされるミニゲーム一覧（ここに足すだけで自動で組み込まれる）
Minigames.list = [
    {
        id: 'collect',
        getTitle: () => `${mgWord(Minigames.nextSymbol())}をあつめよう`,
        start: (d, c, cb) => Minigames.startCollect(d, c, cb)
    },
    {
        id: 'nazori',
        getTitle: () => `${Minigames.nextNazoriShape().label}をなぞってみよう`,
        start: (d, c, cb) => Minigames.startNazori(d, c, cb)
    },
    {
        id: 'timing',
        getTitle: () => `${Minigames.nextTimingShape().label}がかさなったら${mgWord(MG_TAP)}`,
        start: (d, c, cb) => Minigames.startTiming(d, c, cb)
    },
    {
        id: 'renda',
        getTitle: () => 'まんなかを れんだしよう',
        start: (d, c, cb) => Minigames.startRenda(d, c, cb)
    },
    {
        id: 'slash',
        getTitle: () => 'ゆびで なぞって きりさこう',
        start: (d, c, cb) => Minigames.startSlash(d, c, cb)
    },
    {
        id: 'mogura',
        getTitle: () => `🐹 が でてきたら ${mgWord(MG_TAP)}`,
        start: (d, c, cb) => Minigames.startMogura(d, c, cb)
    },
    {
        id: 'letter_find',
        getTitle: () => `「${Minigames.nextLetter()}」の もじを さがそう`,
        start: (d, c, cb) => Minigames.startLetterFind(d, c, cb)
    },
    {
        id: 'word_build',
        getTitle: () => `${Minigames.nextWord().emoji} の ことばを つくろう`,
        start: (d, c, cb) => Minigames.startWordBuild(d, c, cb)
    }
];

// ==========================
// ひっさつわざ用ミニゲーム
// callback には 0〜1 の成功度を渡す
// ==========================
const HissatsuGames = {
    // 1〜10を順番に押す
    startNumbers: function(difficulty, playArea, setTitle, callback) {
        setTitle('じゅんばんに おして');
        const total = 10;
        const SIZE = 76;
        let expected = 1;
        let success = 0;

        const positions = Minigames.placeInGrid(total, SIZE, playArea.clientWidth, playArea.clientHeight);
        for (let i = 1; i <= total; i++) {
            const btn = document.createElement('div');
            btn.className = 'hs-number';
            btn.innerText = i;
            btn.style.left = positions[i - 1].x + 'px';
            btn.style.top = positions[i - 1].y + 'px';
            btn.addEventListener('pointerdown', () => {
                if (ended) return;
                if (i === expected) {
                    btn.classList.add('ok');
                    setTimeout(() => { btn.style.visibility = 'hidden'; }, 120);
                    expected++;
                    success++;
                    if (success === total) end();
                } else {
                    btn.classList.add('ng');
                    setTimeout(() => end(), 300);
                }
            });
            playArea.appendChild(btn);
        }

        let ended = false;
        function end() {
            if (ended) return;
            ended = true;
            callback(success / total);
        }
    },

    // 次々に光るまとを叩く
    startRush: function(difficulty, playArea, setTitle, callback) {
        setTitle('よーい…');
        const total = difficulty === 'child' ? 10 : 16;
        const upTime = difficulty === 'child' ? 900 : 330;
        const SIZE = 80;
        let spawned = 0;
        let hits = 0;

        const slots = [];
        const positions = Minigames.placeInGrid(9, SIZE, playArea.clientWidth, playArea.clientHeight);
        for (let i = 0; i < 9; i++) {
            const el = document.createElement('div');
            el.className = 'hs-rush';
            el.style.left = positions[i].x + 'px';
            el.style.top = positions[i].y + 'px';
            el.addEventListener('pointerdown', () => {
                if (ended || !slot.on) return;
                slot.on = false;
                el.classList.remove('on');
                hits++;
            });
            playArea.appendChild(el);
            const slot = { el, on: false };
            slots.push(slot);
        }

        let ended = false;
        let timeoutId = null;

        function spawn() {
            if (ended) return;
            if (spawned >= total) { setTimeout(() => end(), upTime); return; }
            spawned++;
            const free = slots.filter(s => !s.on);
            const s = free[Math.floor(Math.random() * free.length)];
            s.on = true;
            s.el.classList.add('on');
            timeoutId = setTimeout(() => {
                if (s.on) { s.on = false; s.el.classList.remove('on'); }
                spawn();
            }, upTime);
        }
        // いきなり始まらないよう、少し準備時間を置いてからスタートする
        timeoutId = setTimeout(() => {
            setTitle('ひかったら すぐ おして');
            spawn();
        }, 1000);

        function end() {
            if (ended) return;
            ended = true;
            if (timeoutId) clearTimeout(timeoutId);
            callback(hits / total);
        }
    },

    // ゆびでなぞって一気に切る
    startCombo: function(difficulty, playArea, setTitle, callback) {
        setTitle('ゆびで なぞって きりさこう');
        const total = 10;
        const SIZE = 74;
        const hitRadius = difficulty === 'child' ? 54 : 28;
        const timeLimit = difficulty === 'child' ? 5000 : 3000;
        let slashed = 0;

        playArea.style.touchAction = 'none';
        const positions = Minigames.placeInGrid(total, SIZE, playArea.clientWidth, playArea.clientHeight);
        const targets = [];
        for (let i = 0; i < total; i++) {
            const el = document.createElement('div');
            el.className = 'hs-combo';
            el.style.left = positions[i].x + 'px';
            el.style.top = positions[i].y + 'px';
            const angle = Math.floor(Math.random() * 4) * 45;
            el.innerHTML = `<span class="mg-arrow-glyph" style="transform:rotate(${angle}deg)">➤</span>`;
            playArea.appendChild(el);
            targets.push({ el, done: false, angle });
        }

        // 矢印の向きに沿ってスワイプした時だけ判定する（軸は両方向OK）
        function angle180(a) { a = ((a % 180) + 180) % 180; return a; }
        function checkAt(x, y, moveAngleDeg) {
            for (const t of targets) {
                if (t.done) continue;
                const r = t.el.getBoundingClientRect();
                if (Math.hypot((r.left + r.width / 2) - x, (r.top + r.height / 2) - y) > hitRadius) continue;
                let diff = Math.abs(angle180(moveAngleDeg) - angle180(t.angle));
                if (diff > 90) diff = 180 - diff;
                if (diff > ANGLE_TOLERANCE) continue;
                t.done = true;
                t.el.classList.add('slashed');
                slashed++;
                if (slashed >= total) end();
            }
        }

        // タップだけでクリアできないよう、実際に指を動かした距離が
        // 一定を超えてから初めて判定を始める
        const SWIPE_THRESHOLD = 24;
        const ANGLE_TOLERANCE = 28; // 矢印の向きからのずれの許容度(度)
        let swiping = false;
        let lastX = 0, lastY = 0, swipedDist = 0;
        playArea.addEventListener('pointerdown', (e) => {
            swiping = true;
            swipedDist = 0;
            lastX = e.clientX;
            lastY = e.clientY;
            playArea.setPointerCapture(e.pointerId);
        });
        playArea.addEventListener('pointermove', (e) => {
            if (!swiping) return;
            const moveDx = e.clientX - lastX;
            const moveDy = e.clientY - lastY;
            swipedDist += Math.hypot(moveDx, moveDy);
            lastX = e.clientX;
            lastY = e.clientY;
            if (swipedDist >= SWIPE_THRESHOLD && (moveDx !== 0 || moveDy !== 0)) {
                const moveAngle = Math.atan2(moveDy, moveDx) * 180 / Math.PI;
                checkAt(e.clientX, e.clientY, moveAngle);
            }
        });
        playArea.addEventListener('pointerup', () => { swiping = false; });

        const timerId = setTimeout(() => end(), timeLimit);

        let ended = false;
        function end() {
            if (ended) return;
            ended = true;
            clearTimeout(timerId);
            callback(slashed / total);
        }
    }
};

HissatsuGames.list = [
    { id: 'numbers', getTitle: () => '1から10まで じゅんばんに おそう', start: HissatsuGames.startNumbers },
    { id: 'rush', getTitle: () => 'ひかったら すぐ おそう', start: HissatsuGames.startRush },
    { id: 'combo', getTitle: () => 'ゆびで なぞって きりさこう', start: HissatsuGames.startCombo }
];
