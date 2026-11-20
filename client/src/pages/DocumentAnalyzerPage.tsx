import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { DocumentItem } from '../types';
import {
  FileText,
  Upload,
  Camera,
  Sparkles,
  Trash2,
  Send,
  CheckCircle2,
  Bot,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

export const DocumentAnalyzerPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents);
      if (res.documents.length > 0 && !selectedDoc) {
        setSelectedDoc(res.documents[0]);
      }
    } catch (err) {
      console.warn('Failed to load documents:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadDocument(file);
      setDocuments(prev => [res.document, ...prev]);
      setSelectedDoc(res.document);
      setQaHistory([]);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedDoc || isAnswering) return;

    const currentQ = question;
    setQuestion('');
    setIsAnswering(true);

    try {
      const res = await api.askDocumentQuestion(selectedDoc.id, currentQ);
      setQaHistory(prev => [...prev, { q: currentQ, a: res.answer }]);
    } catch (err: any) {
      setQaHistory(prev => [
        ...prev,
        { q: currentQ, a: `⚠️ Error answering query: ${err.message}` },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteDocument(id);
      const remaining = documents.filter(d => d.id !== id);
      setDocuments(remaining);
      if (selectedDoc?.id === id) {
        setSelectedDoc(remaining.length > 0 ? remaining[0] : null);
        setQaHistory([]);
      }
    } catch (err: any) {
      alert('Error deleting document: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Header Section from Stitch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5 animate-pulse"></span>
              Multimodal Vision & Document Core v4.2
            </span>
            <span className="text-xs text-on-surface-variant dark:text-nexora-muted">• Instant Bio & Semantic Analysis</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
            Document Intelligence & Plate Vision Analyzer
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant dark:text-nexora-muted mt-1">
            Upload PDFs, study guides, research papers, or meal photos to extract structured takeaways, macros, and query your materials directly with AI.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dropzone + Document History (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dropzone Module from Stitch */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative group rounded-3xl p-6 bg-surface-container-lowest dark:bg-nexora-surface border-2 border-dashed border-outline-variant/50 dark:border-nexora-border hover:border-secondary dark:hover:border-nexora-cyan shadow-sm hover:shadow-xl transition-all cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.json,.png,.jpg,.jpeg"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-surface-container-low dark:bg-nexora-card group-hover:bg-surface-container dark:group-hover:bg-nexora-card-hover transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary-container/10 dark:bg-nexora-violet/20 flex items-center justify-center text-primary dark:text-nexora-violet mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-title-md text-sm font-bold text-primary dark:text-white">
                Drag your document or meal photo here
              </p>
              <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted mt-1">
                Supports PDF, TXT, MD, PNG, JPG up to 10MB
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-container text-on-primary dark:bg-nexora-violet text-xs font-semibold shadow hover:bg-primary transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Browse / Snap Camera</span>
                </button>
              </div>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-nexora-surface/80 backdrop-blur-xs rounded-3xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary dark:text-nexora-cyan">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Extracting text & neural summary...</span>
                </div>
              </div>
            )}
          </div>

          {/* Document History List */}
          <div className="rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
              Document & Scan History ({documents.length})
            </h3>

            <div className="space-y-2">
              {documents.map(doc => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setQaHistory([]);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-secondary-container/20 border-secondary dark:border-nexora-cyan'
                        : 'bg-surface-container-low dark:bg-nexora-card border-outline-variant/20 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <FileText className="w-4 h-4 text-primary dark:text-white shrink-0" />
                      <span className="text-xs font-semibold text-primary dark:text-white truncate">
                        {doc.file_name}
                      </span>
                    </div>

                    <button
                      onClick={e => handleDeleteDocument(doc.id, e)}
                      className="text-outline hover:text-error transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Q&A Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDoc ? (
            <>
              {/* Analysis Executive Summary Card */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 dark:border-nexora-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary dark:text-nexora-cyan" />
                    <h2 className="font-headline-md text-base font-bold text-primary dark:text-white truncate max-w-sm">
                      {selectedDoc.file_name}
                    </h2>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-nexora-bg text-secondary dark:text-nexora-cyan">
                    Processed
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-nexora-muted leading-relaxed">
                    {selectedDoc.summary}
                  </p>
                </div>

                {/* Key Points Badges */}
                {selectedDoc.key_points && selectedDoc.key_points.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-2">
                      Key Structural Takeaways
                    </h3>
                    <div className="space-y-1.5">
                      {selectedDoc.key_points.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-primary dark:text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-secondary dark:text-nexora-cyan shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Q&A With Document */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                  Query This Document with AI
                </h3>

                {qaHistory.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {qaHistory.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-nexora-violet ml-auto max-w-[85%] font-medium">
                          {item.q}
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low dark:bg-nexora-card text-on-surface dark:text-nexora-text mr-auto max-w-[90%] border border-outline-variant/20 leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Ask anything about "${selectedDoc.file_name}"...`}
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <button
                    type="submit"
                    disabled={isAnswering || !question.trim()}
                    className="p-2.5 rounded-2xl bg-primary-container text-on-primary dark:bg-nexora-violet shadow hover:bg-primary transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-16 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border p-8">
              <FileText className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="text-sm font-semibold text-primary dark:text-white">
                No document selected.
              </p>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1">
                Upload a document or select an item from your history to view analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
