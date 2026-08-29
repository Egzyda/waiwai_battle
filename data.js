const CHARACTERS = {
    // === ラブライブ ===
    keke: { id: 'keke', name: '唐可可', reading: 'たん・けーき', type: 'tank', hp: 220, attack: 70 },
    ceras: { id: 'ceras', name: 'セラス', reading: 'せらす', type: 'healer', hp: 230, attack: 95 },
    yoshiko: { id: 'yoshiko', name: '津島善子', reading: 'つしま よしこ', type: 'debuffer', hp: 160, attack: 125 },
    shiki: { id: 'shiki', name: '若菜四季', reading: 'わかな しき', type: 'support', hp: 210, attack: 95 },
    setsuna: { id: 'setsuna', name: '優木せつ菜', reading: 'ゆうき せつな', type: 'magic_attacker', hp: 130, attack: 150 },
    shizuku: { id: 'shizuku', name: '桜坂しずく', reading: 'さくらざか しずく', type: 'debuffer', hp: 180, attack: 100 },
    mari: { id: 'mari', name: 'マリ', reading: 'まり', type: 'tank', hp: 215, attack: 120 },
    kaho: { id: 'kaho', name: '日野下花帆', reading: 'ひのした かほ', type: 'healer', hp: 245, attack: 70 },
    hanamaru: { id: 'hanamaru', name: '国木田花丸', reading: 'くにきだ はなまる', type: 'support', hp: 200, attack: 100 },
    margarete: { id: 'margarete', name: 'マルガレーテ', reading: 'まるがれーて', type: 'magic_attacker', hp: 125, attack: 160 },
    sumire: { id: 'sumire', name: '平安名すみれ', reading: 'へいあんな すみれ', type: 'debuffer', hp: 150, attack: 145 },

    // === プリキュア ===
    sky: { id: 'sky', name: 'キュアスカイ', reading: 'きゅあすかい', type: 'physical_attacker', hp: 130, attack: 150 },
    nyammy: { id: 'nyammy', name: 'キュアニャミー', reading: 'きゅあにゃみー', type: 'tank', hp: 200, attack: 95 },
    zukyuun: { id: 'zukyuun', name: 'キュアズキューン', reading: 'きゅあずきゅーん', type: 'physical_attacker', hp: 130, attack: 155 },

    // === ポケモン ===
    lucario: { id: 'lucario', name: 'ルカリオ', reading: 'るかりお', type: 'support', hp: 180, attack: 125 },
    blastoise: { id: 'blastoise', name: 'カメックス', reading: 'かめっくす', type: 'tank', hp: 220, attack: 90 },

    // === その他 ===
    kirby: { id: 'kirby', name: 'カービィ', reading: 'かーびぃ', type: 'support', hp: 200, attack: 100 },
    doraemon: { id: 'doraemon', name: 'ドラえもん', reading: 'どらえもん', type: 'support', hp: 190, attack: 100 },
    dave: { id: 'dave', name: 'デイブ', reading: 'でいぶ', type: 'debuffer', hp: 190, attack: 115 },
    mario: { id: 'mario', name: 'マリオ', reading: 'まりお', type: 'debuffer', hp: 150, attack: 95 },

    // === 新規 ===
    raburu: { id: 'raburu', name: 'ラブール', reading: 'らぶーる', type: 'magic_attacker', hp: 130, attack: 150 },
    beruman: { id: 'beruman', name: 'ベルマン', reading: 'べるまん', type: 'tank', hp: 240, attack: 66 },
    pappy: { id: 'pappy', name: 'パピー', reading: 'ぱぴー', type: 'healer', hp: 240, attack: 80 },
    aoi: { id: 'aoi', name: '夢宮あおい', reading: 'ゆめみや あおい', type: 'physical_attacker', hp: 130, attack: 150 }
};

const ENEMIES = {
    normal: [
        { id: 'slime', name: 'スライム', reading: 'すらいむ', hp: 300, attack: 30 },
        { id: 'kuribo', name: 'クリボー', reading: 'くりぼー', hp: 350, attack: 40 },
        { id: 'abo', name: 'アーボ', reading: 'あーぼ', hp: 320, attack: 35 },
        { id: 'wadorudo', name: 'ワドルドゥ', reading: 'わどるどぅ', hp: 400, attack: 45 }
    ],
    elite: [
        { id: 'zabuza', name: '桃地再不斬', reading: 'ももち ざぶざ', hp: 800, attack: 80 },
        { id: 'tomura', name: '死柄木弔', reading: 'しがらき とむら', hp: 900, attack: 90 },
        { id: 'freeza', name: 'フリーザ', reading: 'ふりーざ', hp: 1000, attack: 100 }
    ],
    boss: [
        { id: 'koopa', name: 'クッパ', reading: 'くっぱ', hp: 1500, attack: 150 },
        { id: 'metaknight', name: 'メタナイト', reading: 'めたないと', hp: 1300, attack: 180 },
        { id: 'masterhand', name: 'マスターハンド', reading: 'ますたーはんど', hp: 2000, attack: 120 }
    ]
};
