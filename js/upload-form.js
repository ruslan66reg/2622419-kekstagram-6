import { isEscapeKey } from './util.js';

const uploadForm = document.querySelector('.img-upload__form');
const fileInput = uploadForm.querySelector('.img-upload__input');
const overlay = uploadForm.querySelector('.img-upload__overlay');
const cancelButton = uploadForm.querySelector('.img-upload__cancel');
const hashtagField = uploadForm.querySelector('.text__hashtags');
const commentField = uploadForm.querySelector('.text__description');

const MAX_COMMENT_LENGTH = 140;
const MAX_HASHTAGS = 5;
const HASHTAG_PATTERN = /^#[a-zа-яё0-9]{1,19}$/i;

const pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload__field-wrapper--error',
  successClass: 'img-upload__field-wrapper--success',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'span',
  errorTextClass: 'img-upload__error'
});

const normalizeHashtags = (value) =>
  value.trim().split(/\s+/).filter((tag) => tag.length > 0);

const hasValidHashtagFormat = (value) => {
  const tags = normalizeHashtags(value);

  return tags.every((tag) => HASHTAG_PATTERN.test(tag));
};

const hasValidHashtagCount = (value) => {
  const tags = normalizeHashtags(value);

  return tags.length <= MAX_HASHTAGS;
};

const hasUniqueHashtags = (value) => {
  const tags = normalizeHashtags(value).map((tag) => tag.toLowerCase());

  return tags.length === new Set(tags).size;
};

const validateCommentLength = (value) => value.length <= MAX_COMMENT_LENGTH;

pristine.addValidator(
  hashtagField,
  hasValidHashtagFormat,
  'Хэш-тег должен начинаться с #, содержать только буквы и цифры и быть не длиннее 20 символов',
  1,
  true
);

pristine.addValidator(
  hashtagField,
  hasValidHashtagCount,
  'Нельзя указать больше пяти хэш-тегов',
  2,
  true
);

pristine.addValidator(
  hashtagField,
  hasUniqueHashtags,
  'Хэш-теги не должны повторяться',
  3,
  true
);

pristine.addValidator(
  commentField,
  validateCommentLength,
  'Комментарий не может быть длиннее 140 символов'
);

function openUploadOverlay() {
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
}

function closeUploadOverlay() {
  overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');

  uploadForm.reset();
  pristine.reset();

  fileInput.value = '';

  document.removeEventListener('keydown', onDocumentKeydown);
}

function onDocumentKeydown(evt) {
  if (!isEscapeKey(evt)) {
    return;
  }

  evt.preventDefault();
  closeUploadOverlay();
}

const onTextFieldKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    evt.stopPropagation();
  }
};

function onFileInputChange() {
  if (fileInput.files.length > 0) {
    openUploadOverlay();
  }
}

function onCancelButtonClick() {
  closeUploadOverlay();
}

function onFormSubmit(evt) {
  const isValid = pristine.validate();

  if (!isValid) {
    evt.preventDefault();
  }
}

const initUploadForm = () => {
  fileInput.addEventListener('change', onFileInputChange);
  cancelButton.addEventListener('click', onCancelButtonClick);
  uploadForm.addEventListener('submit', onFormSubmit);
  hashtagField.addEventListener('keydown', onTextFieldKeydown);
  commentField.addEventListener('keydown', onTextFieldKeydown);
};

export { initUploadForm };
