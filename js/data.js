import { getRandomInteger, getRandomArrayElement } from './util.js';
import { NAMES, DESCRIPTIONS, MESSAGES } from './consts.js';

const PHOTOS_COUNT = 25;

const generateMessage = () => {
  const count = getRandomInteger(1, 2);
  const selectedMessages = [];

  for (let i = 0; i < count; i++) {
    selectedMessages.push(getRandomArrayElement(MESSAGES));
  }

  return selectedMessages.join(' ');
};

const generateComments = (count) => {
  const comments = [];

  for (let i = 0; i < count; i++) {
    comments.push({
      id: crypto.randomUUID(),
      avatar: `img/avatar-${getRandomInteger(1, 6)}.svg`,
      message: generateMessage(),
      name: getRandomArrayElement(NAMES)
    });
  }

  return comments;
};

const createPhotos = () => {
  const photos = [];

  for (let i = 1; i <= PHOTOS_COUNT; i++) {
    photos.push({
      id: crypto.randomUUID(),
      url: `photos/${i}.jpg`,
      description: getRandomArrayElement(DESCRIPTIONS),
      likes: getRandomInteger(15, 200),
      comments: generateComments(getRandomInteger(0, 30))
    });
  }

  return photos;
};

export { createPhotos };
