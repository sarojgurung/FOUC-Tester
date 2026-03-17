import React, { useState, useEffect, useRef } from 'react';
import { Upload, Type, Settings, Eye, EyeOff, RefreshCw, Info, Search, ChevronDown, X } from 'lucide-react';

const WEBSAFE_FONTS = [
  'Arial', 'Helvetica', 'Verdana', 'Trebuchet MS', 'Gill Sans', 
  'Times New Roman', 'Georgia', 'Palatino', 'Courier New', 'Monaco', 'Impact'
].sort();

const DUMMY_TEXT = "The quick brown fox jumps over the lazy dog. Designers often use this sentence to test how fonts look. It contains every letter of the alphabet, making it perfect for checking spacing and x-height alignment.";

interface FontState {
  name: string;
  type: 'google' | 'upload' | 'websafe';
  family?: string;
}

export default function App() {
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);
  const [fontA, setFontA] = useState<FontState>({ name: 'Inter', type: 'google' });
  const [fontB, setFontB] = useState<FontState>({ name: 'Arial', type: 'websafe' });
  
  const [fontSize, setFontSize] = useState(48);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [opacityA, setOpacityA] = useState(0.6);
  const [opacityB, setOpacityB] = useState(0.6);
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [colorA, setColorA] = useState('#ef4444'); // Red
  const [colorB, setColorB] = useState('#3b82f6'); // Blue
  const [customText, setCustomText] = useState(DUMMY_TEXT);

  // Fetch all Google Font names
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        // Fetching from a community-maintained list of Google Fonts
        const response = await fetch('https://cdn.jsdelivr.net/gh/jonathantneal/google-fonts-complete@master/google-fonts.json');
        const data = await response.json();
        const names = Object.keys(data).sort();
        setGoogleFonts(names);
      } catch (err) {
        console.error("Failed to fetch Google Fonts list:", err);
        // Fallback to a basic list if fetch fails
        setGoogleFonts(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins']);
      }
    };
    fetchFonts();
  }, []);

  // Load Google Fonts
  useEffect(() => {
    const loadFont = (font: FontState) => {
      if (font.type === 'google') {
        const linkId = `google-font-${font.name.replace(/\s+/g, '-').toLowerCase()}`;
        if (document.getElementById(linkId)) return;

        const link = document.createElement('link');
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${font.name.replace(/ /g, '+')}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    };

    loadFont(fontA);
    loadFont(fontB);
  }, [fontA, fontB]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fontData = event.target?.result as string;
        const fontName = `Uploaded-${target}-${Date.now()}`;
        const fontFace = new FontFace(fontName, `url(${fontData})`);
        
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
        
        const newState: FontState = { name: file.name, type: 'upload', family: fontName };
        if (target === 'A') setFontA(newState);
        else setFontB(newState);
      } catch (err) {
        console.error("Failed to load font:", err);
        alert("Failed to load font file.");
      }
    };
    reader.readAsDataURL(file);
  };

  const getFontFamily = (font: FontState) => {
    if (font.type === 'upload' && font.family) return `"${font.family}"`;
    return `"${font.name}", sans-serif`;
  };

  const SearchableDropdown = ({ 
    font, 
    setFont, 
    target 
  }: { 
    font: FontState, 
    setFont: (f: FontState) => void, 
    target: 'A' | 'B'
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredGoogle = googleFonts.filter(f => f.toLowerCase().includes(search.toLowerCase()));
    const filteredWebsafe = WEBSAFE_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 bg-transparent border border-[#141414] p-2 text-sm outline-none flex justify-between items-center hover:bg-[#141414]/5 transition-colors"
          >
            <span className="truncate">{font.type === 'upload' ? `Uploaded: ${font.name}` : font.name}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          <label className="cursor-pointer border border-[#141414] p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors" title="Upload Font">
            <Upload size={16} />
            <input type="file" className="hidden" accept=".ttf,.otf,.woff,.woff2" onChange={(e) => handleFileUpload(e, target)} />
          </label>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-[#DCDAD7] border border-[#141414] border-t-0 z-50 shadow-xl max-h-[400px] flex flex-col">
            <div className="p-2 border-b border-[#141414] flex items-center gap-2 bg-[#E4E3E0]">
              <Search size={14} className="opacity-50" />
              <input 
                autoFocus
                type="text"
                placeholder="Search fonts..."
                className="bg-transparent border-none outline-none text-xs w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} className="opacity-50" />
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredWebsafe.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[9px] font-bold uppercase opacity-50 bg-[#141414]/5">Websafe Fonts</div>
                  {filteredWebsafe.map(f => (
                    <button
                      key={f}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors ${font.name === f ? 'bg-[#141414]/10 font-bold' : ''}`}
                      onClick={() => {
                        setFont({ name: f, type: 'websafe' });
                        setIsOpen(false);
                        setSearch('');
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
              {filteredGoogle.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[9px] font-bold uppercase opacity-50 bg-[#141414]/5">Google Fonts ({googleFonts.length})</div>
                  {filteredGoogle.slice(0, 200).map(f => (
                    <button
                      key={f}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors ${font.name === f ? 'bg-[#141414]/10 font-bold' : ''}`}
                      onClick={() => {
                        setFont({ name: f, type: 'google' });
                        setIsOpen(false);
                        setSearch('');
                      }}
                    >
                      {f}
                    </button>
                  ))}
                  {filteredGoogle.length > 200 && (
                    <div className="px-3 py-2 text-[10px] opacity-50 italic border-t border-[#141414]/10">
                      Keep typing to narrow down {filteredGoogle.length} results...
                    </div>
                  )}
                </div>
              )}
              {filteredGoogle.length === 0 && filteredWebsafe.length === 0 && (
                <div className="p-4 text-center text-xs opacity-50 italic">
                  No fonts found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">FOUC Tester</h1>
          <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">Font Overlay & Metric Alignment Tool</p>
        </div>
        <div className="flex gap-4">
          <a href="https://fonts.google.com" target="_blank" rel="noreferrer" className="text-[10px] border border-[#141414] px-3 py-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors uppercase font-bold">
            Browse Google Fonts
          </a>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-[calc(100vh-88px)]">
        {/* Sidebar Controls */}
        <aside className="border-r border-[#141414] overflow-y-auto p-6 space-y-8 bg-[#DCDAD7]">
          
          {/* Font Selection Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#141414] pb-2">
              <Type size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Font Configuration</h2>
            </div>

            {/* Font A */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase opacity-50">Font Layer A (Top)</label>
                <div className="flex gap-2">
                  <button onClick={() => setShowA(!showA)} className="p-1 hover:bg-[#141414]/10 rounded">
                    {showA ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <input 
                    type="color" 
                    value={colorA} 
                    onChange={(e) => setColorA(e.target.value)}
                    className="w-4 h-4 rounded-full cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
              </div>
              <SearchableDropdown font={fontA} setFont={setFontA} target="A" />
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={opacityA} onChange={(e) => setOpacityA(parseFloat(e.target.value))}
                className="w-full accent-[#141414]"
              />
            </div>

            {/* Font B */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase opacity-50">Font Layer B (Bottom)</label>
                <div className="flex gap-2">
                  <button onClick={() => setShowB(!showB)} className="p-1 hover:bg-[#141414]/10 rounded">
                    {showB ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <input 
                    type="color" 
                    value={colorB} 
                    onChange={(e) => setColorB(e.target.value)}
                    className="w-4 h-4 rounded-full cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
              </div>
              <SearchableDropdown font={fontB} setFont={setFontB} target="B" />
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={opacityB} onChange={(e) => setOpacityB(parseFloat(e.target.value))}
                className="w-full accent-[#141414]"
              />
            </div>
          </section>

          {/* Typography Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#141414] pb-2">
              <Settings size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Typography Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                  <span>Font Size</span>
                  <span>{fontSize}px</span>
                </div>
                <input 
                  type="range" min="12" max="200" 
                  value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-[#141414]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                  <span>Line Height</span>
                  <span>{lineHeight}</span>
                </div>
                <input 
                  type="range" min="0.5" max="3" step="0.1" 
                  value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-full accent-[#141414]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                  <span>Letter Spacing</span>
                  <span>{letterSpacing}px</span>
                </div>
                <input 
                  type="range" min="-10" max="20" step="0.5" 
                  value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                  className="w-full accent-[#141414]"
                />
              </div>
            </div>
          </section>

          {/* Text Input */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#141414] pb-2">
              <div className="flex items-center gap-2">
                <Info size={16} />
                <h2 className="text-xs font-bold uppercase tracking-wider">Test Content</h2>
              </div>
              <button 
                onClick={() => setCustomText(DUMMY_TEXT)}
                className="p-1 hover:bg-[#141414]/10 rounded"
                title="Reset to default text"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <textarea 
              className="w-full h-32 bg-transparent border border-[#141414] p-3 text-sm outline-none resize-none"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter text to test..."
            />
          </section>
        </aside>

        {/* Comparison Canvas */}
        <section className="relative overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#141414] flex justify-between items-center bg-[#E4E3E0] z-10">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorA }} />
                <span className="text-[10px] font-bold uppercase">{fontA.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorB }} />
                <span className="text-[10px] font-bold uppercase">{fontB.name}</span>
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase opacity-50">
              Overlap View
            </div>
          </div>

          <div className="flex-1 overflow-auto p-12 flex items-start justify-center">
            <div className="relative w-full max-w-4xl">
              {/* Layer B (Bottom) */}
              <div 
                className="absolute top-0 left-0 w-full transition-all duration-200"
                style={{
                  fontFamily: getFontFamily(fontB),
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                  color: colorB,
                  opacity: showB ? opacityB : 0,
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              >
                {customText}
              </div>

              {/* Layer A (Top) */}
              <div 
                className="relative w-full transition-all duration-200"
                style={{
                  fontFamily: getFontFamily(fontA),
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                  color: colorA,
                  opacity: showA ? opacityA : 0,
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              >
                {customText}
              </div>

              {/* Baseline Guides (Optional) */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="border-b border-[#141414] w-full" 
                    style={{ height: `${fontSize * lineHeight}px` }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <footer className="p-4 border-t border-[#141414] bg-[#DCDAD7] text-[9px] uppercase tracking-widest flex justify-between">
            <span>A: {fontA.name} ({fontA.type})</span>
            <span>B: {fontB.name} ({fontB.type})</span>
            <span>Resolution: {fontSize}px @ {lineHeight}LH</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
