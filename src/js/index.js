'use strict';

import { API_KEY, imageURL, fetchDataFromServer } from './api.js';
import { createCard } from './card.js';
import { sidebar } from './sidebar.js';

sidebar();

const pageContent = document.querySelector('[page-content]');

let currentOpacityInterval = null;

const gradualOpacityTransition = function (
  element,
  duration,
  targetOpacity,
  callback
) {
  const totalSteps = duration;
  let initialOpacity = parseFloat(element.style.opacity || 1);

  // Check if the target opacity is greater than the initial opacity
  const opacityIncrement =
    targetOpacity > initialOpacity
      ? (targetOpacity - initialOpacity) / totalSteps
      : 0;
  const opacityDecrement =
    targetOpacity < initialOpacity
      ? (initialOpacity - targetOpacity) / totalSteps
      : 0;

  const opacityInterval = setInterval(() => {
    // Increment or decrement opacity based on the direction
    if (opacityIncrement > 0) {
      initialOpacity += opacityIncrement;
    }

    if (opacityDecrement > 0) {
      initialOpacity -= opacityDecrement;
    }

    // Ensure opacity stays within bounds
    initialOpacity = Math.min(1, Math.max(0, initialOpacity));

    element.style.opacity = initialOpacity.toFixed(1);

    if (initialOpacity === targetOpacity) {
      clearInterval(opacityInterval);

      if (callback && typeof callback === 'function') {
        // Execute the callback function when the transition is complete
        callback();
      }
    }
  }, 1);
};

// Initialize genre list
let genreList = {};

// Function to convert genre IDs to strings
const genreToString = function (genreIdList) {
  return genreIdList
    .filter(id => genreList[id])
    .map(id => genreList[id])
    .join(', ');
};

// Initialize the page
(async () => {
  await fetchDataFromServer(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`,
    function ({ genres }) {
      for (const { id, name } of genres) {
        genreList[id] = name;
      }

      // Fetch popular movies
      fetchDataFromServer(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`,
        bannerSection
      );
    }
  );

  await fetchDataFromServer(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}&page=1`,
    trendingSection
  );

  await fetchDataFromServer(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=1`,
    topRatedSection
  );

  await fetchDataFromServer(
    `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&page=1`,
    upcomingSection
  );
})();

const bannerSection = function ({ results: movies }) {
  const banner = document.createElement('section');
  banner.classList.add('banner');
  banner.ariaLabel = 'Popular Movies';

  banner.innerHTML = `
    <div class="banner-slider"></div>

    <div class="slider-control">
      <div class="control-inner"></div>
    </div>
  `;

  let controlItemIndex = 0;

  movies.forEach((movie, index) => {
    const {
      backdrop_path,
      genre_ids,
      id,
      overview,
      poster_path,
      release_date,
      title,
      vote_average,
    } = movie;

    // Convert genre IDs to a string
    const genreString = genreToString(genre_ids);

    const sliderItem = document.createElement('div');
    sliderItem.classList.add('slider-item');
    sliderItem.setAttribute('slider-item', '');

    sliderItem.innerHTML = `<img src="${imageURL}w1280${backdrop_path}" alt="${title}" class="img-cover" loading=${
      index === 0 ? 'eager' : 'lazy'
    }>

    <div class="banner-content">
      <h2 class="heading">${title}</h2>

      <div class="meta-list">
        <div class="meta-item">${
          release_date ? release_date.split('-')[0] : 'Not Released'
        }</div>

        <div class="meta-item card-badge">${vote_average}</div>
      </div>

      <p class="genre">${genreString}</p>

      <p class="banner-text">
      ${overview}
      </p>

      <a href="./detail.html?type=movie" class="btn" onclick="getMovieDetail(${id})"
        ><span class="material-symbols-outlined" aria-hidden="true">
          play_circle
        </span>
        <span class="span">Watch Now</span></a
      >
    </div>`;

    banner.querySelector('.banner-slider').appendChild(sliderItem);

    const posterBox = document.createElement('div');
    posterBox.classList.add('poster-box', 'slider-item');
    posterBox.setAttribute('slider-control', `${controlItemIndex}`);

    controlItemIndex++;

    posterBox.innerHTML = `<img src="${imageURL}w154${poster_path}" alt="Slide to ${title}" loading="lazy" draggable="false" class="img-cover">`;

    banner.querySelector('.control-inner').appendChild(posterBox);
  });

  pageContent.appendChild(banner);

  // Add event listeners for banner slider controls

  addHeroSlide();
};

