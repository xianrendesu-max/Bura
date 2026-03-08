"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowLeft, ArrowRight, RotateCw, Home, ShieldCheck } from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  title: string;
}

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'https://www.wikipedia.org', title: 'Wikipedia' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const addTab = () => {
    const newId = Math.random().toString(36).substring(7);
    const newTab = { id: newId, url: 'https://www.google.com', title: 'New Tab' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setInputUrl(newTab.url);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setInputUrl(newTabs[newTabs.length - 1].url);
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputUrl;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: targetUrl } : t));
  };

  return (
    <div className="flex flex-col h-screen bg-[#dee1e6] select-none">
      {/* --- タブバー --- */}
      <div className="flex items-center px-2 pt-2 gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => { setActiveTabId(tab.id); setInputUrl(tab.url); }}
            className={`
              group relative flex items-center h-9 min-w-[120px] max-w-[240px] px-3 rounded-t-lg cursor-pointer text-xs
              ${activeTabId === tab.id ? 'bg-white text-gray-800' : 'bg-[#bdc1c6] text-gray-700 hover:bg-[#cfd2d7]'}
            `}
          >
            <span className="truncate flex-1 mr-4">{tab.url.replace('https://', '')}</span>
            <X
              size={14}
              className="absolute right-2 p-0.5 rounded-full hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => closeTab(tab.id, e)}
            />
          </div>
        ))}
        <button onClick={addTab} className="p-1.5 hover:bg-gray-300 rounded-full text-gray-600">
          <Plus size={18} />
        </button>
      </div>

      {/* --- ツールバー --- */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex gap-4 text-gray-500">
          <ArrowLeft size={18} className="cursor-not-allowed opacity-30" />
          <ArrowRight size={18} className="cursor-not-allowed opacity-30" />
          <RotateCw size={18} className="cursor-pointer hover:text-black" onClick={() => window.location.reload()} />
          <Home size={18} className="cursor-pointer hover:text-black" />
        </div>

        <form onSubmit={handleNavigate} className="flex-1">
          <div className="flex items-center bg-[#f1f3f4] rounded-full px-4 py-1.5 gap-2 border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-sm">
            <ShieldCheck size={14} className="text-green-600" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="bg-transparent w-full outline-none text-sm text-gray-800"
            />
          </div>
        </form>
      </div>

      {/* --- ブックマークバー (ダミー) --- */}
      <div className="flex items-center px-4 py-1 bg-white border-b border-gray-200 text-[11px] text-gray-600 gap-4">
        <div className="hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1">🌐 Wikipedia</div>
        <div className="hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1">GitHub</div>
        <div className="hover:bg-gray-100 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1">Vercel</div>
      </div>

      {/* --- メインコンテンツ (プロキシ経由iframe) --- */}
      <div className="flex-1 bg-white relative">
        {tabs.map((tab) => (
          <iframe
            key={tab.id}
            src={`/api/proxy?url=${encodeURIComponent(tab.url)}`}
            className={`w-full h-full border-none ${activeTabId === tab.id ? 'block' : 'hidden'}`}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        ))}
      </div>
    </div>
  );
}
