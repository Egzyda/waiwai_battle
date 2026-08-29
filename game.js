// ==========================
// わいわいバトル - メインロジック
// ==========================

const GameState = {
    difficulty: 'child', // 'child' or 'adult'
    party: [], // Selected characters
    currentNode: 0,
    currentEnemy: null,
    hissatsuGauge: 0,
    turnIndex: 0, // 0, 1, 2 for party members
    inBattle: false,
    minigameIndex: 0, // ミニゲームの種類をターンごとに順番に回すためのカウンタ
    hissatsuIndex: 0, // ひっさつわざミニゲームのローテーション用カウンタ
    acceptingCommand: false // 味方のコマンド受付中だけ true
};

// UI Helpers
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showModal(text, buttons = [{ text: 'OK', onClick: () => closeModal() }]) {
    const modal = document.getElementById('modal-overlay');
    const modalText = document.getElementById('modal-text');
    const modalBtnContainer = document.getElementById('modal-buttons');
    
    modalText.innerHTML = text;
    modalBtnContainer.innerHTML = '';
    
    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.innerHTML = b.text;
        btn.onclick = () => {
            if(b.onClick) b.onClick();
            // ページ遷移(リロード)する場合、先にモーダルを閉じると
            // 一瞬うしろの画面が見えてしまうので閉じない
            if(!b.keepOpen) closeModal();
        };
        modalBtnContainer.appendChild(btn);
    });
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// おとなモードに切り替える前に計算問題を出す（子どもが誤って切り替えられないように）
function askMathChallenge(onCorrect) {
    const a = Math.floor(Math.random() * 8) + 2; // 2〜9
    const b = Math.floor(Math.random() * 8) + 2;
    const answer = a * b;

    const modal = document.getElementById('modal-overlay');
    const modalText = document.getElementById('modal-text');
    const modalBtnContainer = document.getElementById('modal-buttons');

    modalText.innerHTML = `おとな<ruby>モード<rt>もーど</rt></ruby>に する けいさん<br>${a} × ${b} = ?`;
    modalBtnContainer.innerHTML = '';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'math-input';
    input.inputMode = 'numeric';

    const okBtn = document.createElement('button');
    okBtn.className = 'btn-primary';
    okBtn.innerText = 'けってい';
    okBtn.onclick = () => {
        closeModal();
        if(parseInt(input.value, 10) === answer) {
            onCorrect();
        } else {
            showToast('ざんねん、こたえが ちがうよ');
        }
    };

    modalBtnContainer.appendChild(input);
    modalBtnContainer.appendChild(okBtn);
    modal.classList.remove('hidden');
    input.focus();
}

function showToast(text) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = text;
    container.appendChild(toast);
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 2000);
}

// ユーティリティ
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 名前をルビ付きで表示するためのHTMLを作る
function rubyName(unit) {
    if(!unit || !unit.name) return '';
    if(!unit.reading) return unit.name;
    return `<ruby>${unit.name}<rt>${unit.reading}</rt></ruby>`;
}

// ダメージ数値のポップアップ（画面外まで飛んでいかず、その場で少しだけ動いて消える）
function showDamagePopup(container, text, opts = {}) {
    const pop = document.createElement('div');
    pop.innerText = text;
    pop.style.position = 'absolute';
    pop.style.top = opts.top || '32%';
    pop.style.left = '50%';
    pop.style.fontSize = opts.fontSize || '48px';
    pop.style.color = opts.color || 'white';
    pop.style.textShadow = opts.textShadow || '0 0 10px red';
    pop.style.fontWeight = '900';
    pop.style.pointerEvents = 'none';
    pop.style.zIndex = '40';
    container.appendChild(pop);

    const totalSteps = 34; // 約1秒表示
    let progress = 0;
    const anim = setInterval(() => {
        progress++;
        const drift = -progress * 0.9; // ほんの少しだけ上に動く程度に留める
        const scale = 1 + progress * 0.004;
        pop.style.transform = `translate(-50%, -50%) translateY(${drift}px) scale(${scale})`;
        if(progress > totalSteps / 2) {
            pop.style.opacity = 1 - (progress - totalSteps / 2) / (totalSteps / 2);
        }
        if(progress >= totalSteps) {
            clearInterval(anim);
            pop.remove();
        }
    }, 30);
}

