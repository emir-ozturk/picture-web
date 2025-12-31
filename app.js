// Tüm resimleri ve kategorileri tutan global değişkenler
let allImages = {};
let currentCategory = '';
let currentImageIndex = 0;
let currentImages = [];
let isCategoryView = true;

// Resim verilerini yükle
function loadImagesData() {
  // images-data.js dosyası script tag ile yüklendiği için allImagesData global olarak mevcut
  if (typeof allImagesData !== 'undefined' && allImagesData) {
    allImages = allImagesData;
    loadGallery();
  } else {
    console.error('images-data.js dosyası yüklenemedi. Lütfen build scriptini çalıştırın: node build-images.js');
    document.getElementById('gallery-container').innerHTML =
      '<p class="text-center text-danger">Resim verileri yüklenemedi. Lütfen build scriptini çalıştırın: <code>node build-images.js</code></p>';
  }
}

// Kategori için kapak fotoğrafını seç
function getCategoryCoverImage(category) {
  const images = allImages[category];
  if (!images || images.length === 0) return null;

  // Önce "cover" ile başlayan dosyayı ara (case-insensitive)
  const coverImage = images.find(image =>
    image.name.toLowerCase().startsWith('cover')
  );

  // Cover bulunduysa onu döndür, yoksa alfabetik ilk resmi döndür
  return coverImage || images[0];
}

// Kategorileri göster
function showCategories() {
  isCategoryView = true;
  const container = document.getElementById('gallery-container');
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  const backButtonContainer = document.getElementById('back-button-container');

  container.innerHTML = '';
  container.className = 'categories-view';
  breadcrumbContainer.style.display = 'none';
  backButtonContainer.style.display = 'none';

  const categories = Object.keys(allImages).sort();

  if (categories.length === 0) {
    container.innerHTML = '<p class="text-center">Galeri bulunamadı.</p>';
    return;
  }

  const section = document.createElement('div');
  section.className = 'category-section';

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = 'Galeriler';

  const row = document.createElement('div');
  row.className = 'category-row';

  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.addEventListener('click', () => showCategoryImages(category));

    // Kategori kapak fotoğrafını seç (önce "cover" ile başlayan, yoksa alfabetik ilk)
    const coverImage = getCategoryCoverImage(category);
    if (!coverImage) return;

    const img = document.createElement('img');
    img.src = encodeURI(coverImage.path);
    img.alt = category;
    img.className = 'category-card-img';
    img.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'category-card-overlay';

    const title = document.createElement('h3');
    title.className = 'category-card-title';
    title.textContent = category;

    const count = document.createElement('div');
    count.className = 'category-card-count';
    count.textContent = `${allImages[category].length} resim`;

    overlay.appendChild(title);
    overlay.appendChild(count);
    card.appendChild(img);
    card.appendChild(overlay);
    row.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(row);
  container.appendChild(section);
}

// Kategori resimlerini göster
function showCategoryImages(category) {
  isCategoryView = false;
  currentCategory = category;
  const container = document.getElementById('gallery-container');
  const breadcrumbContainer = document.getElementById('breadcrumb-container');
  const backButtonContainer = document.getElementById('back-button-container');
  const breadcrumbCategory = document.getElementById('breadcrumb-category');

  container.innerHTML = '';
  container.className = '';
  breadcrumbContainer.style.display = 'block';
  backButtonContainer.style.display = 'block';
  breadcrumbCategory.textContent = category;

  renderCategory(category, allImages[category]);
}

// Kategorileri ve resimleri yükle
function loadGallery() {
  showCategories();
}

// Kategoriyi render et
function renderCategory(category, images) {
  const container = document.getElementById('gallery-container');

  const section = document.createElement('div');
  section.className = 'category-section';

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = category;

  const row = document.createElement('div');
  row.className = 'gallery-row';

  images.forEach((image, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-category', category);
    galleryItem.setAttribute('data-index', index);

    const img = document.createElement('img');
    // URL'deki boşlukları encode et
    img.src = encodeURI(image.path);
    img.alt = image.name;
    img.loading = 'lazy';

    img.onerror = function () {
      this.style.display = 'none';
    };

    galleryItem.appendChild(img);
    galleryItem.addEventListener('click', () => openModal(category, index));

    row.appendChild(galleryItem);
  });

  section.appendChild(title);
  section.appendChild(row);
  container.appendChild(section);
}

// Modal'ı aç
function openModal(category, imageIndex) {
  currentCategory = category;
  currentImages = allImages[category];
  currentImageIndex = imageIndex;

  const modal = new bootstrap.Modal(document.getElementById('imageModal'));
  updateModalImage();
  modal.show();
}

// Modal'daki resmi güncelle
function updateModalImage() {
  if (currentImages.length === 0) return;

  const image = currentImages[currentImageIndex];
  const modalImage = document.getElementById('modalImage');
  const imageCounter = document.getElementById('imageCounter');

  // URL'deki boşlukları encode et
  modalImage.src = encodeURI(image.path);
  imageCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

  // Önceki/Sonraki butonlarını güncelle
  document.getElementById('prevBtn').style.display =
    currentImageIndex > 0 ? 'flex' : 'none';
  document.getElementById('nextBtn').style.display =
    currentImageIndex < currentImages.length - 1 ? 'flex' : 'none';
}

// Önceki resim
function showPreviousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    updateModalImage();
  }
}

// Sonraki resim
function showNextImage() {
  if (currentImageIndex < currentImages.length - 1) {
    currentImageIndex++;
    updateModalImage();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prevBtn').addEventListener('click', showPreviousImage);
  document.getElementById('nextBtn').addEventListener('click', showNextImage);
  document.getElementById('backToCategoriesBtn').addEventListener('click', showCategories);
  document.getElementById('breadcrumb-home').addEventListener('click', (e) => {
    e.preventDefault();
    showCategories();
  });

  // Klavye ile gezinme
  document.addEventListener('keydown', (e) => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
    if (modal && modal._isShown) {
      if (e.key === 'ArrowLeft') {
        showPreviousImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'Escape') {
        modal.hide();
      }
    }
  });

  // Touch/swipe desteği
  let touchStartX = 0;
  let touchEndX = 0;

  const modalImageContainer = document.querySelector('.modal-image-container');

  modalImageContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  modalImageContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Sola kaydırma - sonraki resim
        showNextImage();
      } else {
        // Sağa kaydırma - önceki resim
        showPreviousImage();
      }
    }
  }

  // Sayfa yüklendiğinde resim verilerini yükle
  loadImagesData();
});
