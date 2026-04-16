import { debounce } from './util.js';

const RANDOM_COUNT = 10;
const RERENDER_DELAY = 500;

const getRandomPhotos = (photos) => {
  const copy = photos.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(RANDOM_COUNT, copy.length));
};

const getDiscussedPhotos = (photos) =>
  photos
    .slice()
    .sort((a, b) => b.comments.length - a.comments.length);

const initFilters = (photos, onFilterChange) => {
  const form = document.querySelector('.img-filters__form');
  const buttons = form.querySelectorAll('.img-filters__button');

  const debouncedRender = debounce(onFilterChange, RERENDER_DELAY);

  const setActiveButton = (activeButton) => {
    buttons.forEach((btn) => btn.classList.remove('img-filters__button--active'));
    activeButton.classList.add('img-filters__button--active');
  };

  form.addEventListener('click', (evt) => {
    const button = evt.target.closest('.img-filters__button');
    if (!button) {
      return;
    }

    setActiveButton(button);

    if (button.id === 'filter-default') {
      debouncedRender(photos.slice());
      return;
    }

    if (button.id === 'filter-random') {
      debouncedRender(getRandomPhotos(photos));
      return;
    }

    if (button.id === 'filter-discussed') {
      debouncedRender(getDiscussedPhotos(photos));
    }
  });
};

export { initFilters };
