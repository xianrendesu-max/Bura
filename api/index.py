from fastapi import FastAPI, Query

app = FastAPI()

# 検索対象のデータ（中級編として、ここを後に外部APIやファイル読み込みに変えられます）
SEARCH_DATABASE = [
    {"id": 1, "title": "Next.js 14 の使い方", "url": "https://nextjs.org", "content": "App Routerやサーバーコンポーネントの基本を学びます。"},
    {"id": 2, "title": "VercelでPythonを動かす", "url": "https://vercel.com/docs", "content": "Serverless Functionsを使ってPython APIを構築する方法。"},
    {"id": 3, "title": "FastAPI 公式ドキュメント", "url": "https://fastapi.tiangolo.com", "content": "Pythonの高速なWebフレームワーク。自動でSwagger UIも生成されます。"},
    {"id": 4, "title": "Tailwind CSS デザイン集", "url": "https://tailwindcss.com", "content": "モダンなUIを素早く構築するためのCSSフレームワーク。"},
]

@app.get("/api/search")
def search(q: str = Query(None)):
    if not q:
        return {"results": []}
    
    query = q.lower()
    results = [
        item for item in SEARCH_DATABASE 
        if query in item["title"].lower() or query in item["content"].lower()
    ]
    return {"results": results}
