export const remindTime = [
  { id: 0, value: 1, title: 1 },
  { id: 1, value: 2, title: 2 },
  { id: 2, value: 5, title: 5 },
  { id: 3, value: 10, title: 10 },
  { id: 4, value: 15, title: 15 },
  { id: 5, value: 30, title: 30 },
];

export const remindUnit = [
  { id: 0, value: 1, title: '分前' },
  { id: 1, value: 60, title: '時間前' },
  { id: 2, value: 1440, title: '日前' },
];

export const repeatOptions = [
  { id: 0, value: [-2], label: '1回のみ' },
  { id: 1, value: [-1], label: '毎日' },
  { id: 2, value: [1, 2, 3, 4, 5], label: '月〜金' },
  { id: 3, value: [], label: `カスタム` },
];

export const customDayOptions = [
  { id: 0, value: 'sun', label: '日曜日' },
  { id: 1, value: 'mon', label: '月曜日' },
  { id: 2, value: 'tue', label: '火曜日' },
  { id: 3, value: 'wed', label: '水曜日' },
  { id: 4, value: 'thu', label: '木曜日' },
  { id: 5, value: 'fri', label: '金曜日' },
  { id: 6, value: 'sat', label: '土曜日' },
]

export const rings = [
  { id: 0, value: 'bell.wav', label: 'ベル', imagePath: require('../assets/bell.png') },
  { id: 1, value: 'doorbell.wav', label: 'ドアベル', imagePath: require('../assets/doorbell.png') },
  { id: 2, value: 'harp.wav', label: 'ハープ', imagePath: require('../assets/harp.png') },
  { id: 3, value: 'magic.wav', label: '神秘的な', imagePath: require('../assets/magic.png') },
  { id: 4, value: 'bubble.wav', label: 'バブル', imagePath: require('../assets/bubble.png') },
  { id: 5, value: 'guitar.wav', label: 'ギター', imagePath: require('../assets/guitar.png') },
  { id: 6, value: 'flute.wav', label: 'フルート', imagePath: require('../assets/flute.png') },
  { id: 7, value: 'message.mp3', label: 'メッセージ', imagePath: require('../assets/message.png') },
];