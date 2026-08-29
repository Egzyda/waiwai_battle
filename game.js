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
    inBattle: false
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
            closeModal();
        };
        modalBtnContainer.appendChild(btn);
    });
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
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
            GameState.difficulty = 'adult';
            diffBtn.innerHTML = 'おとな<ruby>モード<rt>もーど</rt></ruby>';
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

    // ミニゲーム割り当て用
    const mgTypes = ['renda', 'nazori', 'timing'];
    let idx = 0;

    Object.values(CHARACTERS).forEach(char => {
        // キャラカード作成
        const card = document.createElement('div');
        card.className = 'char-card';
        card.dataset.id = char.id;
        
        // ミニゲームタイプをローテーションで割り当て
        char.minigame = mgTypes[idx % 3];
        idx++;

        let mgIcon = '';
        if(char.minigame === 'renda') mgIcon = '⭐';
        if(char.minigame === 'nazori') mgIcon = '✍️';
        if(char.minigame === 'timing') mgIcon = '⭕';

        card.innerHTML = `
            <div class="char-thumb">
                <img src="img/${char.id}_face.png" alt="${char.name}" onerror="this.src='img/icon.png'">
                <div class="char-minigame-icon">${mgIcon}</div>
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
    
    // パーティ初期化
    GameState.party.forEach(p => {
        p.currentHp = p.hp;
    });

    // 敵を事前に決定
    generatedMapEnemies = [];
    MAP_NODES.forEach(n => {
        let pool = ENEMIES.normal;
        if(n.type === 'elite') pool = ENEMIES.elite;
        if(n.type === 'boss') pool = ENEMIES.boss;
        const enemy = pool[Math.floor(Math.random() * pool.length)];
        generatedMapEnemies.push(JSON.parse(JSON.stringify(enemy)));
    });

    renderMap();
    showScreen('map-screen');
}

function renderMap() {
    const map = document.getElementById('node-map');
    map.innerHTML = '';

    for(let i=0; i<MAP_NODES.length; i++) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'map-node';
        if(i < GameState.currentNode) nodeDiv.classList.add('cleared');
        if(i === GameState.currentNode) nodeDiv.classList.add('active');

        const enemy = generatedMapEnemies[i];
        nodeDiv.innerHTML = `<img src="img/enemy/${enemy.id}.png" onerror="this.src='img/icon.png'">`;

        nodeDiv.onclick = () => {
            if(i === GameState.currentNode) {
                startBattle(enemy);
            }
        };
        map.appendChild(nodeDiv);
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
            <div class="party-bar-name">${rubyName(p)}</div>
            <div class="hp-bar-bg" style="height:16px;">
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
            <img src="img/enemy/${e.id}.png" class="enemy-img" id="battle-enemy-img" onerror="this.src='img/icon.png'">
            <div class="enemy-name">${rubyName(e)}</div>
            <div class="hp-bar-bg" style="width: 250px; height: 20px; margin: 5px auto;">
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
                <div class="hp-bar-fill" id="ally-hp-fill-${idx}" style="width:${(p.currentHp/p.hp)*100}%"></div>
            </div>
            <div class="hp-text" id="ally-hp-text-${idx}">${p.currentHp} / ${p.hp}</div>
        `;
        allyArea.appendChild(card);
    });

    updateHissatsuGauge();
    document.getElementById('battle-log').innerHTML = `${rubyName(e)} が あらわれた！`;
}

