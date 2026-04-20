const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components'];

const darkMappings = {
  'bg-white': 'bg-white dark:bg-black',
  'bg-\\[#faf8f5\\]': 'bg-[#faf8f5] dark:bg-black',
  'bg-\\[#fcfbf9\\]': 'bg-[#fcfbf9] dark:bg-black',
  'bg-\\[#fdfaf7\\]': 'bg-[#fdfaf7] dark:bg-black',
  'bg-\\[#f0ece6\\]': 'bg-[#f0ece6] dark:bg-gray-900',
  'bg-\\[#fcfaf8\\]': 'bg-[#fcfaf8] dark:bg-black',
  'text-\\[#3b2012\\]': 'text-[#3b2012] dark:text-white',
  'text-\\[#5c4436\\]': 'text-[#5c4436] dark:text-gray-200',
  'text-\\[#9c7b65\\]': 'text-[#9c7b65] dark:text-gray-300',
  'border-\\[#e8dcc4\\]': 'border-[#e8dcc4] dark:border-gray-800',
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'dark:bg-\\[#1a120c\\]': 'dark:bg-black',
  'dark:text-\\[#e4ded8\\]': 'dark:text-white',
  'border-gray-100': 'border-gray-100 dark:border-gray-800',
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [key, value] of Object.entries(darkMappings)) {
        // Find classes considering word boundaries
        // wait, tailwind classes might be preceded/followed by space or quotes
        // We shouldn't duplicate if it already has dark variant.
        // E.g., if there is already dark:bg-black right after, ignore.
        // It's safer to use simple string replacement, or regex.
        
        // Escape regex special chars in the mapping key except brackets which are already escaped
        // Actually, key is already a valid regex string format (like bg-\\[#f...] )
        
        const regex = new RegExp(`(?<!dark:)\\b${key}\\b(?=\\s|['"\`])(?!\\s*dark:)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, value);
          modified = true;
        }
      }
      
      // Also handle layout.js specifically to replace dark:bg-[#1a120c] -> dark:bg-black
      if (content.includes('dark:bg-[#1a120c]')) {
        content = content.replace(/dark:bg-\[\#1a120c\]/g, 'dark:bg-black');
        modified = true;
      }
      if (content.includes('dark:text-[#e4ded8]')) {
        content = content.replace(/dark:text-\[\#e4ded8\]/g, 'dark:text-white');
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

console.log('Done mapping tailwind classes manually.');
