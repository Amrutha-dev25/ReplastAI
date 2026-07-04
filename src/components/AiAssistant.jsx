import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  Trash2, 
  HelpCircle, 
  AlertTriangle, 
  RefreshCw, 
  Loader2, 
  Info, 
  CheckCircle2, 
  Bot, 
  User, 
  X,
  Flame,
  Globe,
  FileSpreadsheet
} from 'lucide-react';

export default function AiAssistant() {
  const { backendUrl, authHeaders } = useAppContext();
  
  // Load initial chat state from localStorage if available
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('replast_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default greeting
      }
    }
    return [
      { 
        role: 'assistant', 
        content: "Hello! I am your Replast AI Advisor, dedicated exclusively to materials science, plastic identification, polymer processing, and circular economy economics. \n\nHow can I help you optimize your recycling workflows or analyze your plastic streams today?" 
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorState, setErrorState] = useState(null); // { message: string, retryData: any }

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync messages with localStorage
  useEffect(() => {
    localStorage.setItem('replast_chat_history', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rate limiting countdown timer
  useEffect(() => {
    if (rateLimitTimer <= 0) return;
    const interval = setInterval(() => {
      setRateLimitTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image is too large. Max file size is 8MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const defaultGreeting = [
        { 
          role: 'assistant', 
          content: "Hello! I am your Replast AI Advisor, dedicated exclusively to materials science, plastic identification, polymer processing, and circular economy economics. \n\nHow can I help you optimize your recycling workflows or analyze your plastic streams today?" 
        }
      ];
      setMessages(defaultGreeting);
      localStorage.setItem('replast_chat_history', JSON.stringify(defaultGreeting));
      clearImage();
      setErrorState(null);
    }
  };

  const handleQuickQuestion = (questionText) => {
    if (loading || rateLimitTimer > 0) return;
    setInput(questionText);
    // Submit immediately on next tick
    setTimeout(() => {
      submitQuestion(questionText);
    }, 100);
  };

  const submitQuestion = async (textToSend) => {
    const promptText = (textToSend || input).trim();
    if (!promptText) return;

    // 1. Rate Limiting Check (Require 4 seconds cooldown between prompts)
    const now = Date.now();
    const timeDelta = (now - lastSentTime) / 1000;
    if (timeDelta < 4 && lastSentTime > 0) {
      setRateLimitTimer(4 - Math.floor(timeDelta));
      return;
    }

    setLastSentTime(now);
    setErrorState(null);
    setStatusMessage('Initiating polymer analytics model...');

    // Add user message to state
    const userMessage = {
      role: 'user',
      content: promptText,
      image: imagePreview // Save visual context locally if present
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const savedImage = imagePreview; // Store locally for retry reference
    clearImage(); // Clear input preview after sending

    // 2. Timeout and progress messages simulation
    const statusIntervals = [
      setTimeout(() => setStatusMessage('Compiling materials database context...'), 1500),
      setTimeout(() => setStatusMessage('Running thermal simulation models...'), 3500),
      setTimeout(() => setStatusMessage('Analyzing polymer structure degradation...'), 6000),
    ];

    try {
      // Reconstruct chat history in the format expected by the API
      // Take up to 10 previous messages for context
      const chatHistory = messages.slice(-10).map(m => ({
        role: m.role,
        text: m.content
      }));

      const response = await axios.post(
        `${backendUrl}/api/gemini/ask`,
        { 
          question: promptText,
          chatHistory,
          image: savedImage
        },
        {
          ...authHeaders,
          timeout: 15000 // 15 second request timeout
        }
      );

      // Clear pending status animations
      statusIntervals.forEach(clearTimeout);

      if (response.data && response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
      } else {
        throw new Error("Malformatted API response.");
      }
    } catch (err) {
      statusIntervals.forEach(clearTimeout);
      console.error("AI Advisor transaction failure:", err);
      
      let errMsg = "Transaction failed. Please verify your connection to the Replast core services.";
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errMsg = "Request Timeout. The thermal processing model exceeded standard execution limits. Please retry.";
      } else if (err.response?.status === 429) {
        errMsg = "Core rate limits exceeded. Please wait a minute before submitting further polymer queries.";
      }

      setErrorState({
        message: errMsg,
        retryData: { prompt: promptText, image: savedImage }
      });
      
      // Still show the failure in the message board so it's transparent to the user
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ [System Notification: Communication Protocol Interrupted]\n\n${errMsg}` 
      }]);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleRetry = () => {
    if (!errorState) return;
    const { prompt, image } = errorState.retryData;
    if (image) {
      setImagePreview(image);
    }
    setInput(prompt);
    setErrorState(null);
    // Remove the last "System Notification" error message from chat list if user retries
    setMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].content.includes('System Notification')) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuestion();
  };

  // Safe renderer for custom styling (bolding, headers, bullet list items)
  const formatResponseText = (text) => {
    if (!text) return "";
    
    // Check if it's the system failure warning
    const isError = text.includes('System Notification');

    return (
      <div className={isError ? "text-rose-400 border-l-2 border-rose-500 pl-3 py-1 font-mono" : ""}>
        {text.split('\n').map((line, idx) => {
          // Headers
          if (line.trim().startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-emerald-400 mt-4 mb-1.5 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 inline" />
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.trim().startsWith('## ')) {
            return <h2 key={idx} className="text-sm font-black text-zinc-100 mt-5 mb-2 border-b border-zinc-800 pb-1">{line.replace('## ', '')}</h2>;
          }
          if (line.trim().startsWith('# ')) {
            return <h1 key={idx} className="text-base font-black text-emerald-500 mt-6 mb-3">{line.replace('# ', '')}</h1>;
          }

          // Bullets
          if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
            const rawContent = line.trim().substring(2);
            return (
              <li key={idx} className="ml-4 list-disc text-zinc-300 text-xs my-1 leading-relaxed">
                {parseBoldText(rawContent)}
              </li>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="ml-4 text-zinc-300 text-xs my-1 leading-relaxed pl-1">
                {parseBoldText(line.trim())}
              </div>
            );
          }

          // Regular lines
          return line.trim() === "" ? (
            <div key={idx} className="h-2" />
          ) : (
            <p key={idx} className="text-zinc-300 text-xs leading-relaxed my-1.5">
              {parseBoldText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse double asterisks for bolding
  const parseBoldText = (line) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="text-zinc-50 font-semibold">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    return parts.length > 0 ? parts : line;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      
      {/* Top Banner & Explanation */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-500/20">
              Active Circular Advisor
            </span>
            {backendUrl ? (
              <span className="bg-zinc-800 text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Server Mode
              </span>
            ) : (
              <span className="bg-zinc-800 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Fallback Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 font-sans tracking-tight">AI Plastic Advisor</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Consult our materials science engine on polymer properties, extrusion temperatures, sorting codes, sand-binder compression pavers, or sustainability carbon reduction calculations.
          </p>
        </div>
        
        {/* Statistics or Actions */}
        <div className="flex gap-2 items-center self-start md:self-center">
          <button
            onClick={handleClearHistory}
            title="Reset Chat Session"
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-mono transition-all uppercase"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:grid lg:grid-cols-12 min-h-[550px]">
        
        {/* Left Column: Chat Feed */}
        <div className="lg:col-span-8 flex flex-col h-[520px] lg:h-[600px] border-b lg:border-b-0 lg:border-r border-zinc-900">
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 bg-[#080808]">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {/* Bot Icon */}
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-zinc-900/90 border border-zinc-850 text-zinc-200 rounded-tr-sm'
                    : 'bg-zinc-950/40 border border-zinc-900/60 text-zinc-300 rounded-tl-sm'
                }`}>
                  
                  {/* Local image attached in users feed */}
                  {msg.image && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-zinc-800 max-w-[200px] shadow-lg">
                      <img src={msg.image} alt="Uploaded material" className="w-full h-auto object-cover max-h-[140px]" />
                      <div className="bg-zinc-900 px-2 py-1 text-[9px] font-mono text-zinc-400">visual_input_payload.jpg</div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {msg.role === 'user' ? (
                      <p className="text-xs font-medium text-zinc-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      formatResponseText(msg.content)
                    )}
                  </div>
                </div>

                {/* User Icon */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Error Retry banner */}
            {errorState && (
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 mx-2 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 font-mono">ANALYTICS PIPELINE BROKEN</h4>
                    <p className="text-[11px] text-rose-400">{errorState.message}</p>
                  </div>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-850 border border-rose-700 text-rose-100 rounded-lg text-xs font-bold font-mono transition-colors uppercase flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Retry Query
                </button>
              </div>
            )}

            {/* Simulated Live Loading Status */}
            {loading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="bg-zinc-950 border border-zinc-900 text-zinc-400 px-4 py-3 rounded-2xl rounded-tl-sm flex flex-col gap-1 max-w-[85%] shadow-inner">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                      {statusMessage || 'Compiling polymer chemistry...'}
                    </span>
                  </div>
                  <div className="flex gap-1.5 pl-5 pt-0.5">
                    <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Controls / Visual Payload Bar */}
          <div className="border-t border-zinc-900 p-4 bg-zinc-950 space-y-3">
            
            {/* Visual Attachment Preview if loaded */}
            {imagePreview && (
              <div className="flex items-center justify-between p-2 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-750">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-300 font-mono">visual_input_payload.jpg</p>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wide flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-emerald-500" /> Classify Stream on Submit
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Cool-down Progress / Rate Limiting Notice */}
            {rateLimitTimer > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-amber-950/20 border border-amber-900/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                  <span className="text-[11px] font-mono text-amber-400">
                    Rate limit triggered. System cooling down: {rateLimitTimer}s
                  </span>
                </div>
                <div className="w-20 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-1000" 
                    style={{ width: `${(rateLimitTimer / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Input Submission Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={rateLimitTimer > 0 ? "Rate limit cooling down..." : "Inquire about polymer chemistry, pricing, or paving blocks..."}
                  className="w-full bg-zinc-900/95 border border-zinc-800 hover:border-zinc-700/80 rounded-xl pl-4 pr-10 py-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans placeholder:text-zinc-500"
                  disabled={loading || rateLimitTimer > 0}
                />
                
                {/* Image Attach Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach material photo for visual sorting"
                  disabled={loading || rateLimitTimer > 0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 disabled:opacity-30 p-1.5 hover:bg-zinc-800/80 rounded-lg transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !input.trim() || rateLimitTimer > 0}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs uppercase rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5 hover:shadow-lg active:scale-95"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5 text-zinc-950" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pre-seeded Query Panel & Platform Guidelines */}
        <div className="lg:col-span-4 p-4 lg:p-6 bg-[#0c0c0c] border-t lg:border-t-0 lg:border-l border-zinc-900 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h2 className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" /> Quick Query Pills
              </h2>
              <p className="text-[10px] text-zinc-500">Run authenticated materials queries instantly.</p>
            </div>

            <div className="space-y-3">
              {/* Question Pill 1 */}
              <button
                type="button"
                onClick={() => handleQuickQuestion("How do I manufacture compression paving blocks (pavers) from HDPE Type 2 and PP Type 5?")}
                disabled={loading || rateLimitTimer > 0}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-emerald-500/40 hover:bg-zinc-900/50 transition-all text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-emerald-500 uppercase font-bold tracking-widest">Paver Fabrication</span>
                  <Flame className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                </div>
                <p className="text-zinc-300 font-medium text-[11px] mt-1 line-clamp-2">Compression molded pavers using plastic types 2 and 5.</p>
              </button>

              {/* Question Pill 2 */}
              <button
                type="button"
                onClick={() => handleQuickQuestion("Can you explain the standard recycling codes 1 to 7 and typical polymer properties?")}
                disabled={loading || rateLimitTimer > 0}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-emerald-500/40 hover:bg-zinc-900/50 transition-all text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-emerald-500 uppercase font-bold tracking-widest">Recycling Codes</span>
                  <Info className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <p className="text-zinc-300 font-medium text-[11px] mt-1 line-clamp-2">Complete guide to resin numbers, melting points, and toxicity.</p>
              </button>

              {/* Question Pill 3 */}
              <button
                type="button"
                onClick={() => handleQuickQuestion("What are the sequential steps in mechanical sorting, shredding, and extrusion processing?")}
                disabled={loading || rateLimitTimer > 0}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-emerald-500/40 hover:bg-zinc-900/50 transition-all text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-emerald-500 uppercase font-bold tracking-widest">Industrial Processing</span>
                  <Globe className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                </div>
                <p className="text-zinc-300 font-medium text-[11px] mt-1 line-clamp-2">Mechanical washing, shredding, compounding, and extrusion loops.</p>
              </button>

              {/* Question Pill 4 */}
              <button
                type="button"
                onClick={() => handleQuickQuestion("Explain how the Replast marketplace works, and calculate the CO2 offset per kg of recycled polymer.")}
                disabled={loading || rateLimitTimer > 0}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-emerald-500/40 hover:bg-zinc-900/50 transition-all text-xs group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-emerald-500 uppercase font-bold tracking-widest">Marketplace Economics</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-zinc-300 font-medium text-[11px] mt-1 line-clamp-2">Pricing rules, carbon footprint savings, and order workflow.</p>
              </button>
            </div>
          </div>

          {/* Off-topic policy notice */}
          <div className="bg-zinc-950 border border-zinc-900/80 rounded-xl p-4 space-y-2">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              ADVISOR PROTOCOL POLICY
            </span>
            <p className="text-[10.5px] text-zinc-500 leading-relaxed">
              Replast AI uses fine-tuned models trained solely on polymer properties and circular materials. Attempting to submit non-recycling/invalid questions (e.g. food recipes, off-topic coding) triggers safety/off-topic filters to protect compiler bandwidth.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
