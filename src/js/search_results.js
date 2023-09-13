'use strict';

import { API_KEY, imageURL, fetchDataFromServer } from './api.js';
import { createCard } from './card.js';
import { sidebar } from './sidebar.js';

sidebar();

const pageContent = document.querySelector('[page-content]');

const urlDecode = function (urlString) {
  return Object.fromEntries(
    urlString
      .replace(/%23/g, '#')
      .replace(/%20/g, ' ')
      .split('&')
      .map(i => i.split('='))
  );
};

const searchUrl = window.location.search.slice(1);
let searchObj = searchUrl && urlDecode(searchUrl);

let searchTerm = searchObj.query;

const searchResult = function ({ results: movieList }) {
  const container = document.createElement('div');
  container.classList.add('search-results-container');

  container.innerHTML = ` <h2 class="title-large">Search Results</h2>

                          <div class="filter-wrapper">
                            <label class="label">Filter:</label>
                            <div class="checkbox-container">
                              <label class="checkbox-label">
                                <input type="radio" name="filter" value="movies" checked />
                                <span class="checkmark"></span>
                                Movies
                                </label>
                                <label class="checkbox-label">
                                <input type="radio" name="filter" value="tv" />
                                <span class="checkmark"></span>
                                TV Shows
                              </label>
                            </div>
                          </div>
  
                          <div class="search-results grid-list"></div>
  `;

  const searchResults = container.querySelector('.search-results');

  for (const movie of movieList) {
    const movieCard = createCard(movie, 'title', 'release_date', 'movie');

    searchResults.appendChild(movieCard);
  }

  pageContent.appendChild(container);

  const filterRadios = document.querySelectorAll('input[name="filter"]');
  let currentFilter = 'movies';

  for (const radio of filterRadios) {
    radio.addEventListener('change', function () {
      currentFilter = this.value;

      if (currentFilter === 'movies') {
        searchResults.innerHTML = '';

        for (const movie of movieList) {
          const movieCard = createCard(movie, 'title', 'release_date', 'movie');

          searchResults.appendChild(movieCard);
        }
      }

      if (currentFilter === 'tv') {
        fetchDataFromServer(
          `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${searchTerm}`,
          function ({ results: movieList }) {
            searchResults.innerHTML = '';

            for (const movie of movieList) {
              const movieCard = createCard(
                movie,
                'name',
                'first_air_date',
                'tv'
              );
              searchResults.appendChild(movieCard);
            }
          }
        );
      }
    });
  }
};

fetchDataFromServer(
  `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`,
  searchResult
);