// Function to add event listeners for banner slider controls

const addHeroSlide = function () {
  const sliderItems = document.querySelectorAll('[slider-item]');
  const sliderControls = document.querySelectorAll('[slider-control]');

  let firstSliderItem = sliderItems[0];
  let firstSliderControl = sliderControls[0];

  firstSliderItem.classList.add('active');
  firstSliderControl.classList.add('active');

  const slideItems = function (e) {
    firstSliderItem.classList.remove('active');
    firstSliderControl.classList.remove('active');

    // Get the index of the control that was clicked

    const controlIndex = Number(this.getAttribute('slider-control'));

    sliderItems[controlIndex].classList.add('active');
    this.classList.add('active');

    // Update the currently active item and control

    firstSliderItem = sliderItems[controlIndex];
    firstSliderControl = this;
  };

  addEventOnElements(sliderControls, 'click', slideItems);
};

// Trending section

const trendingSection = function ({ results: movieList }) {
  const trendingEl = createList('Trending');

  pageContent.appendChild(trendingEl);

  const trendingSection = document.querySelector('.trending');
  const sliderInner = trendingSection.querySelector('.slider-inner');

  for (const movie of movieList) {
    const movieCard = createCard(
      movie,
      movie.title ? 'title' : 'name',
      movie.release_date ? 'release_date' : 'first_air_date',
      movie.title ? 'movie' : 'tv'
    );

    sliderInner.appendChild(movieCard);
  }

  // Add click event listeners to anchor elements inside the selector

  const selectors = trendingSection.querySelectorAll('.selector');

  selectors.forEach(selector => {
    const anchors = selector.querySelectorAll('.anchor');
    const background = selector.querySelector('.background');

    anchors.forEach(a => a.classList.remove('selected'));

    anchors.forEach(anchor => {
      anchor.classList.remove('selected');
      anchor.addEventListener('click', () => {
        // Clear any existing opacity interval
        clearInterval(currentOpacityInterval);

        const anchorRect = anchor.getBoundingClientRect();
        const selectorRect = selector.getBoundingClientRect();

        const width = anchorRect.width;
        const offset = anchorRect.left - selectorRect.left - 1;

        background.style.left = `${offset}px`;
        background.style.width = `${width}px`;

        // Add 'selected' class to the clicked anchor
        anchor.classList.add('selected');

        const anchorOnClick = anchor.querySelector('.anchor-click');
        const dataGroup = anchorOnClick.dataset.group;

        // Gradually reduce opacity of the current sliderInner
        gradualOpacityTransition(sliderInner, 300, 0, () => {
          if (dataGroup === 'today') {
            sliderInner.innerHTML = '';

            for (const movie of movieList) {
              const movieCard = createCard(
                movie,
                movie.title ? 'title' : 'name',
                movie.release_date ? 'release_date' : 'first_air_date',
                movie.title ? 'movie' : 'tv'
              );
              sliderInner.appendChild(movieCard);
            }
          }

          if (dataGroup === 'this-week') {
            fetchDataFromServer(
              `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&page=1`,
              function ({ results: movieList }) {
                sliderInner.innerHTML = '';

                for (const movie of movieList) {
                  const movieCard = createCard(
                    movie,
                    movie.title ? 'title' : 'name',
                    movie.release_date ? 'release_date' : 'first_air_date',
                    movie.title ? 'movie' : 'tv'
                  );
                  sliderInner.appendChild(movieCard);
                }
              }
            );
          }

          // Gradually increase opacity of the current sliderInner to 1
          gradualOpacityTransition(sliderInner, 300, 1, () => {
            // Update the currentOpacityInterval and currentDataGroup
            currentOpacityInterval = null;
            anchor.classList.add('selected');
            sliderInner.style.height = '';
          });
        });
      });
    });
  });
};

// Top Rated section

