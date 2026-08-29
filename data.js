const CHARACTERS = {
    // === ラブライブ ===
    keke: { id: 'keke', name: '唐可可', type: 'tank', hp: 220, attack: 70 },
    ceras: { id: 'ceras', name: 'セラス', type: 'magic_attacker', hp: 130, attack: 150 },
    yoshiko: { id: 'yoshiko', name: '津島善子', type: 'debuffer', hp: 140, attack: 130 },
    shiki: { id: 'shiki', name: '四季', type: 'magic_attacker', hp: 120, attack: 160 },
    setsuna: { id: 'setsuna', name: '優木せつ菜', type: 'magic_attacker', hp: 125, attack: 155 },
    shizuku: { id: 'shizuku', name: '虹ケ丘しずく', type: 'magic_attacker', hp: 130, attack: 145 },
    mari: { id: 'mari', name: '小原鞠莉', type: 'support', hp: 180, attack: 100 },
    kaho: { id: 'kaho', name: '鹿角花帆', type: 'support', hp: 190, attack: 95 },
    hanamaru: { id: 'hanamaru', name: '国木田花丸', type: 'support', hp: 200, attack: 100 },
    margarete: { id: 'margarete', name: 'マルガレーテ', type: 'magic_attacker', hp: 125, attack: 160 },
    sumire: { id: 'sumire', name: '平安名すみれ', type: 'debuffer', hp: 150, attack: 145 },
    
    // === プリキュア ===
    sky: { id: 'sky', name: 'キュアスカイ', type: 'physical_attacker', hp: 150, attack: 150 },
    nyammy: { id: 'nyammy', name: 'キュアニャミー', type: 'tank', hp: 200, attack: 95 },
    zukyuun: { id: 'zukyuun', name: 'キュアズキューン', type: 'physical_attacker', hp: 130, attack: 155 },
    
    // === ポケモン ===
    lucario: { id: 'lucario', name: 'ルカリオ', type: 'magic_attacker', hp: 140, attack: 145 },
    blastoise: { id: 'blastoise', name: 'カメックス', type: 'physical_attacker', hp: 210, attack: 110 },
    
    // === その他 ===
    kirby: { id: 'kirby', name: 'カービィ', type: 'physical_attacker', hp: 160, attack: 120 },
    doraemon: { id: 'doraemon', name: 'ドラえもん', type: 'support', hp: 190, attack: 100 },
    dave: { id: 'dave', name: 'デイブ', type: 'debuffer', hp: 190, attack: 115 },
    mario: { id: 'mario', name: 'マリオ', type: 'debuffer', hp: 150, attack: 95 },
    
    // === 新規 ===
    raburu: { id: 'raburu', name: 'ラブール', type: 'magic_attacker', hp: 130, attack: 150 },
    beruman: { id: 'beruman', name: 'ベルマン', type: 'tank', hp: 240, attack: 66 },
    pappy: { id: 'pappy', name: 'パピー', type: 'healer', hp: 240, attack: 80 },
    aoi: { id: 'aoi', name: '夢宮あおい', type: 'physical_attacker', hp: 130, attack: 150 }
};

const ENEMIES = {
    normal: [
        { id: 'slime', name: 'スライム', hp: 300, attack: 30 },
        { id: 'kuribo', name: 'クリボー', hp: 350, attack: 40 },
        { id: 'abo', name: 'アーボ', hp: 320, attack: 35 },
        { id: 'wadorudo', name: 'ワドルドゥ', hp: 400, attack: 45 }
    ],
    elite: [
        { id: 'zabuza', name: '再不斬', hp: 800, attack: 80 },
        { id: 'tomura', name: '死柄木弔', hp: 900, attack: 90 },
        { id: 'freeza', name: 'フリーザ', hp: 1000, attack: 100 }
    ],
    boss: [
        { id: 'koopa', name: 'クッパ', hp: 1500, attack: 150 },
        { id: 'metaknight', name: 'メタナイト', hp: 1300, attack: 180 },
        { id: 'masterhand', name: 'マスターハンド', hp: 2000, attack: 120 }
    ]
};
