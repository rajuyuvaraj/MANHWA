const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'chapters');

console.log("Scanning chapters folder...");

if (!fs.existsSync(chaptersDir)) {
  console.log("❌ No chapters directory found. Create a 'chapters' folder first.");
  process.exit();
}

// ---------------------------------------------------------
// DAILY SCHEDULE LOGIC
// Chapter 3 is scheduled for March 20, 2026 at 18:00 (6:00 PM)
// We calculate backwards/forwards so each chapter drops exactly 1 day apart.
// ---------------------------------------------------------
// Set the base drop time for Chapter 1: (March 18, 2026 at 18:00:00)
const BASE_DATE = new Date("2026-03-18T18:00:00").getTime();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const folders = fs.readdirSync(chaptersDir);
let manhwaData = {};

folders.forEach(folder => {
  const match = folder.match(/^ch(\d+)$/i);
  if (match) {
    const chNum = parseInt(match[1]);
    const folderPath = path.join(chaptersDir, folder);
    
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter(f => /\.(png|jpg|jpeg|webp|jxl)$/i.test(f));
      
      if (imageFiles.length > 0) {
        const ext = path.extname(imageFiles[0]);
        
        // Calculate the exact unlock time for THIS chapter N:
        // Chapter 1 = Base
        // Chapter 2 = Base + 1 Day
        // Chapter 3 = Base + 2 Days, etc.
        const releaseTime = BASE_DATE + ((chNum - 1) * ONE_DAY_MS);
        
        // Format a nice date for display
        const releaseDateObj = new Date(releaseTime);
        const displayDate = releaseDateObj.toLocaleDateString('en-US', { 
          month: 'short', day: '2-digit', year: 'numeric' 
        }).toUpperCase();
        
        manhwaData[chNum] = {
          title: `Chapter ${chNum}`,
          pages: imageFiles.length,
          ext: ext,
          releaseTime: releaseTime,
          date: displayDate
        };
        console.log(`Found Chapter ${chNum}: Scheduled for ${displayDate} 18:00`);
      }
    }
  }
});

const jsContent = `/* 
  ======================================================
  THIS FILE IS AUTO-GENERATED. DO NOT EDIT THIS MANUALLY!
  Run 'node update.js' to update this file.
  ======================================================
*/

const MANHWA_DATA = ${JSON.stringify(manhwaData, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'chapters-data.js'), jsContent);
console.log(`✅ Success! Updated website schedule with ${Object.keys(manhwaData).length} chapters.`);
