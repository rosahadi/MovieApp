'use strict';

// Add events on elements

const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) {
    element.addEventListener(eventType, callback);
  }
};

// Function to load and initialize MovieSearch

const loadMovieSearch = async function () {
  const { default: MovieSearch } = await import('./search.js');
  const movieSearch = new MovieSearch();
  movieSearch.initializeEventListeners();
};

// Toggle search box in mobile devices

const searchView = document.querySelector('.search-view');
const searchBtn = document.querySelector('.search-btn');
const searchIcon = document.querySelector('.search-icon');
const closeIcon = document.querySelector('.close-icon');
const searchInput = document.querySelector('.search-input');
const searchResultsContainer = document.querySelector('.search-view-content');

searchBtn.addEventListener('click', () => {
  if (searchView.classList.contains('active')) {
    searchView.classList.remove('active');
    searchIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    searchInput.value = '';

    searchResultsContainer.innerHTML = '';
  } else {
    searchView.classList.add('active');
    searchIcon.style.display = 'none';
    closeIcon.style.display = 'block';
  }
});

// Add an event listener to detect when the search input is focused
searchInput.addEventListener('focus', () => {
  // Load search when the input is focused
  loadMovieSearch();
  searchResultsContainer.classList.add('active');
});

// menu toggle

const menuToggler = document.querySelectorAll('[menu-toggler]');
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const closeMenu = document.querySelectorAll('[menu-close]');
const overlay = document.querySelector('.overlay');

addEventOnElements(menuToggler, 'click', function () {
  sidebar.classList.toggle('active');
  menuBtn.classList.toggle('active');
  overlay.classList.toggle('active');
});

addEventOnElements(closeMenu, 'click', function () {
  sidebar.classList.remove('active');
  menuBtn.classList.remove('active');
  overlay.classList.remove('active');
});
