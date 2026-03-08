from fastapi import FastAPI, Response, Query
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import uvicorn

app = FastAPI()

@app.get("/api/proxy")
def proxy(url: str = Query(...)):
    try:
        # ユーザーエージェントを偽装してブロックを回避
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # 文字コードの自動判定
        response.encoding = response.apparent_encoding
        
        soup = BeautifulSoup(response.text, "html.parser")

        # 相対パス（/style.cssなど）を絶対パス（https://example.com/style.css）に置換
        for tag in soup.find_all(['img', 'script', 'source', 'embed'], src=True):
            tag['src'] = urljoin(url, tag['src'])
            
        for tag in soup.find_all(['a', 'link', 'area'], href=True):
            # 内部リンクもプロキシを通すように書き換える場合はここを調整
            tag['href'] = urljoin(url, tag['href'])

        # レスポンスからセキュリティヘッダーを削除した状態でHTMLを返す
        content = soup.prettify()
        return Response(content=content, media_type="text/html")

    except Exception as e:
        return Response(content=f"<html><body><h1>Proxy Error</h1><p>{str(e)}</p></body></html>", status_code=500, media_type="text/html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
