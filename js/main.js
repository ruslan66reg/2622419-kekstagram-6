// ====== Вспомогательные функции ======
const getRandomInt = (a, b) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const getRandomArrayElement = (array) => array[getRandomInt(0, array.length - 1)];

const createIdGenerator = () => {
  let lastId = 0;
  return () => {
    lastId += 1;
    return lastId;
  };
};

// ====== Исходные данные для генерации ======
const PHOTOS_COUNT = 25;

const COMMENT_SENTENCES = [
  'Всё отлично!',
  'В целом всё неплохо. Но не всё.',
  'Когда вы делаете фотографию, хорошо бы убирать палец из кадра. В конце концов это просто непрофессионально.',
  'Моя бабушка случайно чихнула с фотоаппаратом в руках и у неё получилась фотография лучше.',
  'Я поскользнулся на банановой кожуре и уронил фотоаппарат на кота и у меня получилась фотография лучше.',
  'Лица у людей на фотке перекошены, как будто их избивают. Как можно было поймать такой неудачный момент?!'
];

const AUTHOR_NAMES = [
  'Кекс', 'Рудольф', 'Рокки', 'Мурка', 'Барсик',
  'Артём', 'Ольга', 'Ирина', 'Сэм', 'Василий'
];

const DESCRIPTIONS = [
  'Лучший кадр за сегодня.',
  'Закат на берегу.',
  'Город просыпается.',
  'Кофе и хорошее настроение.',
  'Случайный момент.',
  'Немного архитектуры.',
  'Дорога домой.',
  'Вид с высоты.',
  'Тёплый вечер.',
  'Поймал удачный свет.'
];

// ====== Генераторы сущностей ======
const generateCommentId = createIdGenerator();

const makeCommentMessage = () => {
  const sentencesCount = getRandomInt(1, 2);
  const chosen = [];
  while (chosen.length < sentencesCount) {
    const sentence = getRandomArrayElement(COMMENT_SENTENCES);
    if (!chosen.includes(sentence)) {
      chosen.push(sentence);
    }
  }
  return chosen.join(' ');
};

const createComment = () => ({
  id: generateCommentId(), // уникальный id комментария
  avatar: `img/avatar-${getRandomInt(1, 6)}.svg`,
  message: makeCommentMessage(),
  name: getRandomArrayElement(AUTHOR_NAMES),
});

const createPhoto = (index) => {
  const commentsCount = getRandomInt(0, 30);
  return {
    id: index, // 1..25, без повторов
    url: `photos/${index}.jpg`,
    description: getRandomArrayElement(DESCRIPTIONS),
    likes: getRandomInt(15, 200),
    comments: Array.from({ length: commentsCount }, createComment),
  };
};

const createPhotos = () =>
  Array.from({ length: PHOTOS_COUNT }, (_, i) => createPhoto(i + 1));

// ====== Экспорт в глобальную область (чтобы использовать в других скриптах) ======
window.photos = createPhotos();
