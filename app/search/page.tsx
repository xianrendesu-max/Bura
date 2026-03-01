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
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input)}`);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center p-4 border-b sticky top-0 bg-white z-50 gap-4 sm:gap-8">
        <Link href="/" className="text-xl font-bold text-blue-600 shrink-0">MySearch</Link>
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <input 
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 px-5 border rounded-full shadow-sm focus:outline-none focus:border-blue-500 bg-gray-50"
          />
        </form>
      </header>

      <main className="max-w-3xl px-6 py-8 sm:ml-20">
        {loading ? <p className="text-gray-400">読み込み中...</p> : (
          <div className="space-y-10">
            {/* 強調表示（回答） */}
            {data.instant_answer && (
              <section className="p-5 border rounded-2xl bg-slate-50 border-gray-200">
                <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase">Abstract</p>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <a href={data.instant_answer.url} className="text-xl text-blue-900 font-bold hover:underline">
                      {data.instant_answer.title}
                    </a>
                    <p className="text-sm text-gray-600 mt-2">{data.instant_answer.content}</p>
                  </div>
                  {data.instant_answer.image && <img src={data.instant_answer.image} className="w-20 h-20 rounded shadow bg-white" alt=""/>}
                </div>
              </section>
            )}

            {/* ウェブサイト一覧 */}
            <div className="space-y-8">
              {data.results.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-2 mb-1">
                    {/* ファビコンを自動取得して表示 */}
                    <img src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=32`} className="w-4 h-4" alt=""/>
                    <span className="text-xs text-gray-500 truncate max-w-sm">{item.url}</span>
                  </div>
                  <a href={item.url} target="_blank" className="text-xl text-blue-800 group-hover:underline">
                    {item.title}
                  </a>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.content}</p>
                </div>
              ))}
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
