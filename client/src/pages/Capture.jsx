import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage } from '../api';

export default function Capture() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setCameraError('カメラ起動に失敗しました。ブラウザ権限を確認してください。');
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreview(dataUrl);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (blob) {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
    }
    stopCamera();
  };

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
          <>
            {cameraActive ? (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxHeight: 320,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius)',
                    marginBottom: 12,
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={stopCamera}>
                    キャンセル
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={captureFromCamera}>
                    撮影する
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '3px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '40px 20px',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 16 }}>📸</div>
                <p style={{ fontSize: 16, color: 'var(--text-light)', marginBottom: 14 }}>
                  写真を撮影・選択
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={startCamera}>
                    カメラを起動
                  </button>
                  <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                    画像を選択
                  </button>
                </div>
                {cameraError && (
                  <p style={{ marginTop: 10, color: '#ef4444', fontSize: 13 }}>
                    {cameraError}
                  </p>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 10 }}>
                  HTTPS環境でカメラ権限を許可すると撮影できます
                </p>
              </div>
            )}
          </>
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
        <canvas ref={canvasRef} style={{ display: 'none' }} />
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
