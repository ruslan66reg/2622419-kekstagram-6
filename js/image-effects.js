const MIN_SCALE = 25;
const MAX_SCALE = 100;
const SCALE_STEP = 25;

const scaleSmaller = document.querySelector('.scale__control--smaller');
const scaleBigger = document.querySelector('.scale__control--bigger');
const scaleValue = document.querySelector('.scale__control--value');
const previewImage = document.querySelector('.img-upload__preview img');

const effectsForm = document.querySelector('.img-upload__effects');
const effectLevelContainer = document.querySelector('.img-upload__effect-level');
const effectLevelValue = document.querySelector('.effect-level__value');
const sliderElement = document.querySelector('.effect-level__slider');

const EFFECTS = {
  none: null,
  chrome: { min: 0, max: 1, start: 1, step: 0.1, filter: (v) => `grayscale(${v})` },
  sepia: { min: 0, max: 1, start: 1, step: 0.1, filter: (v) => `sepia(${v})` },
  marvin: { min: 0, max: 100, start: 100, step: 1, filter: (v) => `invert(${v}%)` },
  phobos: { min: 0, max: 3, start: 3, step: 0.1, filter: (v) => `blur(${v}px)` },
  heat: { min: 1, max: 3, start: 3, step: 0.1, filter: (v) => `brightness(${v})` },
};

let currentEffect = 'none';
let currentScale = 100;

const formatValue = (value) => String(parseFloat(value));

const applyScale = () => {
  scaleValue.value = `${currentScale}%`;
  previewImage.style.transform = `scale(${currentScale / 100})`;
};

const setScale = (next) => {
  currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
  applyScale();
};

const showSlider = () => {
  effectLevelContainer.classList.remove('hidden');
};

const hideSlider = () => {
  effectLevelContainer.classList.add('hidden');
};

const applyEffect = (value) => {
  if (currentEffect === 'none') {
    previewImage.style.filter = 'none';
    effectLevelValue.value = '';
    return;
  }
  const v = formatValue(value);
  effectLevelValue.value = v;
  previewImage.style.filter = EFFECTS[currentEffect].filter(v);
};

const updateSlider = () => {
  if (currentEffect === 'none') {
    hideSlider();
    applyEffect('');
    return;
  }

  const cfg = EFFECTS[currentEffect];
  showSlider();

  sliderElement.noUiSlider.updateOptions(
    {
      range: { min: cfg.min, max: cfg.max },
      start: cfg.start,
      step: cfg.step,
      connect: 'lower',
    },
    false
  );

  sliderElement.noUiSlider.set(cfg.start);
};

const onSliderUpdate = (values) => {
  applyEffect(values[0]);
};

const onEffectChange = (evt) => {
  const target = evt.target;
  if (!target || target.name !== 'effect') {
    return;
  }
  currentEffect = target.value;
  updateSlider();
};

const resetEffects = () => {
  currentEffect = 'none';
  previewImage.style.filter = 'none';
  effectLevelValue.value = '';
  hideSlider();
  if (sliderElement.noUiSlider) {
    sliderElement.noUiSlider.set(1);
  }
};

const resetScale = () => {
  currentScale = 100;
  applyScale();
};

const initImageEffects = () => {
  if (!sliderElement.noUiSlider) {
    noUiSlider.create(sliderElement, {
      range: { min: 0, max: 1 },
      start: 1,
      step: 0.1,
      connect: 'lower',
    });
    sliderElement.noUiSlider.on('update', onSliderUpdate);
  }

  resetScale();
  resetEffects();

  scaleSmaller.addEventListener('click', () => setScale(currentScale - SCALE_STEP));
  scaleBigger.addEventListener('click', () => setScale(currentScale + SCALE_STEP));

  effectsForm.addEventListener('change', onEffectChange);
};

export { initImageEffects, resetScale, resetEffects };
