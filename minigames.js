const Minigames = {
    // なぞりゲームの形（順番にローテーションする。ランダムにしない）
    _nazoriShapes: [
        // 三角形
        [{x:0.2,y:0.3},{x:0.8,y:0.3},{x:0.5,y:0.8}],
        // ひし形
        [{x:0.5,y:0.15},{x:0.85,y:0.5},{x:0.5,y:0.85},{x:0.15,y:0.5}],
        // 四角形
        [{x:0.2,y:0.2},{x:0.8,y:0.2},{x:0.8,y:0.8},{x:0.2,y:0.8}],
        // 星形
        [
            {x:0.5,y:0.1},{x:0.61,y:0.38},{x:0.91,y:0.4},{x:0.67,y:0.58},
            {x:0.76,y:0.88},{x:0.5,y:0.7},{x:0.24,y:0.88},{x:0.33,y:0.58},
            {x:0.09,y:0.4},{x:0.39,y:0.38}
        ]
    ],
    _nazoriIndex: 0,

    // れんだ・タイミングで使う記号（順番にローテーションする）
    _symbols: ['⭐', '💎', '🍀', '🎈', '🍭', '⚽'],
    _symbolIndex: 0,

    // 指定した個数ぶん、なるべく重ならない位置を抽選する
    placeNonOverlapping: function(count, itemSize, areaW, areaH, minGap) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            let pos = null;
            for (let attempt = 0; attempt < 40; attempt++) {
                const candidate = {
                    x: Math.random() * Math.max(0, areaW - itemSize),
                    y: Math.random() * Math.max(0, areaH - itemSize)
                };
                const ok = positions.every(p => {
                    const dx = p.x - candidate.x, dy = p.y - candidate.y;
                    return Math.sqrt(dx * dx + dy * dy) >= minGap;
                });
                pos = candidate;
                if (ok) break;
            }
            positions.push(pos);
        }
        return positions;
    },

    // === 連打ゲーム ===
    startRenda: function(difficulty, container, callback) {
        container.innerHTML = '';
        const timeLimit = difficulty === 'child' ? 10 : 2.5;
        const totalStars = 10;
        let tapped = 0;
        let timeLeft = timeLimit;
        const MARGIN = 28; // 画面端すぎる位置に出ないようにする安全マージン

        const infoDiv = document.createElement('div');
        infoDiv.style.position = 'absolute';
        infoDiv.style.top = '20px';
        infoDiv.style.width = '100%';
        infoDiv.style.textAlign = 'center';
        infoDiv.style.fontSize = '32px';
        infoDiv.style.fontWeight = 'bold';
        infoDiv.style.color = 'white';
        infoDiv.style.textShadow = '0 2px 4px black';
        infoDiv.innerHTML = `<span id="mg-time">のこり: ${timeLeft}</span> <br> <span id="mg-score">0 / 10</span>`;
        container.appendChild(infoDiv);

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        // 上下に十分なセーフティエリアを確保（案内テキスト・画面端との衝突防止）
        playArea.style.top = '110px';
        playArea.style.bottom = '60px';
        playArea.style.left = MARGIN + 'px';
        playArea.style.right = MARGIN + 'px';
        container.appendChild(playArea);

        // 記号は毎回ローテーション（見た目のバリエーション用）
        const symbol = Minigames._symbols[Minigames._symbolIndex % Minigames._symbols.length];
        Minigames._symbolIndex++;

        // 星（記号）をなるべく重ならない位置に配置
        const STAR_SIZE = 70;
        const positions = Minigames.placeNonOverlapping(
            totalStars, STAR_SIZE, playArea.clientWidth, playArea.clientHeight, STAR_SIZE * 1.1
        );

        for(let i=0; i<totalStars; i++) {
            const star = document.createElement('div');
            star.innerHTML = symbol;
            star.style.position = 'absolute';
            star.style.fontSize = '64px';
            star.style.left = positions[i].x + 'px';
            star.style.top = positions[i].y + 'px';
            star.style.transition = 'transform 0.1s';
            star.style.filter = 'drop-shadow(0 0 10px gold) drop-shadow(0 0 4px orange)';

            star.addEventListener('pointerdown', function() {
                if(star.style.display !== 'none') {
                    star.style.display = 'none';
                    tapped++;
                    document.getElementById('mg-score').innerText = tapped + ' / ' + totalStars;

                    if(tapped >= totalStars) {
                        endGame();
                    }
                }
            });
            playArea.appendChild(star);
        }

        let timer;
        function updateTime() {
            timeLeft--;
            const timeEl = document.getElementById('mg-time');
            if(timeEl) timeEl.innerText = 'のこり: ' + timeLeft;
            if(timeLeft <= 0) {
                endGame();
            }
        }
        timer = setInterval(updateTime, 1000);

        let ended = false;
        function endGame() {
            if(ended) return;
            ended = true;
            clearInterval(timer);
            const ratio = tapped / totalStars;
            setTimeout(() => callback(ratio), 500);
        }
    },

    // === なぞりゲーム ===
    startNazori: function(difficulty, container, callback) {
        container.innerHTML = '';
        const timeLimit = difficulty === 'child' ? 8 : 2.5;
        let timeLeft = timeLimit;

        const infoDiv = document.createElement('div');
        infoDiv.style.position = 'absolute';
        infoDiv.style.top = '20px';
        infoDiv.style.width = '100%';
        infoDiv.style.textAlign = 'center';
        infoDiv.style.fontSize = '32px';
        infoDiv.style.fontWeight = 'bold';
        infoDiv.style.color = 'white';
        infoDiv.style.textShadow = '0 2px 4px black';
        infoDiv.innerHTML = `<span id="mg-time-nz">のこり: ${timeLeft}</span>`;
        container.appendChild(infoDiv);

        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth * 0.9;
        canvas.height = container.clientHeight * 0.6;
        canvas.style.position = 'absolute';
        canvas.style.top = '100px';
        canvas.style.left = '50%';
        canvas.style.transform = 'translateX(-50%)';
        canvas.style.background = 'rgba(255,255,255,0.1)';
        canvas.style.borderRadius = '20px';
        canvas.style.touchAction = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // 形は順番にローテーション（ランダムにしない）
        const shape = Minigames._nazoriShapes[Minigames._nazoriIndex % Minigames._nazoriShapes.length];
        Minigames._nazoriIndex++;
        const path = shape.map(p => ({ x: canvas.width * p.x, y: canvas.height * p.y }));

        function drawBase() {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for(let i=1; i<path.length; i++) ctx.lineTo(path[i].x, path[i].y);
            ctx.closePath();
            ctx.lineWidth = 40;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        drawBase();

        let isDrawing = false;
        let points = [];

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        canvas.addEventListener('pointerdown', (e) => {
            isDrawing = true;
            points.push(getPos(e));
        });
        canvas.addEventListener('pointermove', (e) => {
            if(!isDrawing) return;
            const pos = getPos(e);
            points.push(pos);

            // 描画
            drawBase();
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for(let i=1; i<points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineWidth = 20;
            ctx.strokeStyle = '#4facfe';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.stroke();
        });
        canvas.addEventListener('pointerup', () => {
            isDrawing = false;
        });

        // 「できた！」ボタン：なぞり終わったらすぐ終了できる
        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-primary';
        doneBtn.innerText = 'できた！';
        doneBtn.style.position = 'absolute';
        doneBtn.style.left = '50%';
        doneBtn.style.bottom = '40px';
        doneBtn.style.transform = 'translateX(-50%)';
        doneBtn.style.padding = '14px 32px';
        doneBtn.style.fontSize = '20px';
        doneBtn.onclick = () => endGame();
        container.appendChild(doneBtn);

        let timer;
        function updateTime() {
            timeLeft--;
            const timeEl = document.getElementById('mg-time-nz');
            if(timeEl) timeEl.innerText = 'のこり: ' + timeLeft;
            if(timeLeft <= 0) {
                endGame();
            }
        }
        timer = setInterval(updateTime, 1000);

        let ended = false;
        function endGame() {
            if(ended) return;
            ended = true;
            clearInterval(timer);

            // 判定（簡易的に、描画点数で判定する。本来はパスとの距離計算）
            let ratio = points.length > 20 ? 1.0 : (points.length / 20);
            if(ratio > 1) ratio = 1;

            // フィードバックテキスト
            const fb = document.createElement('div');
            fb.style.position = 'absolute';
            fb.style.top = '50%';
            fb.style.left = '50%';
            fb.style.transform = 'translate(-50%, -50%)';
            fb.style.fontSize = '48px';
            fb.style.fontWeight = 'bold';
            fb.style.whiteSpace = 'nowrap';
            fb.style.color = ratio >= 0.7 ? 'var(--success)' : 'var(--danger)';
            fb.style.textShadow = '0 2px 10px #000';
            fb.innerText = ratio >= 0.7 ? 'すごい！' : 'もういっかい…';
            container.appendChild(fb);

            setTimeout(() => callback(ratio), 1000);
        }
    },

    // === タイミングゲーム ===
    startTiming: function(difficulty, container, callback) {
        container.innerHTML = '';

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
        const targetRadius = 100;
        // 最初から見える大きさから収縮を始める（見え始めるまで待たされないように）
        let currentRadius = Math.min(canvas.width, canvas.height) * 0.85;

        // 難易度による収縮スピード・判定幅・線の太さ
        const shrinkSpeed = difficulty === 'child' ? 2.5 : 11;
        const margin = difficulty === 'child' ? 70 : 12;
        const ringWidth = difficulty === 'child' ? 26 : 8;

        // 中央の記号は毎回ローテーション（見た目のバリエーション用）
        const symbol = Minigames._symbols[Minigames._symbolIndex % Minigames._symbols.length];
        Minigames._symbolIndex++;
        const symbolEl = document.createElement('div');
        symbolEl.innerText = symbol;
        symbolEl.style.position = 'absolute';
        symbolEl.style.left = cx + 'px';
        symbolEl.style.top = cy + 'px';
        symbolEl.style.transform = 'translate(-50%, -50%)';
        symbolEl.style.fontSize = (targetRadius * 0.9) + 'px';
        symbolEl.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.6))';
        container.appendChild(symbolEl);

        let req;
        function loop() {
            ctx.clearRect(0,0, canvas.width, canvas.height);

            // ターゲット円
            ctx.beginPath();
            ctx.arc(cx, cy, targetRadius, 0, Math.PI*2);
            ctx.lineWidth = ringWidth;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.stroke();

            // 収縮円
            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI*2);
            ctx.lineWidth = ringWidth;
            ctx.strokeStyle = '#4facfe';
            ctx.shadowColor = '#4facfe';
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;

            currentRadius -= shrinkSpeed;

            if(currentRadius < 10) {
                // 自動ミス
                endGame(0);
            } else {
                req = requestAnimationFrame(loop);
            }
        }
        req = requestAnimationFrame(loop);

        let ended = false;
        function endGame(ratio) {
            if(ended) return;
            ended = true;
            cancelAnimationFrame(req);

            const fb = document.createElement('div');
            fb.style.position = 'absolute';
            fb.style.top = '50%';
            fb.style.left = '50%';
            fb.style.transform = 'translate(-50%, -50%)';
            fb.style.fontSize = '48px';
            fb.style.fontWeight = 'bold';
            fb.style.whiteSpace = 'nowrap';
            fb.style.color = ratio >= 0.7 ? 'var(--success)' : 'var(--danger)';
            fb.style.textShadow = '0 2px 10px #000';
            fb.innerText = ratio >= 0.7 ? 'ぴったり！' : 'おしい！';
            container.appendChild(fb);
            symbolEl.remove();

            setTimeout(() => callback(ratio), 1000);
        }

        container.addEventListener('pointerdown', () => {
            if(ended) return;
            // 判定計算
            const diff = Math.abs(currentRadius - targetRadius);

            let ratio = 0;
            if(diff <= margin) {
                ratio = 1.0;
            } else if (diff <= margin * 2) {
                ratio = 0.5;
            } else {
                ratio = 0.2;
            }
            endGame(ratio);
        });
    }
};
