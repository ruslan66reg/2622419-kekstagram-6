import { isEscapeKey } from './util.js';

const COMMENTS_PER_PORTION = 5;

const bigPicture = document.querySelector('.big-picture');
const bigPictureImg = bigPicture.querySelector('.big-picture__img img');
const likesCountElement = bigPicture.querySelector('.likes-count');
const commentsCountElement = bigPicture.querySelector('.comments-count');
const commentsListElement = bigPicture.querySelector('.social__comments');
const socialCaptionElement = bigPicture.querySelector('.social__caption');
const commentsCountBlock = bigPicture.querySelector('.social__comment-count');
const commentsLoader = bigPicture.querySelector('.comments-loader');
const closeButton = bigPicture.querySelector('.big-picture__cancel');
const body = document.body;

let currentComments = [];
let shownCommentsCount = 0;

const createCommentElement = ({ avatar, name, message }) => {
  const commentItem = document.createElement('li');
  commentItem.classList.add('social__comment');

  const img = document.createElement('img');
  img.classList.add('social__picture');
  img.src = avatar;
  img.alt = name;
  img.width = 35;
  img.height = 35;

  const text = document.createElement('p');
  text.classList.add('social__text');
  text.textContent = message;

  commentItem.append(img, text);

  return commentItem;
};

const updateCommentsCounter = () => {
  const totalComments = currentComments.length;

  commentsCountElement.textContent = totalComments;

  commentsCountBlock.innerHTML = '';
  commentsCountBlock.append(
    document.createTextNode(`${shownCommentsCount} из `),
    commentsCountElement,
    document.createTextNode(' комментариев')
  );
};

const renderCommentsPortion = () => {
  const nextComments = currentComments.slice(
    shownCommentsCount,
    shownCommentsCount + COMMENTS_PER_PORTION
  );

  const fragment = document.createDocumentFragment();

  nextComments.forEach((comment) => {
    fragment.append(createCommentElement(comment));
  });

  commentsListElement.append(fragment);

  shownCommentsCount += nextComments.length;
  updateCommentsCounter();

  if (shownCommentsCount >= currentComments.length || currentComments.length === 0) {
    commentsLoader.classList.add('hidden');
  } else {
    commentsLoader.classList.remove('hidden');
  }
};

function closeBigPicture() {
  bigPicture.classList.add('hidden');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
}

function onDocumentKeydown(evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closeBigPicture();
  }
}

const openBigPicture = (photo) => {
  bigPicture.classList.remove('hidden');
  body.classList.add('modal-open');

  bigPictureImg.src = photo.url;
  bigPictureImg.alt = photo.description;
  likesCountElement.textContent = photo.likes;
  socialCaptionElement.textContent = photo.description;

  currentComments = photo.comments;
  shownCommentsCount = 0;
  commentsListElement.innerHTML = '';

  commentsCountBlock.classList.remove('hidden');
  commentsLoader.classList.remove('hidden');

  renderCommentsPortion();

  document.addEventListener('keydown', onDocumentKeydown);
};

const onCommentsLoaderClick = (evt) => {
  evt.preventDefault();
  renderCommentsPortion();
};

commentsLoader.addEventListener('click', onCommentsLoaderClick);
closeButton.addEventListener('click', closeBigPicture);

export { openBigPicture };
