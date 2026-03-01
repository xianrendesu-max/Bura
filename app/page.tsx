"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-extrabold mb-10 tracking-tighter">MySearch</h1>
      <form onSubmit={handleSearch} className="w-full max-w-xl">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="検索キーワード..."
          className="w-full p-4 px-7 border rounded-full shadow-sm hover:shadow focus:outline-none focus:ring-1 focus:ring-blue-300 text-lg"
        />
        <div className="flex justify-center mt-8">
          <button className="px-6 py-2 bg-gray-50 border border-gray-100 rounded hover:border-gray-300 text-sm">検索を開始</button>
        </div>
      </form>
    </div>
  );
}