// HPバーの減少をゆっくり見せる（本体バーの後ろに少し遅れて追いつく
// トレイルバーを重ねることで、削れた量が分かりやすくなる）
function updateHpBar(fillEl, trailEl, percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    fillEl.style.width = clamped + '%';
    if(trailEl) {
        setTimeout(() => { trailEl.style.width = clamped + '%'; }, 250);
    }
}

// ひっさつわざの演出（Cross Legendsの「スカイパンチ」＝画面反転＋シェイク＋
// 光の十字バーストを流用したもの）
function playSkyPunchEffect() {
    const screen = document.getElementById('battle-screen');
    screen.classList.add('void-invert', 'screen-shake');
    setTimeout(() => screen.classList.remove('void-invert', 'screen-shake'), 600);

    const enemyArea = document.getElementById('enemy-area');
    const burst = document.createElement('div');
    burst.className = 'vfx-sky-burst';
    const cross = document.createElement('div');
    cross.className = 'vfx-sky-cross';
    enemyArea.appendChild(burst);
    enemyArea.appendChild(cross);
    setTimeout(() => { burst.remove(); cross.remove(); }, 1000);
}

// ==========================
// 初期化・タイトル画面
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    initTitle();
});

function initTitle() {
    document.getElementById('start-btn').onclick = () => initCharacterSelect();
    
    const diffBtn = document.getElementById('difficulty-btn');
    diffBtn.onclick = () => {
        if(GameState.difficulty === 'child') {
            // おとなモードへの切り替えは計算問題に正解した時だけ
            askMathChallenge(() => {
                GameState.difficulty = 'adult';
                diffBtn.innerHTML = 'おとな<ruby>モード<rt>もーど</rt></ruby>';
            });
        } else {
            GameState.difficulty = 'child';
            diffBtn.innerHTML = 'こども<ruby>モード<rt>もーど</rt></ruby>';
        }
    };

    document.getElementById('update-btn').onclick = () => location.reload();
}

// ==========================
// キャラクター選択
// ==========================
function initCharacterSelect() {
    showScreen('party-screen');
    const list = document.getElementById('character-list');
    list.innerHTML = '';
    GameState.party = [];

    const startBtn = document.getElementById('start-run-btn');
    startBtn.classList.add('hidden');
    startBtn.onclick = () => initMap();

    document.getElementById('party-back-btn').onclick = () => showScreen('title-screen');

    Object.values(CHARACTERS).forEach(char => {
        // キャラカード作成
        const card = document.createElement('div');
        card.className = 'char-card';
        card.dataset.id = char.id;

        card.innerHTML = `
            <div class="char-thumb">
                <img src="img/${char.id}_face.png" alt="${char.name}" onerror="this.src='img/icon.png'">
                <div class="char-stats-adult ${GameState.difficulty === 'adult' ? 'visible' : ''}">
                    HP:${char.hp} 攻:${char.attack}
                </div>
            </div>
            <div class="char-name">${rubyName(char)}</div>
        `;

        card.onclick = () => {
            const index = GameState.party.findIndex(c => c.id === char.id);
            if(index > -1) {
                // 解除
                GameState.party.splice(index, 1);
                card.classList.remove('selected');
            } else {
                // 選択
                if(GameState.party.length < 3) {
                    // ディープコピーして現在のHPを持たせる
                    GameState.party.push(JSON.parse(JSON.stringify(char)));
                    card.classList.add('selected');
                } else {
                    showToast('3にんまでです');
                }
            }

            if(GameState.party.length === 3) {
                startBtn.classList.remove('hidden');
            } else {
                startBtn.classList.add('hidden');
            }
        };

        list.appendChild(card);
    });
}

// ==========================
// マップ画面
// ==========================
const MAP_NODES = [
    { type: 'normal', index: 0 },
    { type: 'normal', index: 1 },
    { type: 'normal_hard', index: 2 },
    { type: 'elite', index: 3 },
    { type: 'boss', index: 4 }
];

let generatedMapEnemies = [];

