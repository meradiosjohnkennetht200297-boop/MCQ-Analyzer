
import React, { useRef } from 'react';
import { SAMPLE_CSV_TEMPLATE } from '../constants';

interface FileUploadProps {
  onDataLoaded: (data: string[][]) => void;
  onError: (msg: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Split into lines, filter empty, then split columns and trim
      const rows = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "")
        .map(line => line.split(',').map(cell => cell.trim()));

      if (rows.length < 3) {
        onError("Invalid file structure. Need at least Header, Key, and 1 Student row.");
        return;
      }
      onDataLoaded(rows);
    };
    reader.onerror = () => onError("Error reading file.");
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcq_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="max-w-xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-blue-50 p-4 rounded-full">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Assessment Data</h2>
        <p className="text-slate-500 mb-8">Select a CSV file containing student responses and the answer key.</p>
        
        <div className="space-y-4">
          <label className="relative group cursor-pointer block">
            <div className="flex items-center justify-center border-2 border-dashed border-slate-300 group-hover:border-blue-500 bg-slate-50 group-hover:bg-blue-50 transition-all duration-200 py-10 rounded-xl">
              <span className="text-slate-600 font-medium group-hover:text-blue-600">Choose file or drag here</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".csv"
            />
          </label>
          
          <div className="flex justify-center gap-4 text-sm font-medium">
            <button 
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Download Template CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
