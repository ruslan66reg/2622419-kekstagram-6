import { isEscapeKey } from './util.js';

const COMMENTS_STEP = 5;

const bigPictureElement = document.querySelector('.big-picture');
const closeButton = bigPictureElement.querySelector('.big-picture__cancel');
const imgElement = bigPictureElement.querySelector('.big-picture__img img');
const likesElement = bigPictureElement.querySelector('.likes-count');
const captionElement = bigPictureElement.querySelector('.social__caption');

const commentsListElement = bigPictureElement.querySelector('.social__comments');
const shownCountElement = bigPictureElement.querySelector('.social__comment-shown-count');
const totalCountElement = bigPictureElement.querySelector('.social__comment-total-count');
const commentsLoaderElement = bigPictureElement.querySelector('.comments-loader');

let currentComments = [];
let shownCount = 0;

const createComment = ({ avatar, name, message }) => {
  const li = document.createElement('li');
  li.classList.add('social__comment');

  const img = document.createElement('img');
  img.classList.add('social__picture');
  img.src = avatar;
  img.alt = name;
  img.width = 35;
  img.height = 35;

  const p = document.createElement('p');
  p.classList.add('social__text');
  p.textContent = message;

  li.append(img, p);
  return li;
};

const renderComments = () => {
  commentsListElement.innerHTML = '';

  const toShow = currentComments.slice(0, shownCount);
  const fragment = document.createDocumentFragment();

  toShow.forEach((comment) => fragment.append(createComment(comment)));
  commentsListElement.append(fragment);

  shownCountElement.textContent = String(toShow.length);
  totalCountElement.textContent = String(currentComments.length);

  if (toShow.length >= currentComments.length) {
    commentsLoaderElement.classList.add('hidden');
  } else {
    commentsLoaderElement.classList.remove('hidden');
  }
};

const closeBigPicture = () => {
  bigPictureElement.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
};

function onDocumentKeydown(evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closeBigPicture();
  }
}

const onCommentsLoaderClick = () => {
  shownCount = Math.min(shownCount + COMMENTS_STEP, currentComments.length);
  renderComments();
};

const openBigPicture = (photo) => {
  bigPictureElement.classList.remove('hidden');
  document.body.classList.add('modal-open');

  imgElement.src = photo.url;
  imgElement.alt = photo.description;

  likesElement.textContent = String(photo.likes);
  captionElement.textContent = photo.description;

  currentComments = photo.comments;
  shownCount = Math.min(COMMENTS_STEP, currentComments.length);
  renderComments();

  document.addEventListener('keydown', onDocumentKeydown);
};

const initBigPicture = () => {
  closeButton.addEventListener('click', closeBigPicture);
  commentsLoaderElement.addEventListener('click', onCommentsLoaderClick);
};

export { initBigPicture, openBigPicture };
