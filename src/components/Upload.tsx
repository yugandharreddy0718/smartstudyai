import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload as UploadIcon, FileText, Image as ImageIcon, Sparkles, X, BrainCircuit, BookOpen, Lightbulb, GraduationCap, CheckCircle2, RotateCcw, ChevronLeft, HelpCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';
import { cleanMathText } from '../lib/mathUtils';
import ReactMarkdown from 'react-markdown';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // States for Master Quiz
  const [activeView, setActiveView] = useState<'summary' | 'quiz'>('summary');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizCurrentIndex, setQuizCurrentIndex] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const handleSaveAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const summaryHtml = document.querySelector('.markdown-body')?.innerHTML || '';
    const title = result?.text ? result.text.replace(/\.[^/.]+$/, "") : "Study Summary";

    printWindow.document.write(`
      <html>
        <head>
          <title>\${title} - AI Summary</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              line-height: 1.6;
              padding: 40px;
              max-width: 850px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: -0.05em;
            }
            .meta {
              font-size: 12px;
              color: #64748b;
              text-align: right;
            }
            h1, h2, h3, h4 {
              color: #0f172a;
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            h1 { font-size: 28px; margin-top: 0; }
            h2 { font-size: 22px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            h3 { font-size: 18px; }
            p { margin-bottom: 1.2em; }
            ul, ol { margin-bottom: 1.5em; padding-left: 20px; }
            li { margin-bottom: 0.5em; }
            code {
              font-family: monospace;
              background-color: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.9em;
            }
            pre {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 16px;
              border-radius: 8px;
              overflow-x: auto;
              margin-bottom: 1.5em;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            blockquote {
              border-left: 4px solid #e2e8f0;
              padding-left: 16px;
              margin-left: 0;
              color: #475569;
              font-style: italic;
            }
            @media print {
              body { padding: 20px; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">SmartStudy AI</div>
              <div style="font-size: 14px; font-weight: 600; color: #64748b;">AI Lesson Lab Summary</div>
            </div>
            <div class="meta">
              <div>Source: \${title}</div>
              <div>Generated: \${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="content">
            \${summaryHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleLaunchMasterQuiz = async () => {
    if (quizQuestions.length > 0) {
      setActiveView('quiz');
      return;
    }

    setLoadingQuiz(true);
    setError(null);
    try {
      const questions = await geminiService.generateQuiz(result.summary, 5);
      if (!questions || questions.length === 0) {
        throw new Error("Could not generate quiz questions. Please try again.");
      }
      setQuizQuestions(questions);
      setQuizAnswers({});
      setQuizCurrentIndex(0);
      setQuizSubmitted(false);
      setActiveView('quiz');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate master quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setActiveView('summary');
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizCurrentIndex(0);
    setQuizSubmitted(false);
  };

  const isCorrect = (selected: string, correct: string) => {
    if (!selected || !correct) return false;
    const s = selected.trim().toLowerCase();
    const c = correct.trim().toLowerCase();
    return s === c || c.includes(s) || s.includes(c);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (isCorrect(quizAnswers[i], q.correctAnswer)) {
        score++;
      }
    });
    return score;
  };

  const getReviewDetails = (score: number) => {
    const total = quizQuestions.length;
    const percent = Math.round((score / total) * 100);
    if (percent === 100) {
      return {
        title: "Outstanding! Perfect Score! 🏆",
        review: "You've fully mastered this study material with a perfect result. Excellent work!"
      };
    } else if (percent >= 80) {
      return {
        title: "Excellent Work! 🌟",
        review: "Great job! You have a solid grasp of the core concepts in this lesson."
      };
    } else if (percent >= 50) {
      return {
        title: "Good Effort! 👍",
        review: "You understand the basics, but review the summary to lock in the rest of the details."
      };
    } else {
      return {
        title: "Keep Practicing! 💪",
        review: "This is a tough topic. Re-read the summary and try the quiz again to improve your score!"
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      // Helper function to read file as base64
      const fileToBase64 = (f: File): Promise<{ mimeType: string, data: string }> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const resultString = reader.result as string;
            const commaIndex = resultString.indexOf(',');
            const base64Data = commaIndex !== -1 ? resultString.slice(commaIndex + 1) : resultString;
            resolve({
              mimeType: f.type || 'image/jpeg',
              data: base64Data
            });
          };
          reader.onerror = () => reject(new Error("Failed to read the file. Please try another file."));
          reader.readAsDataURL(f);
        });
      };

      const fileData = await fileToBase64(file);
      const summary = await geminiService.generateSummaryFromMultimodal(fileData);
      
      if (!summary) {
        throw new Error("Could not extract insights from this file. Please try a clearer image or a different file type.");
      }
      
      setResult({ text: file.name, summary });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-3">
        <h2 className="font-display font-bold text-5xl tracking-tight text-slate-900">AI Lesson Lab</h2>
        <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Upload your notes or textbook pages to generate instant summaries, quizzes, and deep insights.</p>
      </div>

      {!result ? (
        <div className="relative">
          <div 
            className={cn(
              "p-16 md:p-24 rounded-[4rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-8 relative overflow-hidden group",
              file ? "border-brand-primary bg-brand-primary/5 shadow-2xl" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white shadow-sm"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files[0];
              if (dropped) setFile(dropped);
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-brand-primary)_1px,_transparent_1px)] bg-[length:24px_24px]" />
            </div>

            <div className={cn(
              "w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl", 
              file ? "bg-slate-900 text-white scale-110 rotate-[-5deg]" : "bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-brand-primary group-hover:rotate-[5deg]"
            )}>
              <UploadIcon className="w-12 h-12 stroke-[2.5]" />
            </div>
            
            {file ? (
              <div className="text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm mb-4 animate-float">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <p className="font-bold text-slate-700 text-sm">{file.name}</p>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
                  Ready for AI Analysis • {(file.size / 1024).toFixed(1)} KB
                </p>
                <button 
                  onClick={() => setFile(null)}
                  className="mt-6 text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-2 mx-auto px-4 py-2 bg-rose-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  <X className="w-4 h-4" /> RE-UPLOAD
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 relative z-10">
                <p className="font-display font-bold text-2xl text-slate-900">Drop your study material here</p>
                <p className="text-slate-400 font-medium">Supports high-res JPG, PNG, and PDF files</p>
                <div className="pt-6">
                   <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-full">
                     Max 10MB per file
                   </div>
                </div>
              </div>
            )}

            <input 
              type="file" 
              className="hidden" 
              id="file-upload" 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            {!file && (
              <label 
                htmlFor="file-upload"
                className="mt-4 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold cursor-pointer hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 relative z-10"
              >
                Choose File
              </label>
            )}

            {file && (
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-8 bg-brand-primary text-white px-14 py-5 rounded-[2rem] font-bold flex items-center gap-4 shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 relative z-10 transition-all"
              >
                {analyzing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Extract Insights
                  </>
                )}
              </button>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3"
              >
                <X className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Analysis Main Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
               
               <div className="flex items-center justify-between mb-10 relative z-10">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-900 text-brand-primary rounded-2xl flex items-center justify-center shadow-lg">
                     <BrainCircuit className="w-7 h-7" />
                   </div>
                   <div>
                     <h3 className="font-display font-bold text-3xl tracking-tight">
                       {activeView === 'summary' ? 'AI Summary' : 'Master Quiz'}
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {activeView === 'summary' ? 'Optimized for quick reading' : 'Interactive Concept Challenge'}
                     </p>
                   </div>
                 </div>
                 <button onClick={handleReset} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90">
                    <RotateCcw className="w-5 h-5" />
                 </button>
               </div>

               {activeView === 'summary' ? (
                 <>
                   <div className="markdown-body relative z-10 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner min-h-[300px]">
                      <ReactMarkdown>{cleanMathText(result.summary)}</ReactMarkdown>
                   </div>

                   <div className="mt-10 flex gap-4 relative z-10">
                      <button 
                        onClick={handleLaunchMasterQuiz}
                        disabled={loadingQuiz}
                        className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:scale-102 transition-all shadow-xl shadow-slate-900/10 active:scale-98 disabled:opacity-75 cursor-pointer"
                      >
                        {loadingQuiz ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating Quiz...
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-6 h-6 text-brand-primary" />
                            Launch Master Quiz
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleSaveAsPDF}
                        className="px-8 bg-white border-2 border-slate-100 py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:border-slate-200 transition-all active:scale-98 cursor-pointer"
                      >
                        <FileText className="w-6 h-6 text-slate-400" />
                        <span className="hidden md:inline">Save as PDF</span>
                      </button>
                   </div>
                 </>
               ) : (
                 <div className="space-y-8 relative z-10">
                   <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                     <button 
                       onClick={() => setActiveView('summary')}
                       className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                     >
                       <ChevronLeft className="w-4 h-4" /> BACK TO SUMMARY
                     </button>
                     <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                       {quizSubmitted ? "Review Mode" : `Question ${quizCurrentIndex + 1} of ${quizQuestions.length}`}
                     </span>
                   </div>

                   {!quizSubmitted ? (
                     <div className="space-y-6">
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-brand-primary transition-all duration-300"
                           style={{ width: `${((quizCurrentIndex + 1) / quizQuestions.length) * 100}%` }}
                         />
                       </div>

                       <div className="p-6 md:p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                         <p className="font-display font-semibold text-lg text-slate-800 leading-relaxed">
                           {quizQuestions[quizCurrentIndex]?.question}
                         </p>
                       </div>

                       <div className="grid grid-cols-1 gap-3">
                         {quizQuestions[quizCurrentIndex]?.options.map((option: string, idx: number) => {
                           const isSelected = quizAnswers[quizCurrentIndex] === option;
                           return (
                             <button
                               key={idx}
                               onClick={() => {
                                 setQuizAnswers(prev => ({ ...prev, [quizCurrentIndex]: option }));
                               }}
                               className={cn(
                                 "w-full text-left p-5 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between group cursor-pointer",
                                 isSelected 
                                   ? "bg-brand-primary/5 border-brand-primary text-slate-900 shadow-sm" 
                                   : "bg-white border-slate-100 text-slate-650 hover:border-slate-300 hover:bg-slate-50/50"
                               )}
                             >
                               <span className="flex-1 pr-4">{option}</span>
                               <div className={cn(
                                 "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                 isSelected 
                                   ? "border-brand-primary bg-brand-primary text-white" 
                                   : "border-slate-300 group-hover:border-slate-400"
                               )}>
                                 {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                               </div>
                             </button>
                           );
                         })}
                       </div>

                       <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                         <button
                           disabled={quizCurrentIndex === 0}
                           onClick={() => setQuizCurrentIndex(prev => prev - 1)}
                           className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                         >
                           Previous
                         </button>

                         {quizCurrentIndex < quizQuestions.length - 1 ? (
                           <button
                             disabled={!quizAnswers[quizCurrentIndex]}
                             onClick={() => setQuizCurrentIndex(prev => prev + 1)}
                             className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                           >
                             Next
                           </button>
                         ) : (
                           <button
                             disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                             onClick={() => setQuizSubmitted(true)}
                             className="px-10 py-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-40 cursor-pointer"
                           >
                             Submit Quiz
                           </button>
                         )}
                       </div>
                     </div>
                   ) : (
                     <div className="space-y-8 animate-fadeIn">
                       {(() => {
                         const score = calculateScore();
                         const percent = Math.round((score / quizQuestions.length) * 100);
                         const reviewDetails = getReviewDetails(score);

                         return (
                           <div className="text-center p-8 md:p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-6">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Quiz Result</p>
                             
                             <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                               <svg className="w-full h-full transform -rotate-90">
                                 <circle
                                   cx="64"
                                   cy="64"
                                   r="52"
                                   stroke="#f1f5f9"
                                   strokeWidth="10"
                                   fill="transparent"
                                 />
                                 <circle
                                   cx="64"
                                   cy="64"
                                   r="52"
                                   stroke={percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444"}
                                   strokeWidth="10"
                                   fill="transparent"
                                   strokeDasharray={2 * Math.PI * 52}
                                   strokeDashoffset={2 * Math.PI * 52 * (1 - percent / 100)}
                                   className="transition-all duration-1000 ease-out"
                                 />
                               </svg>
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-4xl font-display font-extrabold text-slate-950">{score}</span>
                                 <span className="text-[10px] font-bold text-slate-400">out of {quizQuestions.length}</span>
                               </div>
                             </div>

                             <div className="space-y-2">
                               <h4 className="font-display font-bold text-xl text-slate-900">{reviewDetails.title}</h4>
                               <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                                 {reviewDetails.review}
                               </p>
                             </div>

                             <div className="flex justify-center gap-3 pt-2">
                               <button
                                 onClick={() => {
                                   setQuizAnswers({});
                                   setQuizCurrentIndex(0);
                                   setQuizSubmitted(false);
                                 }}
                                 className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                               >
                                 Retake Quiz
                               </button>
                               <button
                                 onClick={() => setActiveView('summary')}
                                 className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                               >
                                 Back to Summary
                               </button>
                             </div>
                           </div>
                         );
                       })()}

                       <div className="space-y-4">
                         <h4 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wider">Answer Breakdown</h4>
                         
                         <div className="space-y-4">
                           {quizQuestions.map((q: any, i: number) => {
                             const selected = quizAnswers[i];
                             const correct = q.correctAnswer;
                             const correctMatched = isCorrect(selected, correct);

                             return (
                               <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 space-y-4 font-sans">
                                 <div className="flex items-start justify-between gap-4">
                                   <div className="flex items-start gap-3">
                                     <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5 font-mono">Q{i + 1}</span>
                                     <p className="font-bold text-xs text-slate-850 leading-relaxed">{q.question}</p>
                                   </div>
                                   <span className={cn(
                                     "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0",
                                     correctMatched 
                                       ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                       : "bg-rose-50 text-rose-600 border border-rose-100"
                                   )}>
                                     {correctMatched ? "Correct" : "Incorrect"}
                                   </span>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-6">
                                   <div className="p-3 bg-slate-50 rounded-xl">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Answer</p>
                                     <p className={cn("font-bold", correctMatched ? "text-emerald-600" : "text-rose-600")}>
                                       {selected || "None"}
                                     </p>
                                   </div>
                                   {!correctMatched && (
                                     <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Correct Answer</p>
                                       <p className="font-bold text-emerald-600">
                                         {correct}
                                       </p>
                                     </div>
                                   )}
                                 </div>

                                 <div className="p-4 bg-slate-50/50 rounded-xl border border-dotted border-slate-200 text-xs ml-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
                                    <p className="text-slate-600 leading-relaxed font-semibold">{q.explanation}</p>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
               <h4 className="font-display font-bold text-xl px-2">Knowledge Sprites</h4>
               <div className="grid grid-cols-1 gap-3">
                 <AnalysisAddon icon={Lightbulb} label="Key Topics" desc="Main concepts found" color="text-yellow-500 bg-yellow-50" />
                 <AnalysisAddon icon={CheckCircle2} label="Study Guide" desc="Step-by-step notes" color="text-emerald-500 bg-emerald-50" />
                 <AnalysisAddon icon={Sparkles} label="Simplifier" desc="Explained for kids" color="text-rose-500 bg-rose-50" />
                 <AnalysisAddon icon={BookOpen} label="Flashcards" desc="12 terms identified" color="text-indigo-500 bg-indigo-50" />
               </div>
            </div>

            <div className="bg-brand-primary/5 rounded-[2.5rem] p-8 border border-brand-primary/10">
               <h4 className="font-bold text-brand-primary text-sm uppercase tracking-widest mb-4">Pro Tip</h4>
               <p className="text-slate-600 text-sm font-medium leading-relaxed">
                 Try uploading handwritten notes! Gemini can read them as well as typed text.
               </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AnalysisAddon({ icon: Icon, label, desc, color }: { icon: any, label: string, desc: string, color: string }) {
  return (
    <button className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white border border-slate-50 shadow-sm hover:shadow-md hover:border-slate-100 transition-all group w-full text-left">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
      </div>
    </button>
  );
}
