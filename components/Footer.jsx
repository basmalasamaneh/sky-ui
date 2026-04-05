import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white" dir="ltr">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* اللوغو */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-brown-gradient flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
            <i className="fa-solid fa-palette text-white text-xl"></i>
          </div>
          <span className="text-lg font-bold text-[#1a0f0a] font-kufi tracking-wider">ATHAR</span>
        </Link>

        {/* حقوق النشر */}
        <p className="text-sm text-gray-400 font-light">
          © 2026 Athar. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
;


