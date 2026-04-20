const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components'];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      console.log(`Processing ${fullPath}`);
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // 1. Text color mappings to beige
      const textMap = {
        'text-[#1a0f0a]': 'dark:text-[#e8dcc4]',
        'text-[#2c1e15]': 'dark:text-[#e8dcc4]',
        'text-[#4a3728]': 'dark:text-[#e8dcc4]',
        'text-[#3b2012]': 'dark:text-[#e8dcc4]',
        'text-[#5c4436]': 'dark:text-[#e8dcc4]',
        'text-[#9c7b65]': 'dark:text-[#e8dcc4]',
        'text-gray-700': 'dark:text-[#e8dcc4]',
        'text-gray-800': 'dark:text-[#e8dcc4]',
        'text-gray-900': 'dark:text-[#e8dcc4]',
        'dark:text-white': 'dark:text-[#e8dcc4]',
        'dark:text-gray-200': 'dark:text-[#e8dcc4]',
        'dark:text-gray-300': 'dark:text-[#e8dcc4]',
      };

      for (const [cls, darkCls] of Object.entries(textMap)) {
        const escapedCls = cls.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        // Use \b for the start (matches bg- because b is word-char)
        // For the end, use a lookahead for space, quote, colon, or end of string
        const regex = new RegExp(`(?<!dark:)\\b${escapedCls}(?=[\\s'"\`:]|$)`, 'g');
        
        if (cls.startsWith('dark:')) {
           const exactRegex = new RegExp(`\\b${escapedCls}(?=[\\s'"\`:]|$)`, 'g');
           if (content.includes(cls)) {
             content = content.replace(exactRegex, darkCls);
             modified = true;
           }
        } else if (regex.test(content)) {
          content = content.replace(regex, match => `${match} ${darkCls}`);
          modified = true;
        }
      }
      
      // 2. Background color mappings to black
      const bgMap = {
        'bg-[#f2f0eb]': 'dark:bg-black',
        'bg-[#f0ece6]': 'dark:bg-black',
        'bg-[#fdfaf7]': 'dark:bg-black',
        'bg-[#fefaf6]': 'dark:bg-black',
        'bg-[#fafafa]': 'dark:bg-black',
        'bg-white': 'dark:bg-black',
      };

      for (const [cls, darkCls] of Object.entries(bgMap)) {
        const escapedCls = cls.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const regex = new RegExp(`(?<!dark:)\\b${escapedCls}(?=[\\s'"\`:]|$)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, match => `${match} ${darkCls}`);
          modified = true;
        }
      }

      // 3. Handle opacity backgrounds and fix typos
      content = content.replace(/(?<!dark:)\b(bg-[^ \s'"`]*\/)(\d)\b(?![\/\d])/g, '$1$20'); 

      // Add dark:bg-black/xx variants
      content = content.replace(/(?<!dark:)(bg-white\/(\d+))(?!\s*dark:bg-black\/\d+)/g, '$1 dark:bg-black/$2');
      content = content.replace(/(?<!dark:)(bg-\[#[a-fA-F0-9]+\]\/(\d+))(?!\s*dark:bg-black\/\d+)/g, '$1 dark:bg-black/$2');
      
      // 4. Border mappings
      const borderMap = {
        'border-gray-100': 'dark:border-gray-800',
        'border-gray-200': 'dark:border-gray-700',
        'border-gray-300': 'dark:border-gray-600',
        'border-[#e8dcc4]': 'dark:border-gray-800',
        'border-[#d2cfc7]': 'dark:border-gray-800',
      };
      for (const [cls, darkCls] of Object.entries(borderMap)) {
        const escapedCls = cls.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const regex = new RegExp(`(?<!dark:)\\b${escapedCls}(?=[\\s'"\`:]|$)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, match => `${match} ${darkCls}`);
          modified = true;
        }
      }

      // 5. Deduplicate dark: variants (e.g., dark:bg-black dark:bg-black -> dark:bg-black)
      const darkClasses = [
        'dark:bg-black',
        'dark:bg-gray-900',
        'dark:text-\\[#e8dcc4\\]',
        'dark:bg-black\\/\\d+'
      ];
      darkClasses.forEach(dCls => {
        const dupRegex = new RegExp(`(${dCls})\\s+\\1`, 'g');
        if (dupRegex.test(content)) {
          content = content.replace(dupRegex, '$1');
          modified = true;
        }
        // Also handle cases with other classes in between (harder but common)
        // For now just fix direct neighbors
      });

      // Specific cleanup for Header.jsx mess
      if (content.includes('dark:bg-black/9 dark:bg-black/95')) {
        content = content.replace(/dark:bg-black\/9\s+dark:bg-black\/95/g, 'dark:bg-black/95');
        modified = true;
      }
      if (content.includes('bg-[#fafafa]/8')) {
        content = content.replace(/bg-\[\#fafafa\]\/8/g, 'bg-[#fafafa]/80');
        modified = true;
      }
      
      // If content was changed, we check if modified
      if (content !== fs.readFileSync(fullPath, 'utf8')) {
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

targetDirs.forEach(dir => {
  const fullDirPath = path.join(__dirname, dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  }
});

console.log('Done mapping second pass for light beige text and missed backgrounds.');
