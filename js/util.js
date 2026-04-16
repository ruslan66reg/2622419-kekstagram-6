const getRandomInteger = (a, b) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

const getRandomArrayElement = (elements) => elements[getRandomInteger(0, elements.length - 1)];

const isEscapeKey = (evt) => evt.key === 'Escape';

function debounce(callback, timeoutDelay = 500) {
  let timeoutId;
  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
}

const showDataError = (message = 'Не удалось загрузить данные') => {
  const existing = document.querySelector('.data-error');
  if (existing) {
    existing.remove();
  }

  const el = document.createElement('div');
  el.classList.add('data-error');
  el.textContent = message;

  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.right = '0';
  el.style.top = '0';
  el.style.padding = '12px 16px';
  el.style.zIndex = '100';
  el.style.fontSize = '16px';
  el.style.lineHeight = '20px';
  el.style.textAlign = 'center';
  el.style.background = '#ff4d4d';
  el.style.color = '#fff';

  document.body.append(el);
};

export { getRandomInteger, getRandomArrayElement, isEscapeKey, debounce, showDataError };
