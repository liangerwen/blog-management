import request from '../index';
import type { HttpResponse } from '../index';

export async function completeDB() {
  return request<HttpResponse<boolean>>('/db/complete', {
    method: 'GET',
  });
}

export type InitDbParams = {
  username?: string;
  passowrd?: string;
};
export async function initDB(data: InitDbParams) {
  return request<HttpResponse>('/db/init', {
    method: 'POST',
    data,
  });
}
