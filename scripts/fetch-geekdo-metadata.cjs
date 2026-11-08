const fs = require('fs');
const https = require('https');
const Papa = require('papaparse');

const csvPath = 'collection.csv';
const outputPath = 'src/data/bggCovers.json';

// Read existing covers if already partially fetched
let existingData = {};
if (fs.existsSync(outputPath)) {
  try {
    existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  } catch (e) {
    existingData = {};
  }
}

const csvContent = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvContent, { header: true });

const games = [];
for (const row of parsed.data) {
  const id = parseInt(row.objectid || '0', 10);
  const name = (row.objectname || row.originalname || '').trim();
  if (id > 0 && name) {
    games.push({ id, name });
  }
}

console.log(`Found ${games.length} games in CSV. Already cached: ${Object.keys(existingData).length}`);

function fetchGeekItem(id) {
  return new Promise((resolve) => {
    const url = `https://api.geekdo.com/api/geekitems?objectid=${id}&objecttype=thing`;
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 8000
      },
      (res) => {
        if (res.statusCode !== 200) {
          return resolve(null);
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            const item = j.item;
            if (!item) return resolve(null);

            const images = item.images || {};
            const thumbnail = images.previewthumb || images.square200 || images.thumb || images.micro;
            const image = images.original || images.previewthumb || images.thumb;

            const mechanics = (item.links?.boardgamemechanic || []).map((x) => x.name).filter(Boolean);
            const categories = (item.links?.boardgamecategory || []).map((x) => x.name).filter(Boolean);

            resolve({
              id,
              thumbnail,
              image,
              mechanics,
              categories,
              description: item.description || item.short_description || undefined,
              shortDescription: item.short_description || undefined,
            });
          } catch (e) {
            resolve(null);
          }
        });
      }
    );

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function run() {
  const queue = games.filter(
    (g) => !existingData[g.id] || !existingData[g.id].description || existingData[g.id].description.length < 150
  );
  console.log(`Need to fetch full description for: ${queue.length} games`);

  const concurrency = 5;
  let completed = 0;
  let successCount = 0;

  for (let i = 0; i < queue.length; i += concurrency) {
    const chunk = queue.slice(i, i + concurrency);
    const results = await Promise.all(chunk.map((g) => fetchGeekItem(g.id)));

    results.forEach((res) => {
      if (res && res.thumbnail) {
        existingData[res.id] = res;
        successCount++;
      }
    });

    completed += chunk.length;
    process.stdout.write(`\rProgress: ${completed}/${queue.length} (${Math.round((completed / queue.length) * 100)}%) | Saved: ${Object.keys(existingData).length}`);

    // Save checkpoint every 40 items
    if (completed % 40 === 0 || completed >= queue.length) {
      fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf8');
    }

    // Polite delay
    await new Promise((r) => setTimeout(r, 200));
  }

  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf8');
  console.log(`\nDone! Total games with box art & mechanics: ${Object.keys(existingData).length}`);
}

run();

