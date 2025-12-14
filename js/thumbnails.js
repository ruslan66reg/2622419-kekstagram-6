import { getData } from './api.js';
import { openBigPicture } from './big-picture.js';
import { showAlert } from './util.js';

const picturesContainer = document.querySelector('.pictures');
const filtersElement = document.querySelector('.img-filters');
const pictureTemplate = document
  .querySelector('#picture')
  .content
  .querySelector('.picture');

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

const drawThumbnails = () => {
  getData()
    .then((photos) => {
      renderThumbnails(photos);

      if (filtersElement) {
        filtersElement.classList.remove('img-filters--inactive');
      }
    })
    .catch(() => {
      showAlert('Не удалось загрузить фотографии. Попробуйте обновить страницу.');
    });
};

export { drawThumbnails };
