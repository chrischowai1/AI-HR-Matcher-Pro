
import React from 'react';
import { AnalysisResult } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Trophy, 
  FileText, 
  BarChart3, 
  Target, 
  Zap,
  ChevronRight
} from 'lucide-react';

interface AnalysisCardProps {
  result: AnalysisResult;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-100 bg-emerald-50/30';
    if (score >= 60) return 'text-amber-500 border-amber-100 bg-amber-50/30';
    return 'text-rose-600 border-rose-100 bg-rose-50/30';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const scoreColorClass = getScoreColor(result.match_score);
  const progressColorClass = getProgressColor(result.match_score);

  return (
    <div 
      id={`report-${result.filename.replace(/\s+/g, '-')}`}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-20 last:mb-0 scroll-mt-24 transition-all hover:shadow-2xl"
    >
      {/* Header Info Banner */}
      <div className="bg-gray-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg truncate max-w-[250px] md:max-w-md">
              {result.filename}
            </h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Candidate Analysis Report</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/30">
             VERIFIED BY GEMINI 3 PRO
           </span>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {/* Main Score Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 items-center">
          {/* Big Radial Score */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                <circle
                  cx="96" cy="96" r="88" strokeWidth="12" fill="transparent"
                  strokeDasharray={553}
                  strokeDashoffset={553 - (553 * result.match_score) / 100}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out stroke-current ${scoreColorClass.split(' ')[0]}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-black ${scoreColorClass.split(' ')[0]}`}>{result.match_score}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Match Index</span>
              </div>
            </div>
            <div className={`mt-6 px-6 py-2 rounded-full font-black text-sm border-2 ${scoreColorClass}`}>
               {result.match_score >= 80 ? '👑 極力推薦' : result.match_score >= 60 ? '👍 值得面試' : '⚠️ 需謹慎評估'}
            </div>
          </div>

          {/* Competency Bars & Summary */}
          <div className="lg:col-span-8">
            <h4 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
               <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
               核心能力圖譜
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {result.dimensions.map((dim, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-gray-600 uppercase tracking-tight">{dim.name}</span>
                    <span className="text-xs font-bold text-gray-400">{dim.score}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 delay-300 ${getProgressColor(dim.score)}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
               <p className="text-gray-700 font-medium italic leading-relaxed text-lg">
                 " {result.summary} "
               </p>
            </div>
          </div>
        </div>

        {/* SWOT Style Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-emerald-50/30 p-8 rounded-[2rem] border border-emerald-100/50">
            <h5 className="text-emerald-800 font-black text-xl mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              候選人優勢
            </h5>
            <ul className="space-y-4">
              {result.pros.map((pro, i) => (
                <li key={i} className="flex gap-3 group">
                  <ChevronRight className="w-5 h-5 text-emerald-500 mt-0.5 group-hover:translate-x-1 transition-transform" />
                  <span className="text-emerald-900 font-medium leading-relaxed">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-50/30 p-8 rounded-[2rem] border border-rose-100/50">
            <h5 className="text-rose-800 font-black text-xl mb-6 flex items-center gap-3">
              <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              缺失或風險
            </h5>
            <ul className="space-y-4">
              {result.cons.map((con, i) => (
                <li key={i} className="flex gap-3 group">
                  <ChevronRight className="w-5 h-5 text-rose-500 mt-0.5 group-hover:translate-x-1 transition-transform" />
                  <span className="text-rose-900 font-medium leading-relaxed">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interview Guide */}
        <div className="border-t border-gray-100 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h5 className="text-indigo-900 font-black text-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Target className="w-6 h-6" />
              </div>
              面試攻略建議
            </h5>
            <span className="text-xs font-bold text-gray-400">NEXT STEP: SCREENING</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.interview_questions.map((q, i) => (
              <div key={i} className="group relative p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg">
                  {i + 1}
                </div>
                <p className="text-gray-700 font-bold leading-relaxed pt-2">
                  {q}
                </p>
                <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 rounded-full bg-indigo-50 text-indigo-500">
                     <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
