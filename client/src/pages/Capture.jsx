import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage } from '../api';

export default function Capture() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const result = await analyzeImage(selectedFile);
      navigate('/result', { state: { analysisResult: result, preview } });
    } catch (err) {
      alert('解析に失敗しました: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>食事を撮影</h1>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '3px dashed var(--border)',
              borderRadius: 'var(--radius)',
              padding: '60px 20px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>📸</div>
            <p style={{ fontSize: 16, color: 'var(--text-light)', marginBottom: 8 }}>
              タップして写真を撮影・選択
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-light)' }}>
              JPEG / PNG対応
            </p>
          </div>
        ) : (
          <div>
            <img
              src={preview}
              alt="プレビュー"
              style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 'var(--radius)',
                marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setPreview(null); setSelectedFile(null); }}
              >
                撮り直す
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
                    解析中...
                  </>
                ) : (
                  '🔍 AIで解析する'
                )}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* 手動入力リンク */}
      <div style={{ padding: '0 16px' }}>
        <button
          className="btn btn-outline btn-full"
          onClick={() => navigate('/result', { state: { manual: true } })}
        >
          写真なしで手動入力する
        </button>
      </div>
    </div>
  );
}
