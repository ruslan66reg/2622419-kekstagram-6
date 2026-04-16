import { isEscapeKey } from './util.js';
import { sendData } from './api.js';

const uploadForm = document.querySelector('.img-upload__form');
const fileInput = uploadForm.querySelector('.img-upload__input');
const overlay = uploadForm.querySelector('.img-upload__overlay');
const cancelButton = uploadForm.querySelector('.img-upload__cancel');

const hashtagField = uploadForm.querySelector('.text__hashtags');
const commentField = uploadForm.querySelector('.text__description');
const submitButton = uploadForm.querySelector('.img-upload__submit');

const previewImage = uploadForm.querySelector('.img-upload__preview img');
const effectsPreviews = uploadForm.querySelectorAll('.effects__preview');

const scaleSmallerButton = uploadForm.querySelector('.scale__control--smaller');
const scaleBiggerButton = uploadForm.querySelector('.scale__control--bigger');
const scaleValueField = uploadForm.querySelector('.scale__control--value');

const effectsList = uploadForm.querySelector('.effects__list');
const effectLevel = uploadForm.querySelector('.img-upload__effect-level');
const effectLevelValue = uploadForm.querySelector('.effect-level__value');
const effectLevelSlider = uploadForm.querySelector('.effect-level__slider');

const MAX_COMMENT_LENGTH = 140;
const MAX_HASHTAGS = 5;
const HASHTAG_PATTERN = /^#[a-zа-яё0-9]{1,19}$/i;

const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;

const EFFECTS = {
  none: null,
  chrome: { filter: 'grayscale', units: '', min: 0, max: 1, step: 0.1, start: 1 },
  sepia: { filter: 'sepia', units: '', min: 0, max: 1, step: 0.1, start: 1 },
  marvin: { filter: 'invert', units: '%', min: 0, max: 100, step: 1, start: 100 },
  phobos: { filter: 'blur', units: 'px', min: 0, max: 3, step: 0.1, start: 3 },
  heat: { filter: 'brightness', units: '', min: 1, max: 3, step: 0.1, start: 3 },
};

let pristine = null;
let currentScale = SCALE_MAX;
let slider = null;
let currentEffect = 'none';
let currentImageUrl = null;
let isMessageOpen = false;

function normalizeHashtags(value) {
  return value.trim().split(/\s+/).filter((tag) => tag.length > 0);
}

function initValidation() {
  pristine = new Pristine(uploadForm, {
    classTo: 'img-upload__field-wrapper',
    errorClass: 'img-upload__field-wrapper--error',
    successClass: 'img-upload__field-wrapper--success',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextTag: 'span',
    errorTextClass: 'img-upload__error',
  });

  function hasValidHashtagFormat(value) {
    const tags = normalizeHashtags(value);
    return tags.every((tag) => HASHTAG_PATTERN.test(tag));
  }

  function hasValidHashtagCount(value) {
    const tags = normalizeHashtags(value);
    return tags.length <= MAX_HASHTAGS;
  }

  function hasUniqueHashtags(value) {
    const tags = normalizeHashtags(value).map((tag) => tag.toLowerCase());
    return tags.length === new Set(tags).size;
  }

  function validateCommentLength(value) {
    return value.length <= MAX_COMMENT_LENGTH;
  }

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
}

function applyScale(value) {
  currentScale = value;
  previewImage.style.transform = `scale(${value / 100})`;
  scaleValueField.value = `${value}%`;
}

function onScaleSmallerClick() {
  const next = Math.max(SCALE_MIN, currentScale - SCALE_STEP);
  applyScale(next);
}

function onScaleBiggerClick() {
  const next = Math.min(SCALE_MAX, currentScale + SCALE_STEP);
  applyScale(next);
}

function formatSliderValue(value) {
  return String(parseFloat(Number(value).toFixed(2)));
}

function hideSlider() {
  effectLevel.classList.add('hidden');
}

function showSlider() {
  effectLevel.classList.remove('hidden');
}

function applyEffect(value) {
  const effect = EFFECTS[currentEffect];

  if (!effect) {
    previewImage.style.filter = 'none';
    effectLevelValue.value = '';
    return;
  }

  const formatted = formatSliderValue(value);
  const filterValue = effect.units ? `${formatted}${effect.units}` : formatted;

  previewImage.style.filter = `${effect.filter}(${filterValue})`;
  effectLevelValue.value = formatted;
}

function updateSliderOptions(effectName) {
  const effect = EFFECTS[effectName];

  if (!effect) {
    hideSlider();
    if (slider) {
      slider.set(0);
    }
    applyEffect(0);
    return;
  }

  showSlider();

  slider.updateOptions({
    range: {
      min: effect.min,
      max: effect.max,
    },
    start: effect.start,
    step: effect.step,
  });

  slider.set(effect.start);
}

