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

def get_ddg_data(query):
    """DuckDuckGoから即答と、関連ウェブサイトを取得"""
    try:
        url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1"
        res = requests.get(url, timeout=3)
        data = res.json()
        
        results = []
        # RelatedTopicsからウェブサイトのリストを抽出
        for topic in data.get("RelatedTopics", []):
            if "FirstURL" in topic:
                results.append({
                    "title": topic.get("Text", "").split(" - ")[0],
                    "url": topic.get("FirstURL"),
                    "content": topic.get("Text")
                })
        
        instant = None
        if data.get("Abstract"):
            instant = {
                "title": data.get("Heading"),
                "url": data.get("AbstractURL"),
                "content": data.get("Abstract"),
                "source": data.get("AbstractSource", "Wikipedia"),
                "image": data.get("Image")
            }
            
        return results, instant
    except:
        return [], None

@app.get("/api/search")
def search(q: str = Query(None)):
    if not q:
        return {"results": [], "instant_answer": None}
    
    # DuckDuckGoから「サイトリスト」と「即答」を両方取得
    web_results, instant_answer = get_ddg_data(q)
    
    # 自前のデータ（例：自分のブログなど）をここに追加可能
    local_results = [
        {"title": f"{q} についての自作メモ", "url": "https://example.com/notes", "content": "これはローカルデータベースからの結果です。"}
    ]
    
    return {
        "results": web_results + local_results, # サイトリストを合体
        "instant_answer": instant_answer
    }