function updateHissatsuGauge() {
    const btn = document.getElementById('hissatsu-btn');
    const fill = btn.querySelector('.hissatsu-fill');
    
    if(GameState.hissatsuGauge >= 100) GameState.hissatsuGauge = 100;
    
    fill.style.width = GameState.hissatsuGauge + '%';
    
    if(GameState.hissatsuGauge >= 100) {
        btn.disabled = false;
        btn.onclick = () => startHissatsu();
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
        await sleep(1000);
        showModal('まけ……', [{text: '<ruby>タイトル<rt>たいとる</rt></ruby>へ', onClick: () => location.reload()}]);
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

    document.getElementById('battle-log').innerHTML = `${rubyName(currentAlly)} の ばん！`;
    
    // コマンド受付
    const atkBtn = document.getElementById('attack-btn');
    atkBtn.onclick = () => {
        // ターゲット選択（敵タップ）を促す
        document.getElementById('battle-log').innerHTML = 'てき を <ruby>タップ<rt>たっぷ</rt></ruby>！';
        const enemyImg = document.getElementById('battle-enemy-img');
        enemyImg.style.cursor = 'pointer';
        enemyImg.classList.add('flash');
        
        enemyImg.onclick = () => {
            enemyImg.onclick = null;
            enemyImg.style.cursor = 'default';
            enemyImg.classList.remove('flash');
            
            // ミニゲーム開始
            prepareMinigame(currentAlly);
        };
    };
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

    if(ally.minigame === 'renda') title.innerText = 'ほしをあつめよう';
    if(ally.minigame === 'nazori') title.innerText = 'かたちをなぞってみよう';
    if(ally.minigame === 'timing') title.innerText = 'まるがかさなったらタップ';

    startBtn.onclick = () => {
        announce.classList.add('hidden');
        container.classList.remove('hidden');
        
        const callback = (ratio) => {
            overlay.classList.add('hidden');
            executeAttack(ally, ratio);
        };

        if(ally.minigame === 'renda') Minigames.startRenda(GameState.difficulty, container, callback);
        if(ally.minigame === 'nazori') Minigames.startNazori(GameState.difficulty, container, callback);
        if(ally.minigame === 'timing') Minigames.startTiming(GameState.difficulty, container, callback);
    };
}

async function executeAttack(ally, successRatio) {
    // 成功度50%未満でも最低限のダメージは与える
    const baseDamage = ally.attack;
    let multiplier = successRatio;
    if(multiplier < 0.2) multiplier = 0.2; // 最低保証
    
    const damage = Math.floor(baseDamage * multiplier * (0.9 + Math.random()*0.2));
    
    document.getElementById('battle-log').innerHTML = `${rubyName(ally)} の こうげき！`;
    await sleep(500);
    
    // 敵ダメージ処理
    const e = GameState.currentEnemy;
    e.currentHp -= damage;
    if(e.currentHp < 0) e.currentHp = 0;
    
    const enemyImg = document.getElementById('battle-enemy-img');
    enemyImg.classList.add('flash');
    setTimeout(() => enemyImg.classList.remove('flash'), 300);
    
    document.getElementById('enemy-hp-fill').style.width = (e.currentHp/e.maxHp)*100 + '%';
    document.getElementById('enemy-hp-text').innerText = `${e.currentHp} / ${e.maxHp}`;
    
    // ダメージ数値ポップアップ
    const dmgPop = document.createElement('div');
    dmgPop.innerText = damage;
    dmgPop.style.position = 'absolute';
    dmgPop.style.top = '20%';
    dmgPop.style.left = '50%';
    dmgPop.style.transform = 'translate(-50%, -50%)';
    dmgPop.style.fontSize = '48px';
    dmgPop.style.color = 'white';
    dmgPop.style.textShadow = '0 0 10px red';
    dmgPop.style.fontWeight = '900';
    document.getElementById('enemy-area').appendChild(dmgPop);
    
    let popY = 20;
    let popAnim = setInterval(() => {
        popY -= 1;
        dmgPop.style.top = popY + '%';
        dmgPop.style.opacity = popY / 20;
        if(popY <= 0) {
            clearInterval(popAnim);
            dmgPop.remove();
        }
    }, 30);

    // 必殺技ゲージ増加
    const gaugeGain = (GameState.difficulty === 'child' ? 35 : 20) * multiplier;
    GameState.hissatsuGauge += gaugeGain;
    updateHissatsuGauge();

    await sleep(1000);
    
    GameState.turnIndex++;
    startAllyTurn();
}

async function startEnemyTurn() {
    document.getElementById('battle-log').innerHTML = `${rubyName(GameState.currentEnemy)} の こうげき！`;
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
    
    document.getElementById('ally-hp-fill-' + targetIdx).style.width = (target.currentHp/target.hp)*100 + '%';
    document.getElementById('ally-hp-text-' + targetIdx).innerText = `${target.currentHp} / ${target.hp}`;
    if(target.currentHp <= 0) {
        card.classList.add('dead');
    }

    await sleep(1000);
    
    // 次のターンへ
    GameState.turnIndex = 0;
    startAllyTurn();
}

async function winBattle() {
    document.getElementById('battle-log').innerHTML = `${rubyName(GameState.currentEnemy)} を たおした！`;
    await sleep(1500);
    
    if(GameState.currentNode === 4) {
        showModal('やったー <ruby>クリア<rt>くりあ</rt></ruby>！🎉', [{text: '<ruby>タイトル<rt>たいとる</rt></ruby>へ', onClick: () => location.reload()}]);
    } else {
        GameState.currentNode++;
        renderMap();
        showScreen('map-screen');
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
    overlay.innerHTML = '<div style="color:white; font-size:32px; font-weight:bold; margin-bottom:20px;">じゅんばんにおして！</div>';
    
    const playArea = document.createElement('div');
    playArea.style.width = '100%';
    playArea.style.height = '70%';
    playArea.style.position = 'relative';
    overlay.appendChild(playArea);

    let currentExpected = 1;
    const totalNumbers = 10;
    let successCount = 0;

    for(let i=1; i<=totalNumbers; i++) {
        const btn = document.createElement('div');
        btn.innerText = i;
        btn.style.position = 'absolute';
        btn.style.width = '60px';
        btn.style.height = '60px';
        btn.style.background = 'var(--primary-gradient)';
        btn.style.borderRadius = '50%';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.fontSize = '32px';
        btn.style.fontWeight = 'bold';
        btn.style.color = 'white';
        btn.style.boxShadow = '0 4px 10px black';
        
        btn.style.left = Math.random() * (window.innerWidth - 80) + 'px';
        btn.style.top = Math.random() * (window.innerHeight * 0.7 - 80) + 'px';
        
        btn.addEventListener('pointerdown', () => {
            if(i === currentExpected) {
                // 正解
                btn.style.background = 'var(--success)';
                setTimeout(() => btn.style.display = 'none', 100);
                currentExpected++;
                successCount++;
                if(successCount === totalNumbers) {
                    endHissatsu(successCount);
                }
            } else {
                // 不正解 -> 終了
                btn.style.background = 'var(--danger)';
                setTimeout(() => endHissatsu(successCount), 300);
            }
        });
        playArea.appendChild(btn);
    }

    function endHissatsu(count) {
        overlay.classList.add('hidden');
        executeHissatsuDamage(count);
    }
}

async function executeHissatsuDamage(successCount) {
    document.getElementById('battle-log').innerText = 'ひっさつわざ ！！';
    
    // スカイパンチ演出風の全画面フラッシュ
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0'; flash.style.left = '0';
    flash.style.width = '100%'; flash.style.height = '100%';
    flash.style.background = 'white';
    flash.style.zIndex = '9999';
    document.body.appendChild(flash);
    
    let op = 1;
    let fade = setInterval(() => {
        op -= 0.05;
        flash.style.opacity = op;
        if(op <= 0) {
            clearInterval(fade);
            flash.remove();
        }
    }, 50);

    await sleep(500);

    // ダメージ計算
    let multiplier = 1;
    if(successCount >= 1 && successCount <= 3) multiplier = 1.5;
    else if(successCount >= 4 && successCount <= 6) multiplier = 2.5;
    else if(successCount >= 7 && successCount <= 9) multiplier = 4;
    else if(successCount === 10) multiplier = 6;
    else multiplier = 0; // 0問正解はミス

    if(multiplier > 0) {
        const totalAtk = GameState.party.reduce((sum, p) => p.currentHp > 0 ? sum + p.attack : sum, 0);
        const damage = Math.floor(totalAtk * multiplier);
        
        const e = GameState.currentEnemy;
        e.currentHp -= damage;
        if(e.currentHp < 0) e.currentHp = 0;
        
        document.getElementById('enemy-hp-fill').style.width = (e.currentHp/e.maxHp)*100 + '%';
        document.getElementById('enemy-hp-text').innerText = `${e.currentHp} / ${e.maxHp}`;
        
        const dmgPop = document.createElement('div');
        dmgPop.innerText = damage;
        dmgPop.style.position = 'absolute';
        dmgPop.style.top = '20%';
        dmgPop.style.left = '50%';
        dmgPop.style.transform = 'translate(-50%, -50%)';
        dmgPop.style.fontSize = '64px';
        dmgPop.style.color = '#ff00ff';
        dmgPop.style.textShadow = '0 0 20px white';
        dmgPop.style.fontWeight = '900';
        document.getElementById('enemy-area').appendChild(dmgPop);
        setTimeout(() => dmgPop.remove(), 1000);
        
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
