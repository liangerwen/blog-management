import request from '../index';
import type { HttpResponse } from '../index';

export async function upload(data: FormData) {
  return request<HttpResponse<{ url: string }>>('/upload', {
    method: 'POST',
    data,
    requestType: 'form',
  });
}
