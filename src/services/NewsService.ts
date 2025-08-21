import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://my-json-server.typicode.com/ArwynHwyl/953331-Project-Component',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
export default {
  getNews(perPage: Number, page: Number) {
    return apiClient.get('/news?_limit=' + perPage + '&_page=' + page);
  },
  getCommentsByNewsId(newsId: number) {
    return apiClient.get(`/comments?newsId=${newsId}`);
  },
  getAllComments() {
    return apiClient.get('/comments');
  }
}

