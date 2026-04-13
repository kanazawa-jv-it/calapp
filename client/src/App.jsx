import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Capture from './pages/Capture';
import Result from './pages/Result';
import History from './pages/History';
import MealDetail from './pages/MealDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/meal/:id" element={<MealDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
