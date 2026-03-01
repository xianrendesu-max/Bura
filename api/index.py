from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
import concurrent.futures

app = FastAPI()

# フロントエンドからの通信を許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 検索対象のシードURL（ここからデータを集める）
TARGET_SITES = [
    "https://news.yahoo.co.jp",
    "https://www.watch.impress.co.jp",
    "https://gigazine.net",
    "https://qiita.com",
    "https://b.hatena.ne.jp/hotentry/it"
]

# メモリ上の簡易データベース
SEARCH_DATABASE = []

def crawl_site(url):
    """サイトからタイトルとリンクを抽出する簡易クローラー"""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        res = requests.get(url, headers=headers, timeout=5)
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, "html.parser")
        
        extracted = []
        # aタグからテキストとリンクを拾う
        for a in soup.find_all("a", href=True):
            title = a.get_text().strip()
            link = a["href"]
            
            # 10文字以上の意味のあるテキストを持つリンクのみ採用
            if len(title) > 10:
                # 相対パスを絶対パスに変換
                if link.startswith("/"):
                    from urllib.parse import urljoin
                    link = urljoin(url, link)
                
                if link.startswith("http"):
                    extracted.append({
                        "title": title,
                        "url": link,
                        "content": f"{url} の最新トピック: {title}"
                    })
        return extracted
    except Exception as e:
        print(f"Error crawling {url}: {e}")
        return []

# サーバー起動時に一斉にクロールを実行
print("Indexing sites...")
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    all_pages = executor.map(crawl_site, TARGET_SITES)
    for pages in all_pages:
        for page in pages:
            page["id"] = len(SEARCH_DATABASE)
            SEARCH_DATABASE.append(page)
print(f"Indexing complete. {len(SEARCH_DATABASE)} items loaded.")

@app.get("/api/search")
def search(q: str = Query(None)):
    if not q:
        return {"results": []}
    
    query = q.lower()
    # タイトルまたはコンテンツにキーワードが含まれるものを抽出
    results = [
        item for item in SEARCH_DATABASE 
        if query in item["title"].lower() or query in item["content"].lower()
    ]
    
    # 最大30件を返す
    return {"results": results[:30]}

@app.get("/api/health")
def health():
    return {"status": "ok", "indexed_count": len(SEARCH_DATABASE)}
