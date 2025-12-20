import { getData } from './api.js';
import { showDataError } from './util.js';
import { openBigPicture } from './big-picture.js';
import { initFilters } from './filters.js';

const picturesContainer = document.querySelector('.pictures');
const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');
const filtersContainer = document.querySelector('.img-filters');

let photos = [];

const clearThumbnails = () => {
  picturesContainer.querySelectorAll('.picture').forEach((el) => el.remove());
};

const renderThumbnails = (items) => {
  clearThumbnails();

  const fragment = document.createDocumentFragment();

  items.forEach((photo) => {
    const picture = pictureTemplate.cloneNode(true);

    const img = picture.querySelector('.picture__img');
    img.src = photo.url;
    img.alt = photo.description;

    picture.querySelector('.picture__likes').textContent = String(photo.likes);
    picture.querySelector('.picture__comments').textContent = String(photo.comments.length);

    picture.addEventListener('click', (evt) => {
      evt.preventDefault();
      openBigPicture(photo);
    });

    fragment.append(picture);
  });

  picturesContainer.append(fragment);
};

const initGallery = async () => {
  try {
    photos = await getData();
    renderThumbnails(photos);

    filtersContainer.classList.remove('img-filters--inactive');
    initFilters(photos, renderThumbnails);
  } catch {
    showDataError('Не удалось загрузить фотографии');
  }
};

export { initGallery };
