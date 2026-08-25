import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#FEFBFB] font-sans">
      
      <div className="relative z-10 flex flex-col items-center text-center p-6 animate-fade-in-up">
          
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-[#5C3A3A] mb-12 tracking-wide">
              JUSpa
          </h1>

          <button 
            onClick={onEnter}
            className="group relative px-12 py-4 bg-[#E5989B] hover:bg-[#D97A7D] rounded-full text-white font-medium text-lg tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md overflow-hidden"
          >
              <span className="relative z-10 flex items-center gap-3">
                  Truy cập Hệ thống
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
              </span>
          </button>
      </div>

      <div className="absolute bottom-8 text-[#5C3A3A]/30 text-xs tracking-widest">
          © {new Date().getFullYear()} JUSPA SYSTEM
      </div>
    </div>
  );
};

export default LandingPage;
