import request from '../index';
import type { HttpResponse } from '../index';

export type BlogConfigType = {
  music_server: string;
  music_id: string;
  quotes: string[];
  wx_exceptional: string;
  alipay_exceptional: string;
};

export async function getBlogConfig() {
  return request<HttpResponse<BlogConfigType>>('/blog/config', {
    method: 'GET',
  });
}

export async function updateBlogConfig(data: BlogConfigType) {
  return request<HttpResponse>('/blog/config/update', {
    method: 'POST',
    data,
  });
}
