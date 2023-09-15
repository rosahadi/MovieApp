'use strict';

import { imageURL } from './api.js';

/**
 * Create a card for a movie or TV show.
 * @param {Object} media - Movie or TV show data
 * @param {string} titleField - The field containing the title (e.g., 'title' for movies, 'name' for TV shows)
 * @param {string} releaseField - The field containing the release date (e.g., 'release_date' for movies, 'first_air_date' for TV shows)
 * @returns {HTMLElement} - Movie or TV show card element
 */
export const createCard = function (
  media,
  titleField,
  releaseField,
  mediaType
) {
  const { poster_path, vote_average, id } = media;

  const releaseYear = media[releaseField]
    ? media[releaseField].split('-')[0]
    : 'N/A';

  const card = document.createElement('div');
  card.classList.add('card');

  card.innerHTML = `
    <figure class="poster-box card-banner">
      <img src="${imageURL}w342${poster_path}" alt="${
    media[titleField]
  }" class="img-cover" loading="lazy">
    </figure>

    <h4 class="title">${media[titleField]}</h4>

    <div class="meta-list">
      <div class="meta-item">
        <span class="material-symbols-outlined star"> grade </span>
        <span class="span">${vote_average.toFixed(1)}</span>
      </div>
    
      <div class="card-badge">${releaseYear}</div>
    </div>

    <a href="./detail.html?type=${mediaType}&id=${id}" title="${
    media[titleField]
  }" class="card-btn"></a>
  `;

  return card;
};
