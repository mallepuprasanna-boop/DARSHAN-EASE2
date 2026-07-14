const fs = require('fs');
const https = require('https');
const path = require('path');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const options = { headers: { 'User-Agent': 'DarshanEaseBot/1.0 (amars@example.com)' } };
    https.get(url, options, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, options, (redirectRes) => {
          const file = fs.createWriteStream(filepath);
          redirectRes.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', reject);
      } else {
        reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

const handleImageDownload = async (templeName, imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return imageUrl;
  }
  try {
    const outputDir = path.join(__dirname, '../../frontend/public/temple-images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = `${slugify(templeName)}-${Date.now()}.jpg`;
    const filepath = path.join(outputDir, filename);
    await downloadImage(imageUrl, filepath);
    return `/temple-images/${filename}`;
  } catch (err) {
    console.error(`Failed to download image for ${templeName}:`, err.message);
    return imageUrl;
  }
};

module.exports = { handleImageDownload };
