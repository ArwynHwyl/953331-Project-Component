import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://my-json-server.typicode.com/ArwynHwyl/953331-Project-Component',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
export default {
  getNews(){
    return apiClient.get('/news');
  }
}
