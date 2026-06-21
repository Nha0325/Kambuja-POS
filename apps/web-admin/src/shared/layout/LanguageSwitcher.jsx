import { useState, useRef, useEffect } from 'react';
import { useI18nStore } from '../../app/i18nStore';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18nStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-lg text-rose-600" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        <span className="uppercase">{lang}</span>
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50">
          <button
            onClick={() => { setLang('km'); setIsOpen(false); }}
            className={`w-full cursor-pointer text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${lang === 'km' ? 'font-medium text-rose-600 bg-rose-50' : 'text-slate-700'}`}
          >
            ខ្មែរ
          </button>
          <button
            onClick={() => { setLang('en'); setIsOpen(false); }}
            className={`w-full cursor-pointer text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${lang === 'en' ? 'font-medium text-rose-600 bg-rose-50' : 'text-slate-700'}`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
