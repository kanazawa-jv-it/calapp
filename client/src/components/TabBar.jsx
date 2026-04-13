import { Link } from 'react-router-dom';

const tabs = [
  { id: 'home', label: 'ホーム', icon: '🏠', path: '/' },
  { id: 'capture', label: '撮影', icon: '📷', path: '/capture' },
  { id: 'history', label: '履歴', icon: '📋', path: '/history' },
];

export default function TabBar({ active }) {
  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <Link
          key={tab.id}
          to={tab.path}
          className={`tab-item ${active === tab.id ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
