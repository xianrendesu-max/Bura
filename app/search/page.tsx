"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [input, setInput] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input)}`);
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('読み込み中...');
    const res = await fetch(`/api/add?url=${encodeURIComponent(addUrl)}`);
    const data = await res.json();
    setStatus(data.message);
    setAddUrl('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-6xl font-bold mb-10 text-blue-600">MySearch</h1>
      
      {/* 検索フォーム */}
      <form onSubmit={onSearch} className="w-full max-w-xl mb-20">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 px-6 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="キーワードで検索..."
        />
      </form>

      {/* サイト追加フォーム（ここが今回のキモ） */}
      <div className="w-full max-w-md p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <h2 className="text-sm font-bold text-gray-600 mb-4">検索対象にサイトを追加</h2>
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input 
            type="url" 
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            className="flex-1 p-2 border rounded text-sm"
            placeholder="https://example.com"
            required
          />
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black">追加</button>
        </form>
        {status && <p className="mt-2 text-xs text-blue-500">{status}</p>}
      </div>
    </div>
  );
}
