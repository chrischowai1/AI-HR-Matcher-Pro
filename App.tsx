
import React, { useState, useCallback } from 'react';
import { Upload, FileText, Search, Loader2, AlertTriangle, Github, Trash2, FileSearch, ArrowRight, TrendingUp } from 'lucide-react';
import { AppStatus, AnalysisResult, FileData } from './types';
import { parseFile } from './services/fileParser';
import { analyzeCVMatch } from './services/geminiService';
import AnalysisCard from './components/AnalysisCard';

const App: React.FC = () => {
  const [jd, setJd] = useState('');
  const [cvFiles, setCvFiles] = useState<FileData[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isDraggingJD, setIsDraggingJD] = useState(false);
  const [isDraggingCV, setIsDraggingCV] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    setStatus(AppStatus.PARSING);
    setError(null);
    const newFiles: FileData[] = [];
    
    for (const file of Array.from(files)) {
      try {
        const data = await parseFile(file);
        newFiles.push(data);
      } catch (err: any) {
        setError(err.message || '檔案解析失敗');
      }
    }
    
    setCvFiles(prev => [...prev, ...newFiles]);
    setStatus(AppStatus.IDLE);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleJDUpload = async (file: File) => {
    try {
      const data = await parseFile(file);
      setJd(data.text);
    } catch (err: any) {
      setError('JD 檔案讀取失敗');
    }
  };

  const removeCV = (id: string) => {
    setCvFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (!jd.trim()) {
      setError('請輸入或上傳職位描述 (JD)');
      return;
    }
    if (cvFiles.length === 0) {
      setError('請至少上傳一份簡歷文件 (CV)');
      return;
    }

    setStatus(AppStatus.ANALYZING);
    setError(null);
    setResults([]);

    try {
      const batchResults: AnalysisResult[] = [];
      for (const cv of cvFiles) {
        const res = await analyzeCVMatch(jd, cv.text);
        batchResults.push({ ...res, filename: cv.name });
      }
      setResults(batchResults);
      setStatus(AppStatus.SUCCESS);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'AI 分析過程中發生錯誤');
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setResults([]);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  const scrollToReport = (filename: string) => {
    const id = `report-${filename.replace(/\s+/g, '-')}`;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-black text-indigo-700 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Search className="w-8 h-8" />
            </div>
            AI HR Matcher Pro
          </h1>
          <p className="text-gray-500 mt-2 font-medium">智能批量人崗匹配 · 快速篩選最佳候選人</p>
        </div>
        <div className="flex items-center gap-3">
           <a href="https://github.com" target="_blank" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
             <Github className="w-6 h-6" />
           </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-lg font-black flex items-center gap-2 text-gray-800">
              <FileText className="w-5 h-5 text-indigo-600" />
              1. 職位描述 (JD)
            </label>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">TEXT / PDF / DOCX</span>
          </div>
          
          <div 
            className={`relative transition-all duration-300 rounded-2xl overflow-hidden border-2 shadow-sm ${isDraggingJD ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10' : 'border-gray-100'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingJD(true); }}
            onDragLeave={() => setIsDraggingJD(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingJD(false);
              const file = e.dataTransfer.files[0];
              if (file) handleJDUpload(file);
            }}
          >
            <textarea
              className="w-full h-[400px] p-6 focus:ring-0 transition-all outline-none text-base leading-relaxed resize-none block bg-white"
              placeholder="請粘貼職位描述內容，或將 JD 文件拖放至此..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
            {isDraggingJD && (
              <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 text-indigo-600 font-black border border-indigo-100 animate-in zoom-in">
                  <Upload className="w-10 h-10 animate-bounce" />
                  放開以讀取 JD
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-lg font-black flex items-center gap-2 text-gray-800">
              <Upload className="w-5 h-5 text-indigo-600" />
              2. 上傳簡歷 (CV)
            </label>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">BATCH PDF / DOCX</span>
          </div>
          
          <div 
            className={`
              relative border-2 border-dashed rounded-2xl h-[400px] flex flex-col transition-all duration-300 overflow-hidden shadow-sm
              ${isDraggingCV ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10' : 'bg-white border-gray-200 hover:border-indigo-400'}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingCV(true); }}
            onDragLeave={() => setIsDraggingCV(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingCV(false);
              if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
            }}
          >
            {cvFiles.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <span className="text-sm font-black text-gray-700">候選清單 ({cvFiles.length})</span>
                  <label className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
                    繼續添加
                    <input type="file" className="hidden" multiple accept=".pdf,.docx" onChange={handleCVUpload} />
                  </label>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/20">
                  {cvFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl group hover:border-indigo-300 hover:shadow-md transition-all animate-in slide-in-from-right-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{file.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeCV(file.id)}
                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center group">
                <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Upload className="w-12 h-12 text-indigo-500" />
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-black text-gray-800">拖放多份簡歷到此</span>
                  <span className="block text-sm font-medium text-gray-400 mt-2">支援 PDF 與 Word 格式</span>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple
                  accept=".pdf,.docx" 
                  onChange={handleCVUpload}
                />
              </label>
            )}

            {isDraggingCV && (
              <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                 <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 text-indigo-600 font-black border border-indigo-100 animate-in zoom-in">
                  <Upload className="w-10 h-10 animate-bounce" />
                  放開以添加簡歷
                </div>
              </div>
            )}

            {status === AppStatus.PARSING && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-indigo-800 font-black tracking-wide">正在解析文件...</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        {error && (
          <div className="flex items-center gap-3 text-rose-600 bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 animate-in bounce-in">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-black">{error}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={status === AppStatus.ANALYZING || !jd || cvFiles.length === 0}
          className={`
            px-16 py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition-all flex items-center gap-4
            ${status === AppStatus.ANALYZING || !jd || cvFiles.length === 0 
              ? 'bg-indigo-200 cursor-not-allowed scale-95 opacity-50' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-indigo-500/40 active:scale-95'}
          `}
        >
          {status === AppStatus.ANALYZING ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              智能分析中...
            </>
          ) : (
            <>
              <FileSearch className="w-8 h-8" />
              開始分析 ({cvFiles.length} 份簡歷)
            </>
          )}
        </button>
      </div>

      {(results.length > 0 || status === AppStatus.ANALYZING) && (
        <div className="mt-20 pt-20 border-t border-gray-100" id="results-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                篩選結果匯總
                <span className="text-base font-bold text-indigo-600 bg-indigo-50 px-4 py-1 rounded-full">
                  AI 智能評估
                </span>
              </h2>
              <p className="text-gray-500 mt-2 font-medium">基於 Gemini 3 Pro 模型深度解析 JD 與 CV 契合度</p>
            </div>
            {results.length > 0 && (
              <button onClick={reset} className="text-sm font-bold text-rose-500 hover:underline flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> 清除所有結果
              </button>
            )}
          </div>

          {/* Quick Comparison Table */}
          {results.length > 1 && (
            <div className="mb-16 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-6 bg-gray-900 text-white flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-black">候選人快速比對表</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">候選人文件名</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">匹配分數</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.sort((a,b) => b.match_score - a.match_score).map((res, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-5 font-bold text-gray-800">{res.filename}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${res.match_score >= 80 ? 'bg-emerald-500' : res.match_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${res.match_score}%` }}
                              />
                            </div>
                            <span className={`font-black ${res.match_score >= 80 ? 'text-emerald-600' : res.match_score >= 60 ? 'text-amber-500' : 'text-rose-600'}`}>
                              {res.match_score}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => scrollToReport(res.filename)}
                            className="text-indigo-600 font-black text-xs flex items-center gap-1 ml-auto hover:gap-2 transition-all"
                          >
                            查看報告 <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="space-y-20">
            {results.map((res, index) => (
              <AnalysisCard key={index} result={res} />
            ))}
            
            {status === AppStatus.ANALYZING && (
              <div className="p-20 border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300 animate-pulse bg-gray-50/30">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full animate-ping"></div>
                  <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
                </div>
                <p className="text-xl font-black text-indigo-900/40">
                  正在生成第 {results.length + 1} 份報告...
                </p>
                <p className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-widest">Processing in Batch Mode</p>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-32 text-center border-t border-gray-100 pt-12">
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-left">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered By</p>
             <p className="text-sm font-bold text-gray-700">Google Gemini 3 Pro</p>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-left">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Designed For</p>
             <p className="text-sm font-bold text-gray-700">Enterprise HR Tech</p>
          </div>
        </div>
        <p className="text-gray-400 text-xs font-medium italic">© 2024 AI HR Matcher Pro. 智能分析結果僅供參考。請由專業招募經理進行最終評估。</p>
      </footer>
    </div>
  );
};

export default App;
