"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [input, setInput] = useState(query);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 検索ヘッダー */}
      <header className="flex items-center p-4 border-b sticky top-0 bg-white z-10 gap-4 sm:gap-8">
        <Link href="/" className="text-xl font-bold text-blue-600 shrink-0">MySearch</Link>
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2.5 px-5 border rounded-full shadow-sm focus:outline-none focus:border-blue-500 text-black"
          />
        </form>
      </header>

      {/* 結果表示 */}
      <main className="max-w-3xl px-6 py-6 sm:ml-20">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <p className="text-sm text-gray-500">
              「{query}」の結果: {results.length} 件
            </p>
            {results.length > 0 ? results.map((item: any, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center text-sm text-gray-700 mb-1 truncate">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded mr-2">WEB</span>
                  {item.url}
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xl text-blue-800 group-hover:underline block decoration-2">
                  {item.title}
                </a>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {item.content}
                </p>
              </div>
            )) : (
              <div className="mt-10">
                <p className="text-gray-800">一致する情報は見つかりませんでした。</p>
                <ul className="list-disc ml-5 mt-4 text-sm text-gray-600 space-y-2">
                  <li>キーワードに誤字がないか確認してください。</li>
                  <li>より一般的なキーワードを試してください。</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">読み込み中...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
