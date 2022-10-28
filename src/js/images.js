import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { ImageApiService, PER_PAGE } from './image-search';
import debounce from 'lodash.debounce';

const imageApiService = new ImageApiService();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 100,
});
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  moreBtn: document.querySelector('.load-more'),
};
let renderImgs = 0;
let isSearchEnd = false;
// let totalImgs = 0; сюди змінну забрати щлб не в класі була а обробнику можна
//====================================================================== messages
const END_MSG = () =>
  Notify.info(`We're sorry, but you've reached the end of search results.`);
const ERR_MSG = () =>
  Notify.failure(
    `Sorry, there are no images matching your search query. Please try again.`
  );
const SUCSESS_MSG = quantity =>
  Notify.success(`Hooray! We found ${quantity} images.`);
//======================================================================

refs.form.addEventListener('submit', onSubmitSearch);
// refs.moreBtn.addEventListener('click', getImages);

// hideMoreBtn();
function onSubmitSearch(e) {
  clearResults();
  e.preventDefault();
  scrollToTop();
  //   hideMoreBtn();
  renderImgs = 0;
  imageApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();
  imageApiService.resetResultPage();
  window.addEventListener('scroll', loadNext);

  getImages();
}

function getImages() {
  imageApiService
    .getDataApi()
    .then(({ hits, totalHits }) => {
      renderImgs += hits.length;
      if (!totalHits) {
        window.removeEventListener('scroll', loadNext);
        isSearchEnd = true;
        throw new Error(ERR_MSG());
      }
      searchResultMsg(imageApiService.resultPage, totalHits);
      createMarkup(hits);

      if (totalHits > renderImgs) {
        imageApiService.incrementResultPage();
        // showMoreBtn();
      } else {
        window.removeEventListener('scroll', loadNext);
        isSearchEnd = true;
      }

      if (renderImgs === totalHits && totalHits > PER_PAGE) {
        throw new Error(END_MSG());
      }
    })
    .catch(error => error);
}

function searchResultMsg(currentPage, total) {
  if (currentPage === 1) {
    SUCSESS_MSG(total);
  }
}

function createMarkup(arr) {
  const markup = arr
    .map(
      el =>
        `<div class="photo-card">  <a class="gallery__link" href="${
          el.largeImageURL
        }">
  <img src="${el.webformatURL.split('_640').join('_180')}" alt="${el.tags
          .split('')
          .join('')}" loading="lazy" />
          </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${el.likes}
    </p>
    <p class="info-item">
      <b>Views</b>${el.views}
    </p>
    <p class="info-item">
      <b>Comments</b>${el.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${el.downloads}
    </p>
  </div>
</div>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeEnd', markup);
  console.log(lightbox);
  console.log('оновили галерею');
  lightbox.refresh();
}

function clearResults() {
  refs.gallery.innerHTML = '';
}
//==================================================================show/hide Load More
// function showMoreBtn() {
//   refs.moreBtn.classList.remove('visually-hidden');
// }
// function hideMoreBtn() {
//   refs.moreBtn.classList.add('visually-hidden');
// }
//==================================================================add smooth scroll

// const smoothScroll = debounce(() => {
//   const { height: cardHeight } = document
//     .querySelector('.gallery')
//     .firstElementChild.getBoundingClientRect();
//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// }, 300);

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
//==================================================================infinite scroll

const loadNext = debounce(() => {
  const beforeEndPx = 100;
  if (
    window.scrollY + window.innerHeight >
      document.documentElement.scrollHeight - beforeEndPx &&
    !isSearchEnd
  ) {
    getImages();
  }
}, 150);
