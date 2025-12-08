const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;
const SCALE_DEFAULT = 100;

let imagePreview;
let smallerButton;
let biggerButton;
let scaleValueInput;
let effectLevelFieldset;
let effectLevelValue;
let sliderElement;
let effectsList;

const EFFECTS = {
  chrome: {
    min: 0,
    max: 1,
    step: 0.1,
    start: 1,
    getStyle: (value) => `grayscale(${value})`
  },
  sepia: {
    min: 0,
    max: 1,
    step: 0.1,
    start: 1,
    getStyle: (value) => `sepia(${value})`
  },
  marvin: {
    min: 0,
    max: 100,
    step: 1,
    start: 100,
    getStyle: (value) => `invert(${value}%)`
  },
  phobos: {
    min: 0,
    max: 3,
    step: 0.1,
    start: 3,
    getStyle: (value) => `blur(${value}px)`
  },
  heat: {
    min: 1,
    max: 3,
    step: 0.1,
    start: 3,
    getStyle: (value) => `brightness(${value})`
  }
};

let currentEffect = 'none';

const cacheElements = () => {
  imagePreview = document.querySelector('.img-upload__preview img');
  smallerButton = document.querySelector('.scale__control--smaller');
  biggerButton = document.querySelector('.scale__control--bigger');
  scaleValueInput = document.querySelector('.scale__control--value');
  effectLevelFieldset = document.querySelector('.img-upload__effect-level');
  effectLevelValue = effectLevelFieldset
    ? effectLevelFieldset.querySelector('.effect-level__value')
    : null;
  sliderElement = effectLevelFieldset
    ? effectLevelFieldset.querySelector('.effect-level__slider')
    : null;
  effectsList = document.querySelector('.effects__list');
};

const getScaleValue = () => {
  if (!scaleValueInput) {
    return SCALE_DEFAULT;
  }

  const parsed = parseInt(scaleValueInput.value, 10);

  if (Number.isNaN(parsed)) {
    return SCALE_DEFAULT;
  }

  return parsed;
};

const applyScale = (value) => {
  if (!imagePreview || !scaleValueInput) {
    return;
  }

  const clamped = Math.min(Math.max(value, SCALE_MIN), SCALE_MAX);
  scaleValueInput.value = `${clamped}%`;
  imagePreview.style.transform = `scale(${clamped / 100})`;
};

const onSmallerClick = () => {
  const current = getScaleValue();
  applyScale(current - SCALE_STEP);
};

const onBiggerClick = () => {
  const current = getScaleValue();
  applyScale(current + SCALE_STEP);
};

const hideSlider = () => {
  if (!effectLevelFieldset) {
    return;
  }

  effectLevelFieldset.classList.add('hidden');
};

const showSlider = () => {
  if (!effectLevelFieldset) {
    return;
  }

  effectLevelFieldset.classList.remove('hidden');
};

const updateSliderOptions = (effectName) => {
  if (!sliderElement || !sliderElement.noUiSlider) {
    hideSlider();
    return;
  }

  if (effectName === 'none') {
    hideSlider();
    if (imagePreview) {
      imagePreview.style.filter = 'none';
    }
    if (effectLevelValue) {
      effectLevelValue.value = '';
    }
    return;
  }

  const effect = EFFECTS[effectName];

  showSlider();

  sliderElement.noUiSlider.updateOptions({
    range: {
      min: effect.min,
      max: effect.max
    },
    start: effect.start,
    step: effect.step
  });
};

const onSliderUpdate = (values) => {
  const value = values[0];

  if (effectLevelValue) {
    effectLevelValue.value = value;
  }

  if (!imagePreview) {
    return;
  }

  if (currentEffect === 'none') {
    imagePreview.style.filter = 'none';
    return;
  }

  const effect = EFFECTS[currentEffect];
  imagePreview.style.filter = effect.getStyle(value);
};

const onEffectsListChange = (evt) => {
  if (!evt.target.matches('.effects__radio')) {
    return;
  }

  currentEffect = evt.target.value;
  updateSliderOptions(currentEffect);
};

const initScale = () => {
  applyScale(SCALE_DEFAULT);

  if (smallerButton) {
    smallerButton.addEventListener('click', onSmallerClick);
  }

  if (biggerButton) {
    biggerButton.addEventListener('click', onBiggerClick);
  }
};

const initSlider = () => {
  if (!sliderElement) {
    return;
  }

  if (!window.noUiSlider) {
    hideSlider();
    return;
  }

  window.noUiSlider.create(sliderElement, {
    range: {
      min: 0,
      max: 100
    },
    start: 100,
    step: 1,
    connect: 'lower'
  });

  hideSlider();

  sliderElement.noUiSlider.on('update', onSliderUpdate);
};

const initEffects = () => {
  if (!effectsList) {
    return;
  }

  effectsList.addEventListener('change', onEffectsListChange);
};

const resetImageEffects = () => {
  currentEffect = 'none';
  applyScale(SCALE_DEFAULT);

  if (effectLevelValue) {
    effectLevelValue.value = '';
  }

  if (imagePreview) {
    imagePreview.style.filter = 'none';
  }

  hideSlider();

  if (effectsList) {
    const defaultEffect = effectsList.querySelector('#effect-none');
    if (defaultEffect) {
      defaultEffect.checked = true;
    }
  }
};

const initImageEffects = () => {
  cacheElements();

  if (!imagePreview) {
    return;
  }

  initScale();
  initSlider();
  initEffects();
};

export { initImageEffects, resetImageEffects };