const topRatedSection = function ({ results: movieList }) {
  const trendingEl = createList('Top Rated');

  pageContent.appendChild(trendingEl);

  const topRatedSection = document.querySelector('.top-rated');
  const sliderInner = topRatedSection.querySelector('.slider-inner');

  for (const movie of movieList) {
    const movieCard = createCard(movie, 'title', 'release_date', 'movie');

    sliderInner.appendChild(movieCard);
  }

  // Add click event listeners to anchor elements inside the selector

  const selectors = topRatedSection.querySelectorAll('.selector');

  selectors.forEach(selector => {
    const anchors = selector.querySelectorAll('.anchor');
    const background = selector.querySelector('.background');

    anchors.forEach(a => a.classList.remove('selected'));

    anchors.forEach(anchor => {
      anchor.classList.remove('selected');
      anchor.addEventListener('click', () => {
        // Clear any existing opacity interval
        clearInterval(currentOpacityInterval);

        const anchorRect = anchor.getBoundingClientRect();
        const selectorRect = selector.getBoundingClientRect();

        const width = anchorRect.width;
        const offset = anchorRect.left - selectorRect.left - 1;

        background.style.left = `${offset}px`;
        background.style.width = `${width}px`;

        // Add 'selected' class to the clicked anchor
        anchor.classList.add('selected');

        const anchorOnClick = anchor.querySelector('.anchor-click');
        const dataGroup = anchorOnClick.dataset.group;

        // Gradually reduce opacity of the current sliderInner
        gradualOpacityTransition(sliderInner, 300, 0, () => {
          if (dataGroup === 'movie') {
            sliderInner.innerHTML = '';
            for (const movie of movieList) {
              const movieCard = createCard(
                movie,
                'title',
                'release_date',
                'movie'
              );
              sliderInner.appendChild(movieCard);
            }
          }

          if (dataGroup === 'tv') {
            fetchDataFromServer(
              `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&page=1`,
              function ({ results: movieList }) {
                sliderInner.innerHTML = '';

                for (const movie of movieList) {
                  movie.media_type = 'tv';

                  const movieCard = createCard(
                    movie,
                    'name',
                    'first_air_date',
                    'tv'
                  );
                  sliderInner.appendChild(movieCard);
                }
              }
            );
          }

          // Gradually increase opacity of the current sliderInner to 1
          gradualOpacityTransition(sliderInner, 300, 1, () => {
            // Update the currentOpacityInterval and currentDataGroup
            currentOpacityInterval = null;
            anchor.classList.add('selected');
            sliderInner.style.height = '';
          });
        });
      });
    });
  });
};

const upcomingSection = function ({ results: movieList }) {
  const trendingEl = createList('Upcoming Movies');

  pageContent.appendChild(trendingEl);

  const upcomingSection = document.querySelector('.upcoming-movies');

  const selector = upcomingSection.querySelector('.selector');
  selector.innerHTML = '';

  const sliderInner = upcomingSection.querySelector('.slider-inner');

  for (const movie of movieList) {
    const movieCard = createCard(movie, 'title', 'release_date', 'movie');

    sliderInner.appendChild(movieCard);
  }
};

const createList = function (title) {
  const movieListEl = document.createElement('section');
  movieListEl.classList.add(
    'inner-content',
    `${title.toLowerCase().replace(/\s+/g, '-')}`
  );
  movieListEl.ariaLabel = `${title}`;

  movieListEl.innerHTML = `<div class="title-wrapper">
  <h2 class="title-large">${title}</h2>

  <div class="selector">
    <div class="anchor selected">
      <h3>
        <a
          href="#"
          class="anchor-click"
          data-panel="${
            title === 'Trending' ? 'trending_scroller' : 'type_scroller'
          }"
          data-group="${title === 'Trending' ? 'today' : 'movie'}"
          >${
            title === 'Trending' ? 'Today' : 'Movies'
          } <span class="glyphicons_v2 chevron-down"></span
        ></a>
      </h3>
      <div class="background"></div>
    </div>

    <div class="anchor">
      <h3>
        <a
          href="#"
          class="anchor-click"
          data-panel="${
            title === 'Trending' ? 'trending_scroller' : 'type_scroller'
          }"
          data-group="${title === 'Trending' ? 'this-week' : 'tv'}"
          >${
            title === 'Trending' ? 'This Week' : 'TV'
          }<span class="glyphicons_v2 chevron-down"></span
        ></a>
      </h3>
    </div>
  </div>
</div>

<div class="slider-list">
<div class="slider-inner"></div>
</div>
`;

  return movieListEl;
};