function createSlider() {
  slider = noUiSlider.create(effectLevelSlider, {
    range: {
      min: 0,
      max: 1,
    },
    start: 1,
    step: 0.1,
    connect: 'lower',
  });

  slider.on('update', () => {
    const value = slider.get();
    applyEffect(value);
  });
}

function resetEffects() {
  currentEffect = 'none';
  previewImage.className = '';
  previewImage.style.filter = 'none';

  const noneRadio = uploadForm.querySelector('#effect-none');
  if (noneRadio) {
    noneRadio.checked = true;
  }

  hideSlider();
  effectLevelValue.value = '';
  if (slider) {
    slider.set(0);
  }
}

function onEffectsChange(evt) {
  const target = evt.target;
  if (!target || target.name !== 'effect') {
    return;
  }

  currentEffect = target.value;
  previewImage.className = '';
  if (currentEffect !== 'none') {
    previewImage.classList.add(`effects__preview--${currentEffect}`);
  }

  updateSliderOptions(currentEffect);
}

function onTextFieldKeydown(evt) {
  if (isEscapeKey(evt)) {
    evt.stopPropagation();
  }
}

function revokeImageUrl() {
  if (currentImageUrl) {
    URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = null;
  }
}

function setPreviewFromFile(file) {
  revokeImageUrl();
  currentImageUrl = URL.createObjectURL(file);

  previewImage.src = currentImageUrl;

  effectsPreviews.forEach((el) => {
    el.style.backgroundImage = `url('${currentImageUrl}')`;
  });
}

function openOverlay() {
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
}

function closeOverlay() {
  overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');

  uploadForm.reset();

  if (pristine) {
    pristine.reset();
  }

  applyScale(SCALE_MAX);
  resetEffects();

  revokeImageUrl();

  fileInput.value = '';

  document.removeEventListener('keydown', onDocumentKeydown);
}

function onDocumentKeydown(evt) {
  if (isMessageOpen) {
    return;
  }

  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closeOverlay();
  }
}

function closeMessageFactory(messageElement, onClose) {
  function close() {
    document.removeEventListener('keydown', onEsc);
    messageElement.removeEventListener('click', onClick);
    messageElement.remove();
    isMessageOpen = false;

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  function onEsc(evt) {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      close();
    }
  }

  function onClick(evt) {
    const isButton =
      evt.target.classList.contains('success__button') ||
      evt.target.classList.contains('error__button');

    const isOverlayClick = evt.target === messageElement;

    if (isButton || isOverlayClick) {
      close();
    }
  }

  document.addEventListener('keydown', onEsc);
  messageElement.addEventListener('click', onClick);

  return close;
}

function showMessage(templateId, onClose) {
  const template = document.querySelector(templateId);
  if (!template) {
    return;
  }

  const element = template.content.firstElementChild.cloneNode(true);
  document.body.append(element);

  isMessageOpen = true;
  closeMessageFactory(element, onClose);
}

function showSuccess() {
  showMessage('#success');
}

function showError() {
  overlay.classList.add('hidden');
  showMessage('#error', () => {
    overlay.classList.remove('hidden');
  });
}

function setSubmitDisabled(isDisabled) {
  submitButton.disabled = isDisabled;
  submitButton.textContent = isDisabled ? 'Публикую...' : 'Опубликовать';
}

function onFileInputChange() {
  if (!fileInput.files || fileInput.files.length === 0) {
    return;
  }

  const file = fileInput.files[0];
  setPreviewFromFile(file);

  applyScale(SCALE_MAX);
  resetEffects();

  openOverlay();
}

function onCancelButtonClick() {
  closeOverlay();
}

function onFormSubmit(evt) {
  evt.preventDefault();

  if (pristine && !pristine.validate()) {
    return;
  }

  setSubmitDisabled(true);

  sendData(new FormData(uploadForm))
    .then(() => {
      closeOverlay();
      showSuccess();
    })
    .catch(() => {
      showError();
    })
    .finally(() => {
      setSubmitDisabled(false);
    });
}

function initUploadForm() {
  if (!uploadForm) {
    return;
  }

  initValidation();
  createSlider();
  resetEffects();
  applyScale(SCALE_MAX);

  fileInput.addEventListener('change', onFileInputChange);
  cancelButton.addEventListener('click', onCancelButtonClick);

  hashtagField.addEventListener('keydown', onTextFieldKeydown);
  commentField.addEventListener('keydown', onTextFieldKeydown);

  effectsList.addEventListener('change', onEffectsChange);

  scaleSmallerButton.addEventListener('click', onScaleSmallerClick);
  scaleBiggerButton.addEventListener('click', onScaleBiggerClick);

  uploadForm.addEventListener('submit', onFormSubmit);
}

export { initUploadForm };
