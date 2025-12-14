import { getData } from './api.js';
import { openBigPicture } from './big-picture.js';
import { showAlert, debounce } from './util.js';

const picturesContainer = document.querySelector('.pictures');
const filtersElement = document.querySelector('.img-filters');
const pictureTemplate = document
  .querySelector('#picture')
  .content
  .querySelector('.picture');

const RANDOM_PHOTOS_COUNT = 10;
const RERENDER_DELAY = 500;

let allPhotos = [];

const createThumbnail = (photo) => {
  const pictureElement = pictureTemplate.cloneNode(true);

  const img = pictureElement.querySelector('.picture__img');
  const likesElement = pictureElement.querySelector('.picture__likes');
  const commentsElement = pictureElement.querySelector('.picture__comments');

  img.src = photo.url;
  img.alt = photo.description;
  likesElement.textContent = photo.likes;
  commentsElement.textContent = photo.comments.length;

  pictureElement.addEventListener('click', (evt) => {
    evt.preventDefault();
    openBigPicture(photo);
  });

  return pictureElement;
};

const clearThumbnails = () => {
  const oldPictures = picturesContainer.querySelectorAll('.picture');
  oldPictures.forEach((element) => element.remove());
};

const renderThumbnails = (photos) => {
  clearThumbnails();

  const fragment = document.createDocumentFragment();

  photos.forEach((photo) => {
    const thumbnail = createThumbnail(photo);
    fragment.append(thumbnail);
  });

  picturesContainer.append(fragment);
};

const getFilteredPhotos = (filterId) => {
  if (filterId === 'filter-random') {
    const shuffled = allPhotos.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, RANDOM_PHOTOS_COUNT);
  }

  if (filterId === 'filter-discussed') {
    return allPhotos
      .slice()
      .sort((a, b) => b.comments.length - a.comments.length);
  }

  return allPhotos.slice();
};

const debouncedRenderThumbnails = debounce((photos) => {
  renderThumbnails(photos);
}, RERENDER_DELAY);

const onFiltersClick = (evt) => {
  const target = evt.target;

  if (!target.classList.contains('img-filters__button')) {
    return;
  }

  const activeButton = filtersElement.querySelector('.img-filters__button--active');
  if (activeButton) {
    activeButton.classList.remove('img-filters__button--active');
  }

  target.classList.add('img-filters__button--active');

  const filteredPhotos = getFilteredPhotos(target.id);
  debouncedRenderThumbnails(filteredPhotos);
};

const initFilters = () => {
  if (!filtersElement) {
    return;
  }

  filtersElement.classList.remove('img-filters--inactive');
  filtersElement.addEventListener('click', onFiltersClick);
};

const drawThumbnails = () => {
  getData()
    .then((photos) => {
      allPhotos = photos.slice();
      renderThumbnails(allPhotos);
      initFilters();
    })
    .catch(() => {
      showAlert('Не удалось загрузить фотографии. Попробуйте обновить страницу.');
    });
};

export { drawThumbnails };