function initMap() {
    GameState.currentNode = 0;
    GameState.minigameIndex = 0;
    GameState.hissatsuIndex = 0;
    GameState.hissatsuGauge = 0;
    Minigames.reset();

    // パーティ初期化
    GameState.party.forEach(p => {
        p.currentHp = p.hp;
    });

    // 敵を事前に決定（5ノードの中で同じ敵が重複しないようにする）
    generatedMapEnemies = [];
    const usedEnemyIds = new Set();
    MAP_NODES.forEach(n => {
        let pool = ENEMIES.normal;
        if(n.type === 'elite') pool = ENEMIES.elite;
        if(n.type === 'boss') pool = ENEMIES.boss;

        const candidates = pool.filter(e => !usedEnemyIds.has(e.id));
        const pickFrom = candidates.length > 0 ? candidates : pool; // 万一足りない時の保険
        const base = pickFrom[Math.floor(Math.random() * pickFrom.length)];
        usedEnemyIds.add(base.id);

        const enemy = JSON.parse(JSON.stringify(base));
        if(n.type === 'normal_hard') {
            // ノード3は同じザコ敵プールから少し強化して出す
            enemy.hp = Math.floor(enemy.hp * 1.4);
            enemy.attack = Math.floor(enemy.attack * 1.15);
        }
        generatedMapEnemies.push(enemy);
    });

    renderMap();
    showScreen('map-screen');
}

function renderMap() {
    const map = document.getElementById('node-map');
    map.innerHTML = '';

    for(let i=0; i<MAP_NODES.length; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'map-node-wrap';

        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'map-node';
        if(i < GameState.currentNode) nodeDiv.classList.add('cleared');
        if(i === GameState.currentNode) nodeDiv.classList.add('active');

        const enemy = generatedMapEnemies[i];
        nodeDiv.innerHTML = `<img src="img/enemy/${enemy.id}.png" onerror="this.src='img/icon.png'">`;
        wrap.appendChild(nodeDiv);

        if(i === GameState.currentNode) {
            const callout = document.createElement('div');
            callout.className = 'map-node-callout';
            callout.innerText = 'タップして しょうぶ！';
            wrap.appendChild(callout);
        }

        nodeDiv.onclick = () => {
            if(i === GameState.currentNode) {
                startBattle(enemy);
            }
        };
        map.appendChild(wrap);
    }
    
    renderPartyStatusBar();
}

function renderPartyStatusBar() {
    const bar = document.getElementById('party-status-bar');
    bar.innerHTML = '';
    GameState.party.forEach(p => {
        const div = document.createElement('div');
        div.style.width = '30%';
        div.innerHTML = `
            <img class="party-bar-img" src="img/${p.id}_face.png" onerror="this.src='img/icon.png'">
            <div class="party-bar-name">${rubyName(p)}</div>
            <div class="hp-bar-bg" style="height:12px;">
                <div class="hp-bar-fill" style="width:${(p.currentHp/p.hp)*100}%"></div>
            </div>
        `;
        bar.appendChild(div);
    });
}

// ==========================
// バトル画面
// ==========================
function startBattle(enemyData) {
    GameState.inBattle = true;
    GameState.turnIndex = 0;
    
    // 敵の初期化
    GameState.currentEnemy = enemyData;
    
    // 難易度補正
    const hpMult = GameState.difficulty === 'adult' ? 1.5 : 0.6;
    GameState.currentEnemy.maxHp = Math.floor(GameState.currentEnemy.hp * hpMult);
    GameState.currentEnemy.currentHp = GameState.currentEnemy.maxHp;

    showScreen('battle-screen');
    renderBattle();
    startAllyTurn();
}

