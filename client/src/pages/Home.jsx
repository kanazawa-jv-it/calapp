import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDailySummary, getMeals } from '../api';
import TabBar from '../components/TabBar';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  const [summary, setSummary] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);

  useEffect(() => {
    getDailySummary(today).then(setSummary);
    getMeals(today).then(setRecentMeals);
  }, [today]);

  const targetCalories = 2000;
  const progress = summary ? Math.min((summary.total_calories / targetCalories) * 100, 100) : 0;

  return (
    <div className="page">
      <div className="header">
        <h1>CalApp</h1>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: 'var(--text-light)' }}>今日のカロリー</span>
        </div>
        <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
          <svg viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="90" cy="90" r="78" fill="none" stroke="var(--border)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r="78" fill="none"
              stroke="var(--primary)" strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 78}`}
              strokeDashoffset={`${2 * Math.PI * 78 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--primary)' }}>
              {summary ? Math.round(summary.total_calories) : '---'}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-light)' }}>
              / {targetCalories} kcal
            </span>
          </div>
        </div>

        {summary && (
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <div className="value">{Math.round(summary.total_protein)}</div>
              <div className="label">タンパク質(g)</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{Math.round(summary.total_fat)}</div>
              <div className="label">脂質(g)</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{Math.round(summary.total_carbs)}</div>
              <div className="label">炭水化物(g)</div>
            </div>
            <div className="nutrition-item">
              <div className="value">{summary.meal_count}</div>
              <div className="label">食事数</div>
            </div>
          </div>
        )}
      </div>

      {/* 撮影ボタン */}
      <div style={{ padding: '8px 16px' }}>
        <Link to="/capture" className="btn btn-primary btn-full" style={{ fontSize: 18 }}>
          <span style={{ fontSize: 24 }}>📷</span>
          食事を撮影する
        </Link>
      </div>

      {/* 今日の食事 */}
      {recentMeals.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>今日の食事</h3>
          {recentMeals.map(meal => (
            <Link
              key={meal.id}
              to={`/meal/${meal.id}`}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '12px 0',
                borderBottom: '1px solid var(--border)',
                textDecoration: 'none', color: 'inherit'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{meal.food_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                  {meal.portion_grams}g
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {Math.round(meal.calories)} kcal
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ height: 80 }} />
      <TabBar active="home" />
    </div>
  );
}
