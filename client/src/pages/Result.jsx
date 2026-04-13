import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchFoods, createMeal } from '../api';

const PORTION_PRESETS = [
  { label: '少なめ', grams: 150 },
  { label: '普通', grams: 250 },
  { label: '多め', grams: 400 },
];

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisResult, preview, manual } = location.state || {};

  const [candidates, setCandidates] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [portionGrams, setPortionGrams] = useState(250);
  const [activePreset, setActivePreset] = useState('普通');
  const [customGrams, setCustomGrams] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (analysisResult?.foods) {
      setCandidates(analysisResult.foods);
      if (analysisResult.foods.length > 0 && analysisResult.foods[0].foodData) {
        setSelectedFood(analysisResult.foods[0].foodData);
      }
    }
  }, [analysisResult]);

  useEffect(() => {
    if (searchQuery.length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getConfidenceClass = (c) => c >= 0.7 ? 'high' : c >= 0.4 ? 'medium' : 'low';

  const calcNutrition = (food, grams) => {
    if (!food) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    const ratio = grams / 100;
    return {
      calories: Math.round(food.calories_per_100g * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
    };
  };

  const nutrition = calcNutrition(selectedFood, portionGrams);

  const handleSave = async () => {
    if (!selectedFood) { alert('食品を選択してください'); return; }
    setSaving(true);
    try {
      await createMeal({
        imageUrl: analysisResult?.imageUrl || null,
        foodName: selectedFood.name,
        foodId: selectedFood.id,
        portionGrams,
        calories: nutrition.calories,
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
        date: new Date().toISOString().split('T')[0],
      });
      navigate('/', { replace: true });
    } catch (err) {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>{manual ? '手動入力' : '解析結果'}</h1>
      </div>

      {/* プレビュー画像 */}
      {preview && (
        <div style={{ padding: '12px 16px 0' }}>
          <img src={preview} alt="" style={{
            width: '100%', height: 180, objectFit: 'cover',
            borderRadius: 'var(--radius)'
          }} />
        </div>
      )}

      {/* AI候補 */}
      {candidates.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>AI判定結果</h3>
          {candidates.map((c, i) => (
            <div
              key={i}
              onClick={() => c.foodData && setSelectedFood(c.foodData)}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 12px',
                marginBottom: 6, borderRadius: 8, cursor: 'pointer',
                border: selectedFood?.id === c.foodData?.id
                  ? '2px solid var(--primary)' : '2px solid var(--border)',
                background: selectedFood?.id === c.foodData?.id
                  ? 'var(--primary-light)' : 'white',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span className={`confidence ${getConfidenceClass(c.confidence)}`}>
                {Math.round(c.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 食品検索 */}
      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: 16 }}>
          {candidates.length > 0 ? '違う場合は検索で修正' : '食品を検索'}
        </h3>
        <input
          type="text"
          placeholder="食品名を入力（例: カレー、ラーメン）"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
            {searchResults.map(food => (
              <div
                key={food.id}
                onClick={() => { setSelectedFood(food); setSearchQuery(''); setSearchResults([]); }}
                style={{
                  padding: '10px 12px', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between',
                }}
              >
                <span>{food.name}</span>
                <span style={{ color: 'var(--text-light)', fontSize: 13 }}>
                  {food.calories_per_100g} kcal/100g
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 量の選択 */}
      {selectedFood && (
        <div className="card">
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>
            {selectedFood.name} の量
          </h3>
          <div className="portion-selector">
            {PORTION_PRESETS.map(p => (
              <button
                key={p.label}
                className={`portion-btn ${activePreset === p.label ? 'active' : ''}`}
                onClick={() => { setPortionGrams(p.grams); setActivePreset(p.label); setCustomGrams(''); }}
              >
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{p.grams}g</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              placeholder="グラム数を入力"
              value={customGrams}
              onChange={e => {
                setCustomGrams(e.target.value);
                const v = parseInt(e.target.value);
                if (v > 0) { setPortionGrams(v); setActivePreset(''); }
              }}
              style={{ flex: 1 }}
            />
            <span style={{ color: 'var(--text-light)' }}>g</span>
          </div>

          {/* 栄養表示 */}
          <div style={{
            marginTop: 16, padding: 16, background: 'var(--bg)',
            borderRadius: 'var(--radius)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 4 }}>
              推定カロリー
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--primary)' }}>
              {nutrition.calories}
              <span style={{ fontSize: 16, fontWeight: 400 }}> kcal</span>
            </div>
          </div>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <div className="value">{nutrition.protein}</div>
              <div className="label">タンパク質(g)</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{nutrition.fat}</div>
              <div className="label">脂質(g)</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{nutrition.carbs}</div>
              <div className="label">炭水化物(g)</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{portionGrams}</div>
              <div className="label">重量(g)</div>
            </div>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div style={{ padding: '8px 16px 24px' }}>
        <button
          className="btn btn-primary btn-full"
          onClick={handleSave}
          disabled={!selectedFood || saving}
          style={{ fontSize: 18 }}
        >
          {saving ? '保存中...' : '✓ 記録する'}
        </button>
      </div>
    </div>
  );
}