function renderBattle() {
    // 敵エリア
    const enemyArea = document.getElementById('enemy-area');
    const e = GameState.currentEnemy;
    enemyArea.innerHTML = `
        <div class="enemy-container">
            <div class="enemy-frame">
                <img src="img/enemy/${e.id}.png" class="enemy-img" id="battle-enemy-img" onerror="this.src='img/icon.png'">
            </div>
            <div class="enemy-name">${rubyName(e)}</div>
            <div class="hp-bar-bg" style="width: 250px; height: 20px; margin: 5px auto;">
                <div class="hp-bar-trail" id="enemy-hp-trail" style="width:${(e.currentHp/e.maxHp)*100}%"></div>
                <div class="hp-bar-fill" id="enemy-hp-fill" style="width:${(e.currentHp/e.maxHp)*100}%"></div>
            </div>
            <div class="hp-text" id="enemy-hp-text">${e.currentHp} / ${e.maxHp}</div>
        </div>
    `;

    // 味方エリア
    const allyArea = document.getElementById('ally-area');
    allyArea.innerHTML = '';
    GameState.party.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'ally-card' + (p.currentHp <= 0 ? ' dead' : '');
        card.id = 'ally-card-' + idx;
        card.innerHTML = `
            <img src="img/${p.id}_face.png" class="ally-img" onerror="this.src='img/icon.png'">
            <div class="ally-name">${rubyName(p)}</div>
            <div class="hp-bar-bg">
                <div class="hp-bar-trail" id="ally-hp-trail-${idx}" style="width:${(p.currentHp/p.hp)*100}%"></div>
                <div class="hp-bar-fill" id="ally-hp-fill-${idx}" style="width:${(p.currentHp/p.hp)*100}%"></div>
            </div>
            <div class="hp-text" id="ally-hp-text-${idx}">${p.currentHp} / ${p.hp}</div>
        `;
        allyArea.appendChild(card);
    });

    updateHissatsuGauge();
    document.getElementById('battle-log').innerHTML = `${rubyName(e)} が あらわれた`;
}

function updateHissatsuGauge() {
    const btn = document.getElementById('hissatsu-btn');
    const fill = btn.querySelector('.hissatsu-fill');
    
    if(GameState.hissatsuGauge >= 100) GameState.hissatsuGauge = 100;
    
    fill.style.width = GameState.hissatsuGauge + '%';
    
    // ゲージ満タンでも、味方のコマンド受付中でなければ押せないようにする
    // （敵のターンや演出中に割り込まれてターン進行が壊れるのを防ぐ）
    if(GameState.hissatsuGauge >= 100 && GameState.acceptingCommand) {
        btn.disabled = false;
        btn.onclick = () => {
            GameState.acceptingCommand = false;
            document.getElementById('attack-btn').disabled = true;
            updateHissatsuGauge();
            startHissatsu();
        };
    } else {
        btn.disabled = true;
        btn.onclick = null;
    }
}

// ターン進行
async function startAllyTurn() {
    if(!GameState.inBattle) return;
    
    // 全滅チェック
    if(GameState.party.every(p => p.currentHp <= 0)) {
        GameState.inBattle = false;
        GameState.acceptingCommand = false;
        document.getElementById('attack-btn').disabled = true;
        updateHissatsuGauge();
        await sleep(1000);
        showModal('まけ……', [{text: '<ruby>タイトル<rt>たいとる</rt></ruby>へ', onClick: () => location.reload(), keepOpen: true}]);
        return;
    }

    // 敵死亡チェック
    if(GameState.currentEnemy.currentHp <= 0) {
        await sleep(1000);
        winBattle();
        return;
    }

    if(GameState.turnIndex >= 3) {
        // 全員終わったら敵ターン
        startEnemyTurn();
        return;
    }

    const currentAlly = GameState.party[GameState.turnIndex];
    if(currentAlly.currentHp <= 0) {
        // 死んでたらスキップ
        GameState.turnIndex++;
        startAllyTurn();
        return;
    }

    // ハイライト
    document.querySelectorAll('.ally-card').forEach(c => c.classList.remove('acting'));
    document.getElementById('ally-card-' + GameState.turnIndex).classList.add('acting');

    document.getElementById('battle-log').innerHTML = `${rubyName(currentAlly)} の ばん`;
    
    // コマンド受付（敵は常に1体なのでターゲット選択なしで直接ミニゲームへ）
    const atkBtn = document.getElementById('attack-btn');
    GameState.acceptingCommand = true;
    atkBtn.disabled = false;
    atkBtn.onclick = () => {
        // ダメージ演出が終わって次のターンが来るまで連打できないようにする
        GameState.acceptingCommand = false;
        atkBtn.disabled = true;
        updateHissatsuGauge();
        prepareMinigame(currentAlly);
    };
    updateHissatsuGauge();
}

