import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMeals, getDailySummary } from '../api';
import TabBar from '../components/TabBar';

export default function History() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getMeals(selectedDate).then(setMeals);
    getDailySummary(selectedDate).then(setSummary);
  }, [selectedDate]);

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return '今日';
    if (dateStr === yesterday) return '昨日';
    return `${d.getMonth() + 1}/${d.getDate()}（${'日月火水木金土'[d.getDay()]}）`;
  };

  return (
    <div className="page">
      <div className="header">
        <h1>食事履歴</h1>
      </div>

      {/* 日付ナビ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'white',
      }}>
        <button onClick={() => changeDate(-1)} style={{
          background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 8,
        }}>◀</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{formatDate(selectedDate)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{selectedDate}</div>
        </div>
        <button onClick={() => changeDate(1)} style={{
          background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 8,
        }}>▶</button>
      </div>

      {/* 日次サマリー */}
      {summary && summary.meal_count > 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
              {Math.round(summary.total_calories)}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-light)' }}> kcal</span>
          </div>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <div className="value">{Math.round(summary.total_protein)}</div>
              <div className="label">タンパク質</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{Math.round(summary.total_fat)}</div>
              <div className="label">脂質</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{Math.round(summary.total_carbs)}</div>
              <div className="label">炭水化物</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{summary.meal_count}</div>
              <div className="label">食事数</div>
            </div>
          </div>
        </div>
      )}

      {/* 食事リスト */}
      {meals.length > 0 ? (
        <div className="card">
          {meals.map((meal, i) => (
            <Link
              key={meal.id}
              to={`/meal/${meal.id}`}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '14px 0',
                borderBottom: i < meals.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none', color: 'inherit',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{meal.food_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>
                  {meal.portion_grams}g ・ P:{Math.round(meal.protein)}g F:{Math.round(meal.fat)}g C:{Math.round(meal.carbs)}g
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>
                  {Math.round(meal.calories)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>kcal</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">🍽️</div>
          <p>この日の記録はありません</p>
        </div>
      )}

      <div style={{ height: 80 }} />
      <TabBar active="history" />
    </div>
  );
}
