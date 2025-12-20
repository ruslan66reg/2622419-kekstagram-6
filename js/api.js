const BASE_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';
const Route = {
  GET_DATA: '/data',
  SEND_DATA: '/',
};

const checkStatus = (response) => {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response;
};

const getData = () =>
  fetch(`${BASE_URL}${Route.GET_DATA}`)
    .then(checkStatus)
    .then((response) => response.json());

const sendData = (body) =>
  fetch(`${BASE_URL}${Route.SEND_DATA}`, {
    method: 'POST',
    body,
  }).then(checkStatus);

export { getData, sendData };
