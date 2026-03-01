"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [data, setData] = useState<{results: any[], instant_answer: any | null}>({results: [], instant_answer: null});
  const [input, setInput] = useState(query);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center p-4 border-b sticky top-0 bg-white z-10 gap-8">
        <Link href="/" className="text-2xl font-bold text-blue-600 shrink-0">MySearch</Link>
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2.5 px-5 border rounded-full shadow-sm focus:outline-none focus:border-blue-500 text-black"
          />
        </form>
      </header>

      <main className="max-w-3xl px-6 py-6 sm:ml-20">
        {loading ? <p className="text-gray-500 text-center mt-10">検索中...</p> : (
          <div className="space-y-10">
            {/* DuckDuckGo Instant Answer 枠 */}
            {data.instant_answer && (
              <div className="p-6 border rounded-2xl bg-slate-50 border-blue-100 shadow-sm">
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
                  Instant Answer from {data.instant_answer.source}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <a href={data.instant_answer.url} target="_blank" rel="noreferrer" className="text-2xl text-blue-900 font-bold hover:underline decoration-2">
                      {data.instant_answer.title}
                    </a>
                    <p className="mt-3 text-gray-700 leading-relaxed text-sm">
                      {data.instant_answer.content}
                    </p>
                  </div>
                  {data.instant_answer.image && (
                    <img src={data.instant_answer.image} alt="" className="w-24 h-24 object-cover rounded-lg border bg-white" />
                  )}
                </div>
              </div>
            )}

            {/* 自前検索結果 */}
            <div className="space-y-8 mt-6">
              {data.results.length > 0 ? data.results.map((item: any) => (
                <div key={item.id}>
                  <p className="text-xs text-gray-500 mb-1">{item.url}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-xl text-blue-800 hover:underline">
                    {item.title}
                  </a>
                  <p className="text-gray-600 text-sm mt-1">{item.content}</p>
                </div>
              )) : !data.instant_answer && (
                <p className="text-gray-500">結果が見つかりませんでした。</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
