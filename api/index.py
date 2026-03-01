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

# 自作の検索対象データベース
SEARCH_DATABASE = [
    {"id": 1, "title": "MySearch プロジェクトについて", "url": "https://example.com/about", "content": "VercelとFastAPIで作られた次世代のプライベート検索エンジンです。"},
    {"id": 2, "title": "DuckDuckGo APIの仕様", "url": "https://duckduckgo.com/api", "content": "Instant Answer APIを使用すると、Wikipediaなどの要約を即座に取得できます。"}
]

def get_ddg_answer(query):
    """DuckDuckGo Instant Answer APIを叩く"""
    try:
        url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
        response = requests.get(url, timeout=3)
        data = response.json()
        
        # Abstract（要約文）がある場合のみ抽出
        if data.get("Abstract"):
            return {
                "title": data.get("Heading"),
                "url": data.get("AbstractURL"),
                "content": data.get("Abstract"),
                "source": data.get("AbstractSource", "Wikipedia"),
                "image": data.get("Image") # 関連画像があれば取得
            }
    except Exception:
        return None
    return None

@app.get("/api/search")
def search(q: str = Query(None)):
    if not q:
        return {"results": [], "instant_answer": None}
    
    # DDG APIから即答を取得
    instant_answer = get_ddg_answer(q)
    
    # 自前DBからキーワード検索
    query = q.lower()
    local_results = [
        item for item in SEARCH_DATABASE 
        if query in item["title"].lower() or query in item["content"].lower()
    ]
    
    return {
        "results": local_results,
        "instant_answer": instant_answer
    }
