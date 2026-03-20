const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'chapters');

console.log("Scanning chapters folder...");

if (!fs.existsSync(chaptersDir)) {
  console.log("❌ No chapters directory found. Create a 'chapters' folder first.");
  process.exit();
}

const folders = fs.readdirSync(chaptersDir);
let manhwaData = {};

folders.forEach(folder => {
  // Check if it's a chapter folder like "ch1", "ch2"
  const match = folder.match(/^ch(\d+)$/i);
  if (match) {
    const chNum = parseInt(match[1]);
    const folderPath = path.join(chaptersDir, folder);
    
    // Get stats to strictly check for directory
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      
      // Filter out non-image files
      const imageFiles = files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
      
      if (imageFiles.length > 0) {
        // Get the extension of the first image (assumes all inside use the same)
        const ext = path.extname(imageFiles[0]);
        
        // Get folder creation time for the date!
        const stat = fs.statSync(folderPath);
        const uploadDate = stat.mtime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
        
        manhwaData[chNum] = {
          title: `Chapter ${chNum}`,
          pages: imageFiles.length,
          ext: ext,
          date: uploadDate
        };
        console.log(`Found Chapter ${chNum}: ${imageFiles.length} pages (${ext})`);
      }
    }
  }
});

// Create the JS code
const jsContent = `/* 
  ======================================================
  THIS FILE IS AUTO-GENERATED. DO NOT EDIT THIS MANUALLY!
  Run 'node update.js' to update this file.
  ======================================================
*/

const MANHWA_DATA = ${JSON.stringify(manhwaData, null, 2)};
`;

// Save it to chapters-data.js
fs.writeFileSync(path.join(__dirname, 'chapters-data.js'), jsContent);
console.log(`✅ Success! Updated website with ${Object.keys(manhwaData).length} chapters.`);
