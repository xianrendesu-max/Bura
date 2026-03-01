from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# メモリ上のデータベース（サーバーが再起動するとリセットされます）
SEARCH_DATABASE = []
# 重複クロール防止用
INDEXED_URLS = set()

def crawl_url(url):
    """指定されたURLを解析してデータベースに保存する"""
    if url in INDEXED_URLS or len(INDEXED_URLS) > 100: # 無料枠制限のため100件まで
        return
    
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; MySearchBot/1.0)"}
        res = requests.get(url, headers=headers, timeout=5)
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, "html.parser")
        
        # ページタイトルの取得
        page_title = soup.title.string if soup.title else url
        
        # ページ内のリンクを収集して「検索対象」にする
        count = 0
        for a in soup.find_all("a", href=True):
            link_text = a.get_text().strip()
            link_url = urljoin(url, a["href"])
            
            if len(link_text) > 5 and link_url.startswith("http"):
                SEARCH_DATABASE.append({
                    "id": len(SEARCH_DATABASE),
                    "title": link_text,
                    "url": link_url,
                    "source": page_title
                })
                count += 1
        
        INDEXED_URLS.add(url)
        return count
    except Exception as e:
        print(f"Error: {e}")
        return 0

# 検索エンドポイント
@app.get("/api/search")
def search(q: str = Query(None)):
    if not q:
        return {"results": []}
    
    query = q.lower()
    # キーワードが含まれるものを検索
    results = [
        item for item in SEARCH_DATABASE 
        if query in item["title"].lower()
    ]
    return {"results": results[:50]}

# 🚀 新機能：URLを登録するエンドポイント
@app.get("/api/add")
def add_url(url: str):
    new_count = crawl_url(url)
    return {"message": f"Added {new_count} links from {url}", "total_indexed": len(SEARCH_DATABASE)}
