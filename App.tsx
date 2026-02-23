
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FloatingMenu } from './components/FloatingMenu';
import { transformText, chatWithArchitect } from './services/geminiService';
import { FileText, Send, MessageSquare, X, ChevronRight, Briefcase, User, Info, Printer } from 'lucide-react';

const STORAGE_KEY = 'notepad_storage_v1';
const INITIAL_TEXT = `The Iron Vault of Midas was a structure that shouldn't exist—a cathedral of capital carved from the very bedrock of the global economy. Kai stood before the Grand Chancellor, a man whose eyes were cold as coin and sharp as industrial diamonds.

'We have a void in our architecture,' the Chancellor whispered, the sound echoing through the gilded chamber. 'A leak in the soul of the bank. Build us a bridge over the Zero-Sum Abyss, Kai. Build us the Aethelred Network—an unbreakable bastion of logic—or see your entire lineage erased from the ledgers of time. We do not negotiate with entropy.'

Kai retreated to his sanctuary, the weight of the world's wealth crushing his spirit. Sleep was his only escape, but it offered no peace. It was a revelation. 

In a fever dream of liquid gold and screaming binary, the solution crystallized. He saw the code—not as characters on a screen, but as a living, breathing god. A hundred adversaries rose to challenge him in the digital arena, their voices a choir of dissent and chaos. 

'I will build it,' Kai screamed into the void of his own subconscious. 'I will build the vault that holds the soul of the machine.'

When he woke, the mechanical box from his grandfather sat on the desk, glowing with a soft, predatory amber light. The 'right kind of thought' was no longer a mystery. It was a challenge from the shadows of high finance, forged in a dream, and destined to rewrite the future of every living creature on the planet. 

He pulled his keyboard closer, the clack of the mechanical keys a sharp counterpoint to the silence of the Iron Vault. A blank terminal stared back at him. With a few swift strokes, a new directory was born: /ai/bank/midas-prime/genesis. 

It was a promise of epic ruin and divine rebirth.`;

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  const [content, setContent] = useState<string>(INITIAL_TEXT);
  const [selection, setSelection] = useState<string>("");
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [lineCount, setLineCount] = useState(1);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const lastRange = useRef<Range | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContent(saved);
      if (editorRef.current) {
        editorRef.current.innerHTML = saved;
      }
    } else {
      setContent(INITIAL_TEXT);
      if (editorRef.current) {
        editorRef.current.innerText = INITIAL_TEXT;
      }
    }
  }, []);

  useEffect(() => {
    updateLineCount();
  }, [content]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateLineCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      const lines = text.split('\n');
      setLineCount(Math.max(1, lines.length));
    }
  };

  const saveContent = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      localStorage.setItem(STORAGE_KEY, newContent);
      setContent(newContent);
      updateLineCount();
    }
  }, []);

  const handleExport = () => {
    window.print();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
    saveContent();
  };

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0);
        if (editorRef.current?.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          lastRange.current = range.cloneRange();
          setSelection(sel.toString());
          setMenuPos({ x: rect.left + rect.width / 2, y: rect.top });
        }
      } else {
        setMenuPos(null);
        setSelection("");
      }
    }, 10);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsProcessing(true);

    try {
      const currentFullText = editorRef.current?.innerText || "";
      const result = await chatWithArchitect(currentFullText, userMsg, messages);
      
      setMessages(prev => [...prev, { role: 'bot', text: result.reply }]);
      
      if (result.updatedDoc && result.updatedDoc !== "UNCHANGED") {
        if (editorRef.current) {
          editorRef.current.innerText = result.updatedDoc;
          saveContent();
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporary unavailable. Please verify network credentials." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIAction = async (action: string) => {
    if (isProcessing || !selection || !lastRange.current) return;

    if (action === 'STYLIZED') {
      const span = document.createElement('span');
      span.className = 'epic-script';
      span.textContent = selection;
      lastRange.current.deleteContents();
      lastRange.current.insertNode(span);
      saveContent();
      setMenuPos(null);
      return;
    }

    setIsProcessing(true);
    setMenuPos(null);

    try {
      const fullText = editorRef.current?.innerText || "";
      const result = await transformText(fullText, selection, action);
      if (result && lastRange.current) {
        lastRange.current.deleteContents();
        const textNode = document.createTextNode(result);
        lastRange.current.insertNode(textNode);
        saveContent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setSelection("");
    }
  };

  return (
    <div className="flex h-screen bg-[#050a14] font-ui text-slate-300 overflow-hidden">
      {/* Sidebar Chat */}
      <div className={`no-print transition-all duration-500 bg-[#0a1120] border-r border-slate-800 flex flex-col shadow-2xl ${isChatOpen ? 'w-96' : 'w-0 overflow-hidden'}`}>
        <div className="p-5 bg-[#0f172a] border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Briefcase size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">AI Architect</h2>
              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Enterprise Edition</p>
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded"><X size={18} /></button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="flex gap-3 p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-blue-200/80">
              Operational Interface active. Issue directives or apply styles via selection.
            </p>
          </div>
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-xl text-[12px] leading-relaxed shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500' 
                  : 'bg-[#1e293b] text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {msg.text}
              </div>
              <div className="flex items-center gap-2 mt-2 px-1">
                {msg.role === 'bot' ? <Briefcase size={10} className="text-blue-500" /> : <User size={10} className="text-slate-500" />}
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                  {msg.role === 'user' ? 'Client' : 'Architect'}
                </span>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 text-blue-500 text-[11px] font-bold tracking-widest px-1">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              PROCESSING DIRECTIVE...
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        <form onSubmit={handleChatSubmit} className="p-6 border-t border-slate-800 bg-[#0f172a] shrink-0">
          <div className="relative group">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send instruction..."
              className="w-full bg-[#050a14] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12"
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-2 h-9 w-9 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-all disabled:opacity-30"
              disabled={isProcessing}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative flex flex-col bg-[#050a14] min-w-0 p-6 md:p-10">
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="no-print fixed top-8 left-8 z-50 bg-blue-600 p-4 rounded-xl text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            <MessageSquare size={22} />
          </button>
        )}

        <header className="mb-8 flex justify-between items-end shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">Encrypted Session</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tighter">Aethelgard Codex <span className="text-slate-600 font-light">| v3.1</span></h1>
          </div>
          
          <button 
            onClick={handleExport} 
            className="no-print flex items-center gap-3 bg-white text-slate-900 hover:bg-slate-100 transition-all text-[11px] font-bold uppercase px-6 py-3 rounded-lg shadow-xl border border-white"
          >
            <Printer size={16} />
            <span>Epic Export</span>
          </button>
        </header>

        {/* Editor Wrapper with fixed height to allow scrolling */}
        <div className="flex-1 relative min-h-0 min-w-0">
          <div className="h-full premium-container flex custom-scrollbar">
            {/* Line Numbers column */}
            <div className="no-print line-numbers pt-[10px] w-14 flex-shrink-0">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-[1.7] h-[22.1pt] flex items-center justify-end px-3">{i + 1}</div>
              ))}
            </div>

            {/* Editable Content */}
            <div className="flex-1 relative min-w-0 bg-white min-h-full">
              <div 
                ref={editorRef}
                contentEditable
                onInput={saveContent}
                onPaste={handlePaste}
                onMouseUp={handleMouseUp}
                className="font-readable w-full outline-none relative z-10 min-h-full py-[10px]"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
        
        <footer className="mt-4 flex justify-between items-center px-2 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Words</span>
              <span className="text-xs text-slate-300 font-mono">{(editorRef.current?.innerText.match(/\S+/g) || []).length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Lines</span>
              <span className="text-xs text-slate-300 font-mono">{lineCount}</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-600 font-medium uppercase tracking-widest">© 2025 Aethelgard Financial Systems</p>
        </footer>
      </div>

      <FloatingMenu selection={selection} onAction={handleAIAction} position={menuPos} />
    </div>
  );
};

export default App;
