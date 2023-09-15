'use strict';

import { API_KEY, fetchDataFromServer } from './api.js';

class MovieSearch {
  constructor() {
    // DOM elements
    this.searchInput = document.querySelector('.search-input');
    this.searchResultsContainer = document.querySelector(
      '.search-view-content'
    );
    this.searchForm = document.querySelector('.search-bar');
  }

  // Initialize event listeners for search input and form submission
  initializeEventListeners() {
    // Debounced search input event listener
    this.searchInput.addEventListener(
      'input',
      this.debounce(this.handleSearch.bind(this), 300)
    );

    // Form submission event listener
    this.searchForm.addEventListener(
      'submit',
      this.handleFormSubmit.bind(this)
    );
  }

  // Debounce function for input events
  debounce(func, wait) {
    let timeout;
    return function () {
      const later = () => {
        clearTimeout(timeout);
        func();
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Callback function for handling search results
  handleSearchCallback(data) {
    this.searchResultsContainer.innerHTML = '';

    const searchList = document.createElement('div');
    searchList.classList.add('list');

    const movieResults = data.results
      .filter(result => result.media_type === 'movie')
      .slice(0, 2);
    const tvShowResults = data.results
      .filter(result => result.media_type === 'tv')
      .slice(0, 2);

    movieResults.forEach(result => {
      const id = result.id;

      const resultItem = document.createElement('div');
      resultItem.classList.add('item-list');

      resultItem.innerHTML = `<a href="./detail.html?type=movie&id=${id}" class="list-item">
                                  <span class="material-symbols-outlined">theaters</span>
                                  <div class="item-info">
                                  <span class="item-title">${result.title}</span>
                                  <span class="item-type">In Movies</span>
                                  </div>
                                </a>`;

      searchList.appendChild(resultItem);
    });

    tvShowResults.forEach(result => {
      const id = result.id;

      const resultItem = document.createElement('div');
      resultItem.classList.add('item-list');

      resultItem.innerHTML = `<a href="./detail.html?type=tv&id=${id}" class="list-item">
                                  <span class="material-symbols-outlined">tv</span>
                                  <div class="item-info">
                                  <span class="item-title">${result.name}</span>
                                  <span class="item-type">In TV Shows</span>
                                  </div>
                                </a>`;

      searchList.appendChild(resultItem);
    });

    this.searchResultsContainer.appendChild(searchList);

    const searchBar = document.querySelector('.search-bar');

    if (this.searchResultsContainer.children.length > 0) {
      // Add the styles when there are items in search-view-content
      searchBar.style.borderBottomLeftRadius = '0';
      searchBar.style.borderBottomRightRadius = '0';
    } else {
      // Reset styles when there are no items in search-view-content
      searchBar.style.borderBottomLeftRadius = '';
      searchBar.style.borderBottomRightRadius = '';
    }
  }

  // Function to handle search based on user input
  handleSearch() {
    const searchTerm = this.searchInput.value.trim();
    this.searchResultsContainer.innerHTML = '';

    if (!searchTerm.length > 2) return;

    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${searchTerm}`;

    fetchDataFromServer(searchUrl, this.handleSearchCallback.bind(this));
  }

  // Function to handle form submission and redirection
  handleFormSubmit(e) {
    e.preventDefault();
    const searchTerm = this.searchInput.value.trim();

    const filterObj = {
      query: searchTerm,
    };

    const searchQuery = this.urlEncode(filterObj);
    const root = window.location.origin;

    // Redirect to search-results.html with the selected search type
    window.location = `${root}/search-results.html?${searchQuery}`;
  }

  // Utility function to URL encode an object
  urlEncode(urlObj) {
    return Object.entries(urlObj)
      .join('&')
      .replace(/,/g, '=')
      .replace(/#/g, '%23');
  }
}

export default MovieSearch;
