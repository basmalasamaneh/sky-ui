import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 dark:border-gray-800 bg-white dark:bg-black" dir="ltr">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* اللوغو */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 transition-transform group-hover:scale-110 duration-300">
            <Image
              src="/images/logo.png"
              alt="أثر"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/images/icon-dark.png"
              alt="أثر"
              fill
              className="object-contain hidden dark:block"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#1a0f0a] dark:text-[#e8dcc4] font-ornamental">أثر</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-sm font-bold tracking-widest text-[#2c1e15] dark:text-[#e8dcc4] font-kufi uppercase">Athar</span>
          </div>
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


