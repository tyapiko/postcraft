/**
 * 日本語をローマ字に変換するユーティリティ
 * ひらがな・カタカナ・漢字をローマ字変換し、スラッグに適した形式に変換する
 */

// ひらがな→ローマ字 マッピング
const hiraganaToRomaji: { [key: string]: string } = {
  // 基本
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',

  // 濁音
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',

  // 半濁音
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',

  // 拗音
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',

  // 小文字
  'っ': '', // 促音は次の子音を重ねる（後で処理）
  'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo',
  'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',

  // 長音
  'ー': '',
}

// カタカナ→ひらがな変換
const katakanaToHiragana = (str: string): string => {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    const charCode = match.charCodeAt(0) - 0x60
    return String.fromCharCode(charCode)
  })
}

// 漢字→読み仮名変換（簡易版：よく使う漢字のみ）
const kanjiToReading: { [key: string]: string } = {
  // ビジネス・テクノロジー関連
  '活': 'katsu', '用': 'you', '術': 'jutsu', '入': 'nyu', '門': 'mon',
  '自': 'ji', '動': 'dou', '化': 'ka', '分': 'bun', '析': 'seki',
  '人': 'jin', '工': 'kou', '知': 'chi', '能': 'nou',
  '機': 'ki', '械': 'kai', '学': 'gaku', '習': 'shuu',
  '深': 'shin', '層': 'sou', 'デ': 'de', 'ー': '', 'タ': 'ta',
  '処': 'sho', '理': 'ri', '基': 'ki', '礎': 'so', '応': 'ou',
  '実': 'jitsu', '践': 'sen', '初': 'sho', '心': 'shin', '者': 'sha',
  '中': 'chuu', '級': 'kyuu', '上': 'jou', '効': 'kou', '率': 'ritsu',
  '業': 'gyou', '務': 'mu', '改': 'kai', '善': 'zen', '生': 'sei',
  '産': 'san', '性': 'sei', '向': 'kou', '統': 'tou', '計': 'kei',
  '数': 'suu', '値': 'chi', '可': 'ka', '視': 'shi', 'グ': 'gu',
  'ラ': 'ra', 'フ': 'fu', '作': 'saku', '成': 'sei', '方': 'hou',
  '法': 'hou', '戦': 'sen', '略': 'ryaku', '思': 'shi', '考': 'kou',
  '問': 'mon', '題': 'dai', '解': 'kai', '決': 'ketsu', '新': 'shin',
  '時': 'ji', '代': 'dai', '必': 'hitsu', '要': 'you', '技': 'gi',
  '最': 'sai', '強': 'kyou', '完': 'kan', '全': 'zen', '攻': 'kou',
  '使': 'shi', '始': 'haji',
  // プログラミング
  '開': 'kai', '発': 'hatsu', '環': 'kan', '境': 'kyou', '構': 'kou',
  '築': 'chiku', '設': 'setsu', '定': 'tei', '変': 'hen', '更': 'kou',
  '追': 'tsui', '加': 'ka', '削': 'saku', '除': 'jo', '修': 'shuu',
  '正': 'sei', '連': 'ren', '携': 'kei', '外': 'gai',
  '部': 'bu', '内': 'nai', '関': 'kan', '係': 'kei',
  // データ関連
  '収': 'shuu', '集': 'shuu', '整': 'sei', '形': 'kei', '前': 'mae',
  '後': 'go', '結': 'ketsu', '果': 'ka', '出': 'shutsu', '力': 'ryoku',
  // AI関連
  '言': 'gen', '語': 'go', '画': 'ga', '像': 'zou', '認': 'nin',
  '識': 'shiki', '検': 'ken', '予': 'yo', '測': 'soku',
  '推': 'sui', '論': 'ron', '型': 'gata', '大': 'dai', '規': 'ki',
  '模': 'mo',
}

// ひらがなをローマ字に変換
const hiraganaToRomajiConvert = (str: string): string => {
  let result = ''
  let i = 0

  while (i < str.length) {
    // 2文字の拗音をチェック
    if (i + 1 < str.length) {
      const twoChar = str.substring(i, i + 2)
      if (hiraganaToRomaji[twoChar]) {
        result += hiraganaToRomaji[twoChar]
        i += 2
        continue
      }
    }

    // 促音（っ）の処理
    if (str[i] === 'っ' && i + 1 < str.length) {
      const nextChar = str[i + 1]
      const nextRomaji = hiraganaToRomaji[nextChar]
      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0] // 次の子音を重ねる
      }
      i++
      continue
    }

    // 1文字の変換
    const oneChar = str[i]
    if (hiraganaToRomaji[oneChar] !== undefined) {
      result += hiraganaToRomaji[oneChar]
    } else {
      result += oneChar
    }
    i++
  }

  return result
}

// 漢字をローマ字に変換（簡易版）
const kanjiToRomajiConvert = (str: string): string => {
  let result = ''

  for (const char of str) {
    if (kanjiToReading[char]) {
      result += kanjiToReading[char]
    } else if (/[\u4E00-\u9FAF]/.test(char)) {
      // 未知の漢字はスキップまたはそのまま残す
      result += char
    } else {
      result += char
    }
  }

  return result
}

/**
 * 日本語テキストをスラッグに変換
 * @param text 変換するテキスト
 * @returns スラッグ形式の文字列
 */
export function japaneseToSlug(text: string): string {
  if (!text) return ''

  let result = text

  // 1. カタカナをひらがなに変換
  result = katakanaToHiragana(result)

  // 2. 漢字をローマ字に変換
  result = kanjiToRomajiConvert(result)

  // 3. ひらがなをローマ字に変換
  result = hiraganaToRomajiConvert(result)

  // 4. 英数字とハイフンのみ残す
  result = result
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()

  return result
}

/**
 * 汎用スラッグ生成（英語テキスト用）
 * @param text 変換するテキスト
 * @returns スラッグ形式の文字列
 */
export function generateSlug(text: string): string {
  if (!text) return ''

  // 日本語が含まれているかチェック
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)

  if (hasJapanese) {
    return japaneseToSlug(text)
  }

  // 英語のみの場合
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}
