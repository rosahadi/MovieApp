'use strict';

import { API_KEY, imageURL, fetchDataFromServer } from './api.js';
import { createCard } from './card.js';
import { sidebar } from './sidebar.js';

sidebar();

const movieId = window.localStorage.getItem('movieId');

const urlParams = new URLSearchParams(window.location.search);
const mediaType = urlParams.get('type');

const pageContent = document.querySelector('[page-content]');

const getGenres = function (genreList) {
  const newGenreList = [];

  for (const { name } of genreList) newGenreList.push(name);

  return newGenreList.join(', ');
};

const getCast = function (cast) {
  const newCastList = cast.slice(0, 10).map(actor => actor.name);
  return newCastList.join(', ');
};

const getDirectors = function (movie) {
  const directors = movie.filter(({ job }) => job === 'Director');

  const directorList = [];
  for (const { name } of directors) directorList.push(name);

  return directorList.join(', ');
};

const getCreatedByName = function (createdByArray) {
  return createdByArray.map(creator => creator.name).join(', ');
};

const filterVideos = function (videoList) {
  return videoList.filter(
    ({ type, site }) =>
      (type === 'Trailer' || type === 'Teaser') && site === 'YouTube'
  );
};

const apiEndpoint =
  mediaType === 'tv'
    ? `https://api.themoviedb.org/3/tv/${movieId}?api_key=${API_KEY}&append_to_response=videos,images,releases`
    : `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=casts,videos,images,releases`;

fetchDataFromServer(apiEndpoint, function (movie) {
  const {
    backdrop_path,
    poster_path,
    genres,
    overview,
    [mediaType === 'tv' ? 'first_air_date' : 'release_date']: releaseDate,
    vote_average,
    [mediaType === 'tv' ? 'name' : 'title']: title,
    videos: { results: videos },
  } = movie;

  let cast;
  let crew;
  let releases;
  let runtime;

  if (mediaType === 'tv') {
    const { created_by, episode_run_time } = movie;
    crew = created_by;
    runtime = episode_run_time?.[0] || 'N/A';
  }

  if (mediaType === 'movie') {
    const {
      casts: { cast: movieCast, crew: movieCrew },
      releases: {
        countries: [{ certification } = { certification: 'N/A' }],
      },
      runtime: movieRuntime,
    } = movie;
    cast = movieCast;
    crew = movieCrew;
    releases = certification;
    runtime = movieRuntime;
  }

  document.title = `${title} - MOVIEAPP`;
  const detail = document.createElement('div');
  detail.classList.add('detail');
  detail.innerHTML = `<div
                            class="backdrop-image"
                            style="background-image: url('${imageURL}${
    'w1280' || 'original'
  }${backdrop_path || poster_path}' )"
                            ></div>
                            <figure class="poster-box poster">
                            <img
                                src="${imageURL}w342${poster_path}"
                              alt="${title}"
                                class="img-cover"
                              />
                            </figure>
                          <div class="detail-box">
                            <div class="detail-content">
                              <h1 class="heading">${title}</h1>
                              <div class="meta-list">
                                <div class="meta-item">
                                  <span class="material-symbols-outlined star"> grade </span>
                                    <span class="span">${vote_average.toFixed(
                                      1
                                    )}</span>
                                  </div>
                                  <div class="separator"></div>
                                  <div class="meta-item">${runtime}m</div>
                                  <div class="separator"></div>
                                  <div class="meta-item">${
                                    releaseDate?.split('-')[0] ?? 'Not Released'
                                  }</div>

                                  ${
                                    mediaType === 'tv'
                                      ? ''
                                      : `<div class="meta-item card-badge">${releases}</div>`
                                  }
                                  
                              </div>
                              <p class="genre">${getGenres(genres)}</p>
                              <p class="overview">
                              ${overview}
                              </p>
                              <ul class="detail-list">

                              ${
                                mediaType === 'tv' || cast.length === 0
                                  ? ''
                                  : `
                              <li class="detail-list-item">
                                <p class="list-name">Starring</p>
                                <p>${getCast(cast)}</p>
                              </li>
                            `
                              }

                              ${
                                (mediaType === 'tv' &&
                                  (!crew || crew.length === 0)) ||
                                crew.length === 0
                                  ? ''
                                  : `<li class="detail-list-item">
                                  <p class="list-name">Directed By</p>
                                  <p>${
                                    mediaType === 'tv'
                                      ? getCreatedByName(crew)
                                      : getDirectors(crew)
                                  }</p>
                                  </li>`
                              }
                              </ul>
                            </div>
    
                            ${
                              videos.length === 0
                                ? ''
                                : `<div class="title-wrapper">
                                    <h3 class="title-large">Trailers and Clips</h3>
                                  </div>`
                            }
                              <div class="slider-list">
                                <div class="slider-inner"></div>
                              </div>
                          </div>
  `;
  for (const { key, name } of filterVideos(videos)) {
    const videoCard = document.createElement('div');
    videoCard.classList.add('video-card');
    videoCard.innerHTML = `
      <iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0"
        frameborder="0" allowfullscreen="1" title="${name}" class="img-cover" loading="lazy"></iframe>
    `;
    detail.querySelector('.slider-inner').appendChild(videoCard);
  }

  pageContent.appendChild(detail);

  if (mediaType === 'movie') {
    fetchDataFromServer(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}&page=1`,
      addSuggestedMovies
    );
  } else {
    fetchDataFromServer(
      `https://api.themoviedb.org/3/tv/${movieId}/recommendations?api_key=${API_KEY}&page=1`,
      addSuggestedMovies
    );
  }
});

const addSuggestedMovies = function ({ results: movieList }) {
  if (movieList.length === 0) {
    return;
  }

  const movieListElem = document.createElement('section');
  movieListElem.classList.add('suggestions');
  movieListElem.ariaLabel = 'You May Also Like';

  movieListElem.innerHTML = `
    <div class="title-wrapper">
      <h3 class="title-large">You May Also Like</h3>
    </div>
    
    <div class="slider-list">
      <div class="slider-inner"></div>
    </div>
  `;

  for (const movie of movieList) {
    const card = createCard(
      movie,
      movie.title ? 'title' : 'name',
      movie.release_date ? 'release_date' : 'first_air_date',
      movie.title ? 'movie' : 'tv'
    );

    movieListElem.querySelector('.slider-inner').appendChild(card);
  }

  pageContent.appendChild(movieListElem);
};
