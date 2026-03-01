"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function ResultsList() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results);
      setLoading(false);
    };
    if (query) fetchData();
  }, [query]);

  return (
    <div className="max-w-3xl px-6 py-6 sm:ml-20">
      <p className="text-sm text-gray-500 mb-6">「{query}」の検索結果: {results.length} 件</p>
      {loading ? <p>読み込み中...</p> : (
        <div className="space-y-8">
          {results.map((item: any) => (
            <div key={item.id}>
              <p className="text-xs text-gray-600 truncate">{item.url}</p>
              <a href={item.url} target="_blank" className="text-xl text-blue-800 hover:underline">{item.title}</a>
              <p className="text-gray-600 text-sm mt-1">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 border-b flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-blue-600">MySearch</Link>
      </header>
      <Suspense fallback={<p className="p-10">Loading...</p>}>
        <ResultsList />
      </Suspense>
    </div>
  );
}
