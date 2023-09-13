'use strict';

import { API_KEY, fetchDataFromServer } from './api.js';
import { createCard } from './card.js';
import { sidebar } from './sidebar.js';

sidebar();

const pageContent = document.querySelector('[page-content]');

const searchUrl = new URLSearchParams(window.location.search);

const list = searchUrl.get('list');

const formatListName = function (list) {
  if (!list.includes('_')) {
    return list.charAt(0).toUpperCase() + list.slice(1).toLowerCase();
  }

  if (list.includes('_')) {
    const words = list.split('_');

    const formattedList = words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return formattedList;
  }
};

pageContent.innerHTML = `<section class="inner-content movie-list">
                          <div class="title-wrapper">
                          <h2 class="heading">${formatListName(list)}</h2>
                        </div>

                        <div class="grid-list"></div>

                        <button class="btn load-more" load-more>Load More</button>
                        </section>`;

const gridList = document.querySelector('.grid-list');

let currentPage = 1;
let totalPages = 0;

const apiUrl = `https://api.themoviedb.org/3/movie/${list}?api_key=${API_KEY}&page=${currentPage}`;

fetchDataFromServer(apiUrl, function ({ results: movieList, total_pages }) {
  totalPages = total_pages;

  for (const movie of movieList) {
    const movieCard = createCard(movie, 'title', 'release_date', 'movie');

    gridList.appendChild(movieCard);
  }
});

const loadMore = document.querySelector('[load-more]');

loadMore.addEventListener('click', function () {
  if (currentPage >= totalPages) {
    this.style.display = 'none';
    return;
  }

  currentPage++;
  this.classList.add('loading');

  fetchDataFromServer(
    `https://api.themoviedb.org/3/movie/${list}?api_key=${API_KEY}&page=${currentPage}`,
    ({ results: movieList }) => {
      this.classList.remove('loading');

      for (const movie of movieList) {
        const movieCard = createCard(movie, 'title', 'release_date', 'movie');

        gridList.appendChild(movieCard);
      }
    }
  );
});