function prepareMinigame(ally) {
    const overlay = document.getElementById('minigame-overlay');
    const title = document.getElementById('minigame-title');
    const startBtn = document.getElementById('minigame-start-btn');
    const container = document.getElementById('minigame-container');
    const announce = document.getElementById('minigame-announce');
    
    overlay.classList.remove('hidden');
    container.classList.add('hidden');
    announce.classList.remove('hidden');

    // ミニゲームはキャラクターに関係なく、攻撃のたびに順番にローテーションする
    const game = Minigames.list[GameState.minigameIndex % Minigames.list.length];
    GameState.minigameIndex++;

    // 予告文は実際に出題される記号・形に合わせる
    title.innerHTML = game.getTitle();

    startBtn.onclick = () => {
        startBtn.onclick = null;
        announce.classList.add('hidden');
        container.classList.remove('hidden');

        game.start(GameState.difficulty, container, (ratio) => {
            container.innerHTML = '';
            overlay.classList.add('hidden');
            executeAttack(ally, ratio);
        });
    };
}

async function executeAttack(ally, successRatio) {
    // 成功度50%未満でも最低限のダメージは与える
    const baseDamage = ally.attack;
    let multiplier = successRatio;
    if(multiplier < 0.2) multiplier = 0.2; // 最低保証
    
    const damage = Math.floor(baseDamage * multiplier * (0.9 + Math.random()*0.2));
    
    document.getElementById('battle-log').innerHTML = `${rubyName(ally)} の こうげき`;
    await sleep(500);
    
    // 敵ダメージ処理
    const e = GameState.currentEnemy;
    e.currentHp -= damage;
    if(e.currentHp < 0) e.currentHp = 0;
    
    const enemyImg = document.getElementById('battle-enemy-img');
    enemyImg.classList.add('flash');
    setTimeout(() => enemyImg.classList.remove('flash'), 300);
    
    updateHpBar(
        document.getElementById('enemy-hp-fill'),
        document.getElementById('enemy-hp-trail'),
        (e.currentHp/e.maxHp)*100
    );
    document.getElementById('enemy-hp-text').innerText = `${e.currentHp} / ${e.maxHp}`;

    // ダメージ数値ポップアップ
    showDamagePopup(document.getElementById('enemy-area'), damage, { top: '20%' });

    // 必殺技ゲージ増加
    const gaugeGain = (GameState.difficulty === 'child' ? 35 : 20) * multiplier;
    GameState.hissatsuGauge += gaugeGain;
    updateHissatsuGauge();

    await sleep(1000);
    
    GameState.turnIndex++;
    startAllyTurn();
}

async function startEnemyTurn() {
    document.getElementById('battle-log').innerHTML = `${rubyName(GameState.currentEnemy)} の こうげき`;
    document.querySelectorAll('.ally-card').forEach(c => c.classList.remove('acting'));
    
    await sleep(1000);
    
    // 生きている味方をランダム対象
    const aliveAllies = GameState.party.filter(p => p.currentHp > 0);
    if(aliveAllies.length === 0) return;
    const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
    const targetIdx = GameState.party.findIndex(p => p.id === target.id);
    
    const baseAtk = GameState.currentEnemy.attack;
    const atkMult = GameState.difficulty === 'adult' ? 1.5 : 0.5;
    const damage = Math.floor(baseAtk * atkMult * (0.9 + Math.random()*0.2));
    
    target.currentHp -= damage;
    if(target.currentHp < 0) target.currentHp = 0;
    
    const card = document.getElementById('ally-card-' + targetIdx);
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);

    updateHpBar(
        document.getElementById('ally-hp-fill-' + targetIdx),
        document.getElementById('ally-hp-trail-' + targetIdx),
        (target.currentHp/target.hp)*100
    );
    document.getElementById('ally-hp-text-' + targetIdx).innerText = `${target.currentHp} / ${target.hp}`;
    showDamagePopup(card, damage, { top: '0%', fontSize: '28px' });
    if(target.currentHp <= 0) {
        card.classList.add('dead');
    }

    await sleep(1000);
    
    // 次のターンへ
    GameState.turnIndex = 0;
    startAllyTurn();
}

