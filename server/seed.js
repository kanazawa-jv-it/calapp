const db = require('./db');

const foods = [
  // ご飯・麺類
  { name: '白米（ごはん）', name_en: 'White Rice', calories_per_100g: 168, protein: 2.5, fat: 0.3, carbs: 37.1, category: '主食' },
  { name: '玄米（ごはん）', name_en: 'Brown Rice', calories_per_100g: 165, protein: 2.8, fat: 0.9, carbs: 35.6, category: '主食' },
  { name: 'うどん（ゆで）', name_en: 'Udon Noodles', calories_per_100g: 105, protein: 2.6, fat: 0.4, carbs: 21.6, category: '主食' },
  { name: 'そば（ゆで）', name_en: 'Soba Noodles', calories_per_100g: 132, protein: 4.8, fat: 1.0, carbs: 26.0, category: '主食' },
  { name: 'ラーメン（中華麺ゆで）', name_en: 'Ramen Noodles', calories_per_100g: 149, protein: 4.9, fat: 0.6, carbs: 29.2, category: '主食' },
  { name: 'パスタ（ゆで）', name_en: 'Pasta', calories_per_100g: 165, protein: 5.8, fat: 0.9, carbs: 32.2, category: '主食' },
  { name: '食パン', name_en: 'White Bread', calories_per_100g: 260, protein: 9.3, fat: 4.4, carbs: 46.7, category: '主食' },

  // 肉類
  { name: '鶏むね肉（皮なし）', name_en: 'Chicken Breast', calories_per_100g: 108, protein: 22.3, fat: 1.5, carbs: 0, category: '肉' },
  { name: '鶏もも肉（皮付き）', name_en: 'Chicken Thigh', calories_per_100g: 200, protein: 16.2, fat: 14.0, carbs: 0, category: '肉' },
  { name: '豚バラ肉', name_en: 'Pork Belly', calories_per_100g: 386, protein: 14.2, fat: 34.6, carbs: 0.1, category: '肉' },
  { name: '豚ロース', name_en: 'Pork Loin', calories_per_100g: 263, protein: 19.3, fat: 19.2, carbs: 0.1, category: '肉' },
  { name: '牛肩ロース', name_en: 'Beef Chuck', calories_per_100g: 240, protein: 17.9, fat: 17.4, carbs: 0.1, category: '肉' },
  { name: '牛ひき肉', name_en: 'Ground Beef', calories_per_100g: 272, protein: 19.0, fat: 21.1, carbs: 0.3, category: '肉' },

  // 魚介類
  { name: '鮭（生）', name_en: 'Salmon', calories_per_100g: 133, protein: 22.3, fat: 4.1, carbs: 0.1, category: '魚' },
  { name: 'まぐろ赤身', name_en: 'Tuna (lean)', calories_per_100g: 125, protein: 26.4, fat: 1.4, carbs: 0.1, category: '魚' },
  { name: 'さば', name_en: 'Mackerel', calories_per_100g: 202, protein: 20.7, fat: 12.1, carbs: 0.3, category: '魚' },
  { name: 'えび', name_en: 'Shrimp', calories_per_100g: 83, protein: 18.4, fat: 0.6, carbs: 0.3, category: '魚' },

  // 野菜
  { name: 'キャベツ', name_en: 'Cabbage', calories_per_100g: 23, protein: 1.3, fat: 0.2, carbs: 5.2, category: '野菜' },
  { name: 'トマト', name_en: 'Tomato', calories_per_100g: 19, protein: 0.7, fat: 0.1, carbs: 4.7, category: '野菜' },
  { name: 'ほうれん草', name_en: 'Spinach', calories_per_100g: 20, protein: 2.2, fat: 0.4, carbs: 3.1, category: '野菜' },
  { name: 'にんじん', name_en: 'Carrot', calories_per_100g: 36, protein: 0.7, fat: 0.1, carbs: 9.3, category: '野菜' },
  { name: 'たまねぎ', name_en: 'Onion', calories_per_100g: 37, protein: 1.0, fat: 0.1, carbs: 8.8, category: '野菜' },
  { name: 'ブロッコリー', name_en: 'Broccoli', calories_per_100g: 33, protein: 4.3, fat: 0.5, carbs: 5.2, category: '野菜' },

  // 卵・乳製品
  { name: '鶏卵（全卵）', name_en: 'Egg', calories_per_100g: 151, protein: 12.3, fat: 10.3, carbs: 0.3, category: '卵・乳' },
  { name: '牛乳', name_en: 'Milk', calories_per_100g: 67, protein: 3.3, fat: 3.8, carbs: 4.8, category: '卵・乳' },
  { name: 'ヨーグルト（無糖）', name_en: 'Yogurt (plain)', calories_per_100g: 62, protein: 3.6, fat: 3.0, carbs: 4.9, category: '卵・乳' },
  { name: 'チーズ（プロセス）', name_en: 'Processed Cheese', calories_per_100g: 339, protein: 22.7, fat: 26.0, carbs: 1.3, category: '卵・乳' },

  // 料理
  { name: 'カレーライス', name_en: 'Curry Rice', calories_per_100g: 170, protein: 4.5, fat: 6.2, carbs: 24.0, category: '料理' },
  { name: '味噌ラーメン', name_en: 'Miso Ramen', calories_per_100g: 87, protein: 4.2, fat: 2.8, carbs: 11.5, category: '料理' },
  { name: '醤油ラーメン', name_en: 'Shoyu Ramen', calories_per_100g: 82, protein: 4.0, fat: 2.5, carbs: 11.0, category: '料理' },
  { name: '豚骨ラーメン', name_en: 'Tonkotsu Ramen', calories_per_100g: 95, protein: 4.5, fat: 3.8, carbs: 11.2, category: '料理' },
  { name: '親子丼', name_en: 'Oyakodon', calories_per_100g: 145, protein: 7.5, fat: 3.8, carbs: 20.5, category: '料理' },
  { name: '牛丼', name_en: 'Gyudon', calories_per_100g: 160, protein: 6.8, fat: 5.5, carbs: 21.0, category: '料理' },
  { name: 'とんかつ', name_en: 'Tonkatsu', calories_per_100g: 344, protein: 22.0, fat: 22.9, carbs: 12.1, category: '料理' },
  { name: '唐揚げ', name_en: 'Karaage', calories_per_100g: 290, protein: 18.5, fat: 18.0, carbs: 12.5, category: '料理' },
  { name: 'ハンバーグ', name_en: 'Hamburg Steak', calories_per_100g: 223, protein: 15.0, fat: 14.5, carbs: 8.5, category: '料理' },
  { name: '焼き魚（鮭）', name_en: 'Grilled Salmon', calories_per_100g: 157, protein: 25.8, fat: 5.3, carbs: 0.1, category: '料理' },
  { name: '味噌汁', name_en: 'Miso Soup', calories_per_100g: 21, protein: 1.5, fat: 0.5, carbs: 2.5, category: '料理' },
  { name: 'サラダ（ドレッシングなし）', name_en: 'Salad (no dressing)', calories_per_100g: 18, protein: 1.0, fat: 0.2, carbs: 3.8, category: '料理' },
  { name: '餃子', name_en: 'Gyoza', calories_per_100g: 230, protein: 10.5, fat: 10.8, carbs: 22.5, category: '料理' },
  { name: '天ぷら（海老）', name_en: 'Tempura (shrimp)', calories_per_100g: 210, protein: 12.0, fat: 10.5, carbs: 18.0, category: '料理' },
  { name: 'お好み焼き', name_en: 'Okonomiyaki', calories_per_100g: 195, protein: 7.5, fat: 8.0, carbs: 23.5, category: '料理' },
  { name: 'チャーハン', name_en: 'Fried Rice', calories_per_100g: 185, protein: 5.5, fat: 6.5, carbs: 27.0, category: '料理' },
  { name: '寿司（にぎり・まぐろ）', name_en: 'Sushi (Tuna Nigiri)', calories_per_100g: 140, protein: 8.5, fat: 0.5, carbs: 28.0, category: '料理' },
  { name: 'おにぎり', name_en: 'Onigiri', calories_per_100g: 170, protein: 2.7, fat: 0.3, carbs: 39.4, category: '料理' },

  // 飲料・スイーツ
  { name: 'コーラ', name_en: 'Cola', calories_per_100g: 46, protein: 0, fat: 0, carbs: 11.3, category: '飲料' },
  { name: 'オレンジジュース', name_en: 'Orange Juice', calories_per_100g: 42, protein: 0.7, fat: 0.1, carbs: 10.1, category: '飲料' },
  { name: 'ビール', name_en: 'Beer', calories_per_100g: 40, protein: 0.3, fat: 0, carbs: 3.1, category: '飲料' },
  { name: 'ショートケーキ', name_en: 'Shortcake', calories_per_100g: 344, protein: 5.0, fat: 18.0, carbs: 40.0, category: 'スイーツ' },
  { name: 'チョコレート', name_en: 'Chocolate', calories_per_100g: 557, protein: 7.0, fat: 34.1, carbs: 55.8, category: 'スイーツ' },
  { name: 'アイスクリーム', name_en: 'Ice Cream', calories_per_100g: 212, protein: 3.5, fat: 12.0, carbs: 23.2, category: 'スイーツ' },
];

// 既存データチェック
const count = db.prepare('SELECT COUNT(*) as c FROM foods').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO foods (name, name_en, calories_per_100g, protein, fat, carbs, category)
    VALUES (@name, @name_en, @calories_per_100g, @protein, @fat, @carbs, @category)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  insertMany(foods);
  console.log(`Seeded ${foods.length} food items.`);
} else {
  console.log(`Foods table already has ${count.c} items.`);
}
