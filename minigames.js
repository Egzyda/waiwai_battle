const Minigames = {
    // === 連打ゲーム ===
    startRenda: function(difficulty, container, callback) {
        container.innerHTML = '';
        const timeLimit = difficulty === 'child' ? 10 : 5;
        const totalStars = 10;
        let tapped = 0;
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
        infoDiv.innerHTML = `<span id="mg-time">のこり: ${timeLeft}</span> <br> <span id="mg-score">0 / 10</span>`;
        container.appendChild(infoDiv);

        const playArea = document.createElement('div');
        playArea.style.position = 'absolute';
        playArea.style.top = '100px';
        playArea.style.bottom = '20px';
        playArea.style.left = '20px';
        playArea.style.right = '20px';
        container.appendChild(playArea);

        // 星を配置
        for(let i=0; i<totalStars; i++) {
            const star = document.createElement('div');
            star.innerHTML = '⭐';
            star.style.position = 'absolute';
            star.style.fontSize = '64px';
            star.style.left = Math.random() * (playArea.clientWidth - 70) + 'px';
            star.style.top = Math.random() * (playArea.clientHeight - 70) + 'px';
            star.style.transition = 'transform 0.1s';
            
            star.addEventListener('pointerdown', function() {
                if(star.style.display !== 'none') {
                    star.style.display = 'none';
                    tapped++;
                    document.getElementById('mg-score').innerText = tapped + ' / ' + totalStars;
                    
                    // エフェクト（簡易フラッシュ）
                    const flash = document.createElement('div');
                    flash.style.position = 'fixed';
                    flash.style.top = '0'; flash.style.left = '0';
                    flash.style.width = '100%'; flash.style.height = '100%';
                    flash.style.background = 'white';
                    flash.style.opacity = '0.5';
                    flash.style.zIndex = '9999';
                    document.body.appendChild(flash);
                    setTimeout(() => flash.remove(), 50);

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
        const timeLimit = difficulty === 'child' ? 8 : 5;
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
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.6;
        canvas.style.position = 'absolute';
        canvas.style.top = '100px';
        canvas.style.left = '50%';
        canvas.style.transform = 'translateX(-50%)';
        canvas.style.background = 'rgba(255,255,255,0.1)';
        canvas.style.borderRadius = '20px';
        canvas.style.touchAction = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        
        // 描画用の線
        const path = [
            {x: canvas.width*0.2, y: canvas.height*0.3},
            {x: canvas.width*0.8, y: canvas.height*0.3},
            {x: canvas.width*0.5, y: canvas.height*0.8}
        ]; // 簡単な三角形（ハートの代わり）

        function drawBase() {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            ctx.lineTo(path[1].x, path[1].y);
            ctx.lineTo(path[2].x, path[2].y);
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
            ctx.strokeStyle = 'var(--primary)';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.stroke();
        });
        canvas.addEventListener('pointerup', () => {
            isDrawing = false;
        });

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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const targetRadius = 100;
        let currentRadius = Math.max(canvas.width, canvas.height);
        
        // 難易度による収縮スピード
        const shrinkSpeed = difficulty === 'child' ? 3 : 6;
        
        let req;
        function loop() {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            
            // ターゲット円
            ctx.beginPath();
            ctx.arc(cx, cy, targetRadius, 0, Math.PI*2);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.stroke();

            // 収縮円
            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI*2);
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'var(--primary)';
            ctx.stroke();

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
            fb.style.color = ratio >= 0.7 ? 'var(--success)' : 'var(--danger)';
            fb.style.textShadow = '0 2px 10px #000';
            fb.innerText = ratio >= 0.7 ? 'ぴったり！' : 'おしい！';
            container.appendChild(fb);

            setTimeout(() => callback(ratio), 1000);
        }

        container.addEventListener('pointerdown', () => {
            if(ended) return;
            // 判定計算
            const diff = Math.abs(currentRadius - targetRadius);
            const margin = difficulty === 'child' ? 50 : 20;
            
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
