import { isEscapeKey } from './util.js';
import { resetImageEffects } from './image-effects.js';
import { sendData } from './api.js';

const uploadForm = document.querySelector('.img-upload__form');
const fileInput = document.querySelector('.img-upload__input');
const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = document.querySelector('.img-upload__cancel');
const hashtagField = document.querySelector('.text__hashtags');
const commentField = document.querySelector('.text__description');
const submitButton = document.querySelector('.img-upload__submit');

const MAX_COMMENT_LENGTH = 140;
const MAX_HASHTAGS = 5;
const HASHTAG_PATTERN = /^#[a-zа-яё0-9]{1,19}$/i;

let pristine = null;

const initValidation = () => {
  if (!uploadForm || !hashtagField || !commentField) {
    return;
  }

  if (pristine) {
    return;
  }

  if (typeof Pristine === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('Pristine is not loaded, validation disabled');
    return;
  }

  pristine = new Pristine(uploadForm, {
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
};

const blockSubmitButton = () => {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Публикуем...';
};

const unblockSubmitButton = () => {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = false;
  submitButton.textContent = 'Опубликовать';
};

const showMessage = (templateId) => {
  const template = document.querySelector(`#${templateId}`);
  if (!template) {
    return;
  }

  const messageElement = template.content.querySelector('section').cloneNode(true);
  document.body.append(messageElement);

  const button = messageElement.querySelector('button');

  const onMessageEscKeydown = (evt) => {
    if (!isEscapeKey(evt)) {
      return;
    }

    evt.preventDefault();
    closeMessage();
  };

  const onMessageClick = (evt) => {
    if (evt.target === messageElement) {
      closeMessage();
    }
  };

  function onButtonClick() {
    closeMessage();
  }

  function closeMessage() {
    messageElement.remove();
    document.removeEventListener('keydown', onMessageEscKeydown);
    messageElement.removeEventListener('click', onMessageClick);
    if (button) {
      button.removeEventListener('click', onButtonClick);
    }
  }

  if (button) {
    button.addEventListener('click', onButtonClick);
  }

  messageElement.addEventListener('click', onMessageClick);
  document.addEventListener('keydown', onMessageEscKeydown);
};

function closeUploadOverlay() {
  if (!overlay) {
    return;
  }

  overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');

  if (uploadForm) {
    uploadForm.reset();
  }

  if (pristine) {
    pristine.reset();
  }

  if (fileInput) {
    fileInput.value = '';
  }

  resetImageEffects();

  document.removeEventListener('keydown', onDocumentKeydown);
}

function onDocumentKeydown(evt) {
  if (!isEscapeKey(evt)) {
    return;
  }

  evt.preventDefault();
  closeUploadOverlay();
}

const openUploadOverlay = () => {
  if (!overlay) {
    return;
  }

  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
};

const onTextFieldKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    evt.stopPropagation();
  }
};

const onFileInputChange = () => {
  if (!fileInput) {
    return;
  }

  if (fileInput.files && fileInput.files.length > 0) {
    openUploadOverlay();
  }
};

const onCancelButtonClick = () => {
  closeUploadOverlay();
};

const onFormSubmit = (evt) => {
  if (!pristine) {
    return;
  }

  const isValid = pristine.validate();

  if (!isValid) {
    evt.preventDefault();
    return;
  }

  evt.preventDefault();
  blockSubmitButton();

  const formData = new FormData(uploadForm);

  sendData(formData)
    .then(() => {
      unblockSubmitButton();
      closeUploadOverlay();
      showMessage('success');
    })
    .catch(() => {
      unblockSubmitButton();
      showMessage('error');
    });
};

const initUploadForm = () => {
  if (!uploadForm || !fileInput || !overlay || !cancelButton) {
    return;
  }

  initValidation();

  fileInput.addEventListener('change', onFileInputChange);
  cancelButton.addEventListener('click', onCancelButtonClick);
  uploadForm.addEventListener('submit', onFormSubmit);
  hashtagField.addEventListener('keydown', onTextFieldKeydown);
  commentField.addEventListener('keydown', onTextFieldKeydown);
};

export { initUploadForm };
