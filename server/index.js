const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

// 食品マスタ初期データ投入
require('./seed');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 画像アップロード設定
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// uploadsディレクトリ作成
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ========== API ==========

// POST /api/analyze - 画像解析（AI or モック）
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像が必要です' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    let foods = [];

    // OpenAI Vision APIが設定されている場合
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype || 'image/jpeg';

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `この食事画像に写っている料理・食べ物を識別してください。
JSON配列で返してください。各要素は以下の形式:
[{"name": "料理名", "confidence": 0.0-1.0の信頼度}]
料理名は日本語で。最大5つまで。JSONのみ返してください。`
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          max_tokens: 300
        });

        const text = response.choices[0].message.content.trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          foods = JSON.parse(jsonMatch[0]);
        }
      } catch (aiError) {
        console.error('AI解析エラー:', aiError.message);
        // フォールバック: モックデータ
      }
    }

    // AIが使えない場合はモックデータ
    if (foods.length === 0) {
      const sampleFoods = db.prepare('SELECT name FROM foods WHERE category = ? ORDER BY RANDOM() LIMIT 3').all('料理');
      foods = sampleFoods.map((f, i) => ({
        name: f.name,
        confidence: +(0.9 - i * 0.2).toFixed(2)
      }));
    }

    // 各候補に栄養情報をマッチ
    const enriched = foods.map(f => {
      const match = db.prepare('SELECT * FROM foods WHERE name = ? OR name LIKE ?').get(f.name, `%${f.name}%`);
      return {
        ...f,
        foodData: match || null
      };
    });

    res.json({ imageUrl, foods: enriched });
  } catch (error) {
    console.error('解析エラー:', error);
    res.status(500).json({ error: '解析に失敗しました' });
  }
});

// GET /api/foods/search?q=keyword - 食品検索
app.get('/api/foods/search', (req, res) => {
  const q = req.query.q || '';
  if (q.length < 1) {
    return res.json([]);
  }
  const foods = db.prepare(
    'SELECT * FROM foods WHERE name LIKE ? OR name_en LIKE ? LIMIT 20'
  ).all(`%${q}%`, `%${q}%`);
  res.json(foods);
});

// GET /api/foods - 全食品一覧
app.get('/api/foods', (req, res) => {
  const foods = db.prepare('SELECT * FROM foods ORDER BY category, name').all();
  res.json(foods);
});

// POST /api/meals - 食事登録
app.post('/api/meals', (req, res) => {
  const { imageUrl, foodName, foodId, portionGrams, calories, protein, fat, carbs, date } = req.body;
  const id = uuidv4();
  const mealDate = date || new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO meals (id, image_url, food_name, food_id, portion_grams, calories, protein, fat, carbs, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, imageUrl || null, foodName, foodId || null, portionGrams, calories, protein, fat, carbs, mealDate);

  res.json({ id, message: '登録しました' });
});

// GET /api/meals?date=YYYY-MM-DD - 食事一覧
app.get('/api/meals', (req, res) => {
  const date = req.query.date;
  let meals;
  if (date) {
    meals = db.prepare('SELECT * FROM meals WHERE date = ? ORDER BY created_at DESC').all(date);
  } else {
    meals = db.prepare('SELECT * FROM meals ORDER BY date DESC, created_at DESC LIMIT 100').all();
  }
  res.json(meals);
});

// GET /api/meals/summary?date=YYYY-MM-DD - 日次サマリー
app.get('/api/meals/summary', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const summary = db.prepare(`
    SELECT
      COUNT(*) as meal_count,
      COALESCE(SUM(calories), 0) as total_calories,
      COALESCE(SUM(protein), 0) as total_protein,
      COALESCE(SUM(fat), 0) as total_fat,
      COALESCE(SUM(carbs), 0) as total_carbs
    FROM meals WHERE date = ?
  `).get(date);
  res.json({ date, ...summary });
});

// DELETE /api/meals/:id - 食事削除
app.delete('/api/meals/:id', (req, res) => {
  const result = db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: '見つかりません' });
  }
  res.json({ message: '削除しました' });
});

// PUT /api/meals/:id - 食事更新
app.put('/api/meals/:id', (req, res) => {
  const { foodName, portionGrams, calories, protein, fat, carbs } = req.body;
  const result = db.prepare(`
    UPDATE meals SET food_name = ?, portion_grams = ?, calories = ?, protein = ?, fat = ?, carbs = ?
    WHERE id = ?
  `).run(foodName, portionGrams, calories, protein, fat, carbs, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: '見つかりません' });
  }
  res.json({ message: '更新しました' });
});

app.listen(PORT, () => {
  console.log(`CalApp server running on http://localhost:${PORT}`);
});
