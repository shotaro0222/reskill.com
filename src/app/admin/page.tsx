'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [status, setStatus] = useState('');

  // リポジトリ情報の環境変数（ご自身のものに変更してください）
  const REPO_OWNER = 'YOUR_GITHUB_NAME'; 
  const REPO_NAME = 're-skill0';

  // GitHub Actionsをトリガーする関数（記事生成）
  const triggerGeneration = async (isBurst = false) => {
    setStatus('GitHub Actionsを起動中...');
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/deploy.yml/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { burst: isBurst ? 'true' : 'false' }
      }),
    });

    if (res.ok) {
      setStatus(isBurst ? '🚀 50記事の生成プロセスを開始しました！数分後にサイトに反映されます。' : '✅ 1記事の生成プロセスを開始しました！');
    } else {
      setStatus('❌ 実行に失敗しました。トークンや権限を確認してください。');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>⚙️ サイト管理ダッシュボード</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔑 GitHub認証（必須）</h3>
        <input 
          type="password" 
          placeholder="GitHub Personal Access Token" 
          value={token} 
          onChange={(e) => setToken(e.target.value)}
          style={{ width: '100%', padding: '10px' }}
        />
        <p style={{ fontSize: '12px', color: '#666' }}>※repo権限とworkflow権限を持ったトークンを入力してください。</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <button onClick={() => triggerGeneration(false)} style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          📝 今すぐ1記事生成する
        </button>
        <button onClick={() => triggerGeneration(true)} style={{ padding: '10px 20px', background: '#ff4081', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔥 初回50記事を一括生成
        </button>
      </div>

      {status && <p style={{ fontWeight: 'bold', color: '#333' }}>{status}</p>}
    </div>
  );
}