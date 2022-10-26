import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { ImageApiService, PER_PAGE } from './image-search';

const imageApiService = new ImageApiService();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 300,
});
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  moreBtn: document.querySelector('.load-more'),
};

const errMsg = `We're sorry, but you've reached the end of search results.`;
const sucsessMsg = `Hooray! We found ${imageApiService.totalHits} images.`;
// const notifyMsg = `We're sorry, but you've reached the end of search results.`;

refs.form.addEventListener('submit', onSubmitSearch);
refs.moreBtn.addEventListener('click', onLoadMore);

hideMoreBtn();

function onSubmitSearch(e) {
  e.preventDefault();
  hideMoreBtn();
  imageApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
  imageApiService.resetResultPage();
  clearResults();
  getImages();
  //================================================================
  showMoreBtn();

  //==================================================================check quantity results and eer msg
  isGalleryEnd();
  //==================================================================
}

function onLoadMore() {
  getImages();
  isGalleryEnd();
}

function isGalleryEnd() {
  const api = imageApiService;
  const imgRendered = api.resultPage * PER_PAGE;
  if (api.totalHits <= imgRendered && api.totalHits > 0) {
    hideMoreBtn();
    return Notify.warning(errMsg);
  }
}

async function getImages() {
  return await imageApiService.getImagess().then(data => console.log(data));
}

function createMarkup(arr) {
  console.log('object');
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
// (function smoothScroll() {
//   const { height: cardHeight } = document
//     .querySelector('.gallery')
//     .firstElementChild.getBoundingClientRect();

//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// })();
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
