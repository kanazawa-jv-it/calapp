const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function analyzeImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('解析に失敗しました');
  return res.json();
}

export async function searchFoods(query) {
  const res = await fetch(`${API_BASE}/foods/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function getAllFoods() {
  const res = await fetch(`${API_BASE}/foods`);
  return res.json();
}

export async function createMeal(meal) {
  const res = await fetch(`${API_BASE}/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meal),
  });
  return res.json();
}

export async function getMeals(date) {
  const url = date ? `${API_BASE}/meals?date=${date}` : `${API_BASE}/meals`;
  const res = await fetch(url);
  return res.json();
}

export async function getDailySummary(date) {
  const res = await fetch(`${API_BASE}/meals/summary?date=${date}`);
  return res.json();
}

export async function deleteMeal(id) {
  const res = await fetch(`${API_BASE}/meals/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function updateMeal(id, data) {
  const res = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
