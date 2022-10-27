import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { ImageApiService, PER_PAGE } from './image-search';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';

const imageApiService = new ImageApiService();
const lightbox = new SimpleLightbox('.gallery a', {
  //   captionsData: 'alt',
  captionDelay: 300,
});
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  moreBtn: document.querySelector('.load-more'),
};
let renderImgs = 0;
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
refs.moreBtn.addEventListener('click', getImages);

hideMoreBtn();

function onSubmitSearch(e) {
  e.preventDefault();
  hideMoreBtn();
  renderImgs = 0;
  imageApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();
  imageApiService.resetResultPage();
  clearResults();
  getImages();
  //================================================================
  //==================================================================
}

function getImages() {
  imageApiService
    .getDataApi()
    .then(({ hits, totalHits }) => {
      renderImgs += hits.length;

      if (!totalHits) {
        throw new Error(ERR_MSG());
      }
      searchResultMsg(imageApiService.resultPage, totalHits);
      createMarkup(hits);

      if (totalHits > renderImgs) {
        imageApiService.incrementResultPage();
        imageApiService.setTotalHits(totalHits);
        showMoreBtn();
      }
      if (renderImgs === totalHits && totalHits > PER_PAGE) {
        hideMoreBtn();
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
  lightbox.refresh();
}

function clearResults() {
  refs.gallery.innerHTML = '';
}
//==================================================================show/hide Load More
function showMoreBtn() {
  refs.moreBtn.classList.remove('visually-hidden');
}
function hideMoreBtn() {
  refs.moreBtn.classList.add('visually-hidden');
}
//==================================================================add smooth scroll

window.addEventListener(
  'scroll',
  //   debounce(smoothScroll, 300),
  //   throttle(smoothScroll, 1000)
  debounce(smoothScroll, 500)
);

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  console.log('скроллимо');
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
//==================================================================infinite scroll
// let elem = document.querySelector('.gallery');
// let infScroll = new InfiniteScroll(elem, {
//   // options
//   path: '.load-more',
//   append: '.gallery',
//   history: true,
//   hideNav: '.load-more',
// });

// $('.article-feed').infiniteScroll({
//   path: '.pagination__next',
//   append: '.article',
//   status: '.scroller-status',
//   hideNav: '.pagination',
// });
