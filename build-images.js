const fs = require('fs');
const path = require('path');

const PICTURE_DIR = path.join(__dirname, 'Picture');
const VIDEO_DIR = path.join(__dirname, 'Video');
const OUTPUT_FILE = path.join(__dirname, 'images-data.js');

/**
 * Picture klasöründeki tüm klasörleri ve resimleri tarar
 * Video klasöründeki videoları tarar
 * ve images-data.js dosyasını oluşturur
 */
function buildImagesData() {
  console.log('Picture klasörü taranıyor...');

  const allImagesData = {};

  // Picture klasörünü oku
  if (!fs.existsSync(PICTURE_DIR)) {
    console.error('Picture klasörü bulunamadı!');
    process.exit(1);
  }

  const categories = fs.readdirSync(PICTURE_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Bulunan kategoriler: ${categories.join(', ')}`);

  // Her kategori için resimleri topla
  categories.forEach(category => {
    const categoryPath = path.join(PICTURE_DIR, category);
    const images = [];

    try {
      const files = fs.readdirSync(categoryPath);

      // Sadece resim dosyalarını filtrele
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'].includes(ext);
      });

      // Her resim için bilgi oluştur
      imageFiles.forEach(file => {
        images.push({
          name: file,
          path: `Picture/${category}/${file}`
        });
      });

      // Alfabetik sırala
      images.sort((a, b) => a.name.localeCompare(b.name));

      if (images.length > 0) {
        allImagesData[category] = images;
        console.log(`  ${category}: ${images.length} resim`);
      }
    } catch (error) {
      console.warn(`  ${category} klasörü okunamadı:`, error.message);
    }
  });

  // Video klasörünü tara
  let videosData = [];
  if (fs.existsSync(VIDEO_DIR)) {
    console.log('\nVideo klasörü taranıyor...');
    try {
      const videoFiles = fs.readdirSync(VIDEO_DIR);

      // Sadece video dosyalarını filtrele
      const videoFilesFiltered = videoFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);
      });

      // Her video için bilgi oluştur
      videoFilesFiltered.forEach(file => {
        videosData.push({
          name: file,
          path: `Video/${file}`
        });
      });

      // Alfabetik sırala
      videosData.sort((a, b) => a.name.localeCompare(b.name));

      if (videosData.length > 0) {
        console.log(`  ${videosData.length} video bulundu`);
      }
    } catch (error) {
      console.warn(`  Video klasörü okunamadı:`, error.message);
    }
  }

  // JavaScript dosyası oluştur
  const jsContent = `// Bu dosya otomatik olarak oluşturulmuştur
// Picture klasöründeki resimleri ve Video klasöründeki videoları tarayarak build-images.js scripti ile oluşturulur
// Yeni resim veya video ekledikten sonra: node build-images.js

const allImagesData = ${JSON.stringify(allImagesData, null, 2)};

const allVideosData = ${JSON.stringify(videosData, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');

  const totalImages = Object.values(allImagesData).reduce((sum, images) => sum + images.length, 0);
  console.log(`\n✓ Toplam ${Object.keys(allImagesData).length} kategori, ${totalImages} resim bulundu`);
  if (videosData.length > 0) {
    console.log(`✓ ${videosData.length} video bulundu`);
  }
  console.log(`✓ ${OUTPUT_FILE} dosyası oluşturuldu`);
}

// Script çalıştır
buildImagesData();
