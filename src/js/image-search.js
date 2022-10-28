import axios from 'axios';

const URL = 'https://pixabay.com/api/';
const PIXABAY_API_KEY = '30842205-cd6932c3783f22601a373589f';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';
const SAFESEARCH = 'true';
export const PER_PAGE = 40;

export class ImageApiService {
  constructor() {
    this.searchQuery = '';
    this.resultPage = 1;
  }

  async getDataApi() {
    try {
      const searchParams = new URLSearchParams({
        key: PIXABAY_API_KEY,
        image_type: IMAGE_TYPE,
        orientation: ORIENTATION,
        safesearch: SAFESEARCH,
        per_page: PER_PAGE,
        page: this.resultPage,
        q: this.searchQuery,
      });

      const url = `${URL}?${searchParams}`;
      const response = await axios.get(url);
      if (!response.status) {
        throw new Error('Something goes wrong');
      }
      return response.data;
    } catch (error) {
      Notify.failure(error.message);
    }
  }

  resetResultPage() {
    this.resultPage = 1;
  }
  incrementResultPage() {
    this.resultPage += 1;
  }

  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
