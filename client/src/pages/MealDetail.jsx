import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeals, deleteMeal } from '../api';

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);

  useEffect(() => {
    getMeals().then(meals => {
      const found = meals.find(m => m.id === id);
      setMeal(found || null);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('この記録を削除しますか？')) return;
    await deleteMeal(id);
    navigate(-1);
  };

  if (!meal) {
    return (
      <div className="page">
        <div className="header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>食事詳細</h1>
        </div>
        <div className="loading">
          <div className="spinner" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>食事詳細</h1>
      </div>

      {/* 画像 */}
      {meal.image_url && (
        <div style={{ padding: '12px 16px 0' }}>
          <img
            src={meal.image_url}
            alt={meal.food_name}
            style={{
              width: '100%', height: 200, objectFit: 'cover',
              borderRadius: 'var(--radius)',
            }}
          />
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>{meal.food_name}</h2>
        <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 16 }}>
          {meal.date} ・ {meal.portion_grams}g
        </p>

        {/* カロリー大表示 */}
        <div style={{
          textAlign: 'center', padding: 20,
          background: 'var(--bg)', borderRadius: 'var(--radius)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-light)' }}>カロリー</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--primary)' }}>
            {Math.round(meal.calories)}
            <span style={{ fontSize: 18, fontWeight: 400 }}> kcal</span>
          </div>
        </div>

        {/* 栄養素 */}
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <div className="value">{Math.round(meal.protein * 10) / 10}</div>
            <div className="label">タンパク質(g)</div>
          </div>
          <div className="nutrition-item">
            <div className="value">{Math.round(meal.fat * 10) / 10}</div>
            <div className="label">脂質(g)</div>
          </div>
          <div className="nutrition-item">
            <div className="value">{Math.round(meal.carbs * 10) / 10}</div>
            <div className="label">炭水化物(g)</div>
          </div>
          <div className="nutrition-item">
            <div className="value">{meal.portion_grams}</div>
            <div className="label">重量(g)</div>
          </div>
        </div>

        {/* PFCバランスバー */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>PFCバランス</div>
          {(() => {
            const total = meal.protein * 4 + meal.fat * 9 + meal.carbs * 4;
            if (total === 0) return null;
            const pPct = (meal.protein * 4 / total * 100).toFixed(0);
            const fPct = (meal.fat * 9 / total * 100).toFixed(0);
            const cPct = (meal.carbs * 4 / total * 100).toFixed(0);
            return (
              <>
                <div style={{
                  display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden',
                  marginBottom: 8,
                }}>
                  <div style={{ width: `${pPct}%`, background: '#2196F3' }} />
                  <div style={{ width: `${fPct}%`, background: '#FF9800' }} />
                  <div style={{ width: `${cPct}%`, background: '#4CAF50' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 12 }}>
                  <span><span style={{ color: '#2196F3' }}>●</span> P {pPct}%</span>
                  <span><span style={{ color: '#FF9800' }}>●</span> F {fPct}%</span>
                  <span><span style={{ color: '#4CAF50' }}>●</span> C {cPct}%</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 削除ボタン */}
      <div style={{ padding: '8px 16px 24px' }}>
        <button className="btn btn-danger btn-full" onClick={handleDelete}>
          この記録を削除
        </button>
      </div>
    </div>
  );
}