async function winBattle() {
    GameState.inBattle = false;
    GameState.acceptingCommand = false;
    document.getElementById('attack-btn').disabled = true;
    updateHissatsuGauge();

    document.getElementById('battle-log').innerHTML = `${rubyName(GameState.currentEnemy)} を たおした！`;
    await sleep(1200);

    const isLast = GameState.currentNode === MAP_NODES.length - 1;
    if(isLast) {
        showModal(
            `🎉<br>さいごの ${rubyName(GameState.currentEnemy)} に かった<br><ruby>クリア<rt>くりあ</rt></ruby>！`,
            [{text: '<ruby>タイトル<rt>たいとる</rt></ruby>へ', onClick: () => location.reload(), keepOpen: true}]
        );
    } else {
        // 敵を倒すたびに「しょうり」のモーダルを出す
        const nokori = MAP_NODES.length - 1 - GameState.currentNode;
        showModal(
            `⚔️<br>しょうり<br>${rubyName(GameState.currentEnemy)} に かった<br>` +
            `<span class="modal-sub">のこり ${nokori}たい</span>`,
            [{text: 'つぎへ', onClick: () => {
                GameState.currentNode++;
                renderMap();
                showScreen('map-screen');
            }}]
        );
    }
}

// ==========================
// 必殺技
// ==========================
function startHissatsu() {
    GameState.hissatsuGauge = 0;
    updateHissatsuGauge();

    const overlay = document.getElementById('hissatsu-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = '';

    const titleEl = document.createElement('div');
    titleEl.className = 'hs-title';
    overlay.appendChild(titleEl);

    const playArea = document.createElement('div');
    playArea.className = 'hs-play-area';
    overlay.appendChild(playArea);

    // ひっさつわざのミニゲームも順番にローテーションする
    const game = HissatsuGames.list[GameState.hissatsuIndex % HissatsuGames.list.length];
    GameState.hissatsuIndex++;

    game.start(
        GameState.difficulty,
        playArea,
        (text) => { titleEl.innerText = text; },
        (ratio) => {
            overlay.classList.add('hidden');
            overlay.innerHTML = '';
            executeHissatsuDamage(ratio);
        }
    );
}

async function executeHissatsuDamage(successRatio) {
    // ダメージ計算（成功度 0〜1 から倍率を決める）
    let multiplier = 0;
    if(successRatio >= 0.999) multiplier = 6;      // ぜんぶ成功
    else if(successRatio >= 0.7) multiplier = 4;
    else if(successRatio >= 0.4) multiplier = 2.5;
    else if(successRatio > 0) multiplier = 1.5;

    // 先にクリアできたかどうかを表示してから、ダメージ演出に入る
    const resultText = multiplier >= 6 ? 'だいせいこう' :
        multiplier >= 4 ? 'せいこう' :
        multiplier >= 2.5 ? 'せいこう' :
        multiplier > 0 ? 'ぎりぎり せいこう' : 'しっぱい…';
    document.getElementById('battle-log').innerText = resultText;
    await sleep(700);

    document.getElementById('battle-log').innerText = 'ひっさつわざ！';

    // スカイパンチ演出（Cross Legendsのキュアスカイ「ヒーローガールスカイパンチ」を流用）
    playSkyPunchEffect();
    await sleep(600);

    if(multiplier > 0) {
        const totalAtk = GameState.party.reduce((sum, p) => p.currentHp > 0 ? sum + p.attack : sum, 0);
        const damage = Math.floor(totalAtk * multiplier);

        const e = GameState.currentEnemy;
        e.currentHp -= damage;
        if(e.currentHp < 0) e.currentHp = 0;

        updateHpBar(
            document.getElementById('enemy-hp-fill'),
            document.getElementById('enemy-hp-trail'),
            (e.currentHp/e.maxHp)*100
        );
        document.getElementById('enemy-hp-text').innerText = `${e.currentHp} / ${e.maxHp}`;

        showDamagePopup(document.getElementById('enemy-area'), damage, {
            top: '20%', fontSize: '64px', color: '#ff00ff', textShadow: '0 0 20px white'
        });

        document.getElementById('battle-enemy-img').classList.add('shake');
        setTimeout(() => document.getElementById('battle-enemy-img').classList.remove('shake'), 500);
    } else {
        document.getElementById('battle-log').innerText = 'しっぱい…';
    }

    await sleep(1500);
    
    // 敵死亡チェック（通常攻撃と同じ）
    if(GameState.currentEnemy.currentHp <= 0) {
        winBattle();
    } else {
        // 次の行動へ
        if(GameState.turnIndex >= 3) {
            startEnemyTurn();
        } else {
            startAllyTurn();
        }
    }
}
