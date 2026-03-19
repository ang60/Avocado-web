import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="mb-4 flex items-center justify-between md:mb-5">
      <h1 
        className="text-4xl" 
        style={{ 
          fontFamily: 'DM Serif Display, serif',
          color: '#1B4332'
        }}
      >
        Case Management
      </h1>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: '#717182' }}
          />
          <input
            type="text"
            placeholder="Search cases..."
            className="pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderColor: '#E0DDD6',
              backgroundColor: '#FFFFFF',
              width: '280px',
              borderRadius: '8px',
              color: '#1B4332'
            }}
          />
        </div>

        {/* User Profile */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 transition-all"
          style={{
            backgroundColor: '#2D6A4F',
            color: '#FFFFFF',
            fontFamily: 'IBM Plex Sans, sans-serif',
          }}
        >
          <span className="text-sm font-medium">AO</span>
        </div>
      </div>
    </header>
  );
}
