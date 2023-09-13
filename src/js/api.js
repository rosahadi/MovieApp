'use strict';

const API_KEY = '6d88bbfa2fa801668c4ff591ab653b29';
const imageURL = 'https://image.tmdb.org/t/p/';

const fetchDataFromServer = async function (url, callback, optionalParams) {
  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error();

    const data = await response.json();

    callback(data, optionalParams);
  } catch (err) {}
};

export { API_KEY, imageURL, fetchDataFromServer };
