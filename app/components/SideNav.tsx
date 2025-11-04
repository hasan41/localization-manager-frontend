'use client';

interface SideNavProps {
  currentPage: 'editor' | 'localization';
  onPageChange: (page: 'editor' | 'localization') => void;
  onNewChat?: () => void;
}

export default function SideNav({ currentPage, onPageChange, onNewChat }: SideNavProps) {
  return (
    <nav className="w-64 h-screen fixed left-0 top-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl">
      <div className="h-full flex flex-col p-6">
        {/* Brand */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Component Creator</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 ml-13">AI-powered React builder</p>
        </div>
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="w-full mb-6 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            New Chat
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1">
          <div className="space-y-3">
            <button
              onClick={() => onPageChange('editor')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                currentPage === 'editor'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${currentPage === 'editor' ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-semibold">Editor</span>
            </button>

            <button
              onClick={() => onPageChange('localization')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                currentPage === 'localization'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${currentPage === 'localization' ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-semibold">Localization</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 text-center">
            <p>Powered by GPT-4</p>
          </div>
        </div>
      </div>
    </nav>
  );
}