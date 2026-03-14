
import React, { useState, useEffect } from 'react';
import { AnalysisResults, Thresholds } from './types';
import { DEFAULT_THRESHOLDS } from './constants';
import { analyzeAssessment } from './services/psychometricService';
import { getAIInsights } from './services/geminiService';
import FileUpload from './components/FileUpload';
import DashboardOverview from './components/DashboardOverview';
import ItemTable from './components/ItemTable';
import Visualizations from './components/Visualizations';
import ThresholdSettings from './components/ThresholdSettings';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [showSettings, setShowSettings] = useState(false);
  
  // Feature Toggles
  const [aiEnabled, setAiEnabled] = useState(true);

  // Helper for AI Studio safely accessing window
  const getAIStudio = () => (window as any).aistudio;

  // Trigger analysis whenever CSV data or thresholds change
  useEffect(() => {
    if (csvData) {
      try {
        const analysis = analyzeAssessment(csvData, thresholds);
        setResults(analysis);
        setError(null);
      } catch (err: any) {
        setError(err.message || "An error occurred during analysis.");
      }
    }
  }, [csvData, thresholds]);

  const handleDataLoaded = (data: string[][]) => {
    setCsvData(data);
    setAiInsights(null); 
  };

  const generateInsights = async () => {
    if (!results) return;

    setLoadingAI(true);
    try {
      const insights = await getAIInsights(results);
      setAiInsights(insights);
    } catch (err) {
      setError("AI service error. Please check your connection.");
    } finally {
      setLoadingAI(false);
    }
  };

  const exportResults = () => {
    if (!results) return;

    const { reliability, items } = results;
    let csvRows = [];

    csvRows.push("--- REPORT METADATA & SETTINGS ---");
    csvRows.push(`Export Date,${new Date().toLocaleString()}`);
    csvRows.push(`Min Difficulty Threshold,${thresholds.difficulty.min}`);
    csvRows.push(`Max Difficulty Threshold,${thresholds.difficulty.max}`);
    csvRows.push(`Min Discrimination Threshold,${thresholds.discrimination.min}`);
    csvRows.push(`Group Rank Percentage,${(thresholds.groupPercentage * 100).toFixed(0)}%`);
    csvRows.push("");

    csvRows.push("--- TEST SUMMARY STATISTICS ---");
    csvRows.push(`Reliability (KR-20),${reliability.kr20.toFixed(4)}`);
    csvRows.push(`Reliability (KR-21),${reliability.kr21.toFixed(4)}`);
    csvRows.push(`Number of Students (N),${reliability.studentCount}`);
    csvRows.push(`Total Items,${reliability.itemCount}`);
    csvRows.push(`Mean Score,${reliability.meanScore.toFixed(2)}`);
    csvRows.push(`Median Score,${reliability.medianScore.toFixed(2)}`);
    csvRows.push(`Standard Deviation (Sample),${reliability.stdDev.toFixed(4)}`);
    csvRows.push(`Minimum Score,${reliability.minScore}`);
    csvRows.push(`Maximum Score,${reliability.maxScore}`);
    csvRows.push(`Range,${reliability.range}`);
    csvRows.push(`Avg. Difficulty (p),${reliability.avgDifficulty.toFixed(4)}`);
    csvRows.push(`Avg. Discrimination (D),${reliability.avgDiscrimination.toFixed(4)}`);
    csvRows.push("");

    csvRows.push("--- ITEM ANALYSIS DETAILS ---");
    csvRows.push("ItemID,Correct Key,Difficulty (p),Discrimination (D),Flags,Top Distractors");
    
    items.forEach(item => {
      const topDistractors = Object.entries(item.distractorCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 2)
        .map(([opt, count]) => `${opt} (${count})`)
        .join("; ");
      
      const flagsStr = item.flags.length > 0 ? item.flags.join("; ") : "Healthy";
      csvRows.push(`${item.itemId},${item.correctAnswer},${item.difficultyIndex.toFixed(4)},${item.discriminationIndex.toFixed(4)},"${flagsStr}","${topDistractors}"`);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Assessment_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">MCQ Analyzer Pro</h1>
          </div>
          <div className="flex gap-4">
            {results && (
              <button 
                onClick={() => { setResults(null); setCsvData(null); }}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {!results ? (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Validate Your Assessments</h2>
              <p className="text-lg text-slate-600">Empower your testing with enterprise-grade psychometric analytics.</p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} onError={setError} />
            {error && (
              <div className="mt-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Assessment Dashboard</h2>
                <p className="text-slate-500">Analysis completed for {results.reliability.itemCount} items.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${showSettings ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {showSettings ? 'Hide Settings' : 'Settings'}
                </button>
                <button 
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export Report
                </button>
                {aiEnabled && (
                  <button 
                    onClick={generateInsights}
                    disabled={loadingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loadingAI ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Auditing...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Get AI Audit
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {showSettings && (
              <div className="space-y-6 mb-8">
                <ThresholdSettings 
                  thresholds={thresholds} 
                  onThresholdChange={setThresholds} 
                />
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">AI Features</h4>
                        <p className="text-xs text-slate-500">Toggle Gemini insights and manage API keys</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setAiEnabled(!aiEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aiEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DashboardOverview 
              reliability={results.reliability} 
              flaggedCount={results.items.filter(i => i.flags.length > 0).length} 
            />

            {aiEnabled && aiInsights && (
              <div className="bg-slate-900 text-slate-100 p-8 rounded-2xl shadow-xl mb-8 border border-slate-700 animate-in slide-in-from-top duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Executive AI Insight</h3>
                </div>
                <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-blue-400">
                  <div dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            )}

            <Visualizations items={results.items} thresholds={thresholds} />
            <ItemTable items={results.items} />
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">© 2024 MCQ Analyzer Pro • Academic Excellence Through Data</p>
      </footer>
    </div>
  );
};

export default App;
