from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 自前の簡易データベース
SEARCH_DATABASE = [
    {"id": 1, "title": "MySearch 開発ガイド", "url": "https://example.com/docs", "content": "VercelとFastAPIを使って自分専用の検索エンジンを作る方法を解説します。"},
    {"id": 2, "title": "Next.js 14 の新機能", "url": "https://nextjs.org/blog", "content": "App Routerやサーバーアクションなど、モダンなWeb開発の最新情報。"}
]

def get_ddg_answer(query):
    """DuckDuckGo APIから構造化データを取得"""
    try:
        # format=json を指定することで解析しやすいデータを取得
        url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
        response = requests.get(url, timeout=3)
        data = response.json()
        
        # Abstract（要約）がある場合のみ返却
        if data.get("Abstract"):
            return {
                "title": data.get("Heading"),
                "url": data.get("AbstractURL"),
                "content": data.get("Abstract"),
                "source": data.get("AbstractSource", "Wikipedia"),
                "image": data.get("Image") # 関連画像URL
            }
    except Exception:
        return None
    return None

@app.get("/api/search")
def search(q: str = Query(None)):
    if not q:
        return {"results": [], "instant_answer": None}
    
    # DuckDuckGoから「即答」を取得
    instant_answer = get_ddg_answer(q)
    
    # 自前DBからキーワード検索
    query_lower = q.lower()
    local_results = [
        item for item in SEARCH_DATABASE 
        if query_lower in item["title"].lower() or query_lower in item["content"].lower()
    ]
    
    return {
        "results": local_results,
        "instant_answer": instant_answer
    }
