/**
 * request 网络请求工具
 */
import { extend } from 'umi-request';
import type { ResponseError, RequestOptionsInit } from 'umi-request';
import { message } from 'antd';
import { history } from 'umi';
import { clearAuth, getAuth } from '@/utils';

export enum HttpCode {
  SUCCESS = 1,
  NOAUTH = 401,
  ERROR = 10000,
}

export type HttpResponse<T = {}> = {
  code: HttpCode;
  data: T;
  msg: string;
};

export type TableData<T = any> = {
  total: number;
  list: T[];
};

export const createErrorResponse = <T = any>(msg?: string): HttpResponse => {
  return {
    code: HttpCode.ERROR,
    data: {} as T,
    msg: msg || '未知错误！',
  };
};

export const createDataResponse = <T = any>(data?: T): HttpResponse<T> => {
  return {
    code: HttpCode.SUCCESS,
    data: data || ({} as T),
    msg: '',
  };
};

const request = extend({
  prefix: process.env.BASE_URL,
  timeout: 3000,
  headers: {
    Accept: 'application/json',
  },
  errorHandler: (error: ResponseError) => {
    /* eslint-disable-next-line */
    console.error(JSON.stringify(error));
  },
});

request.interceptors.request.use((url: string, options: RequestOptionsInit) => {
  const newOptions = options;
  const token = getAuth();
  /* eslint-disable-next-line */
  token && newOptions.headers && (newOptions.headers['Authorization'] = token);

  return {
    url,
    options: newOptions,
  };
});

request.interceptors.response.use(async (res) => {
  const data = await res.json();
  switch (data.code) {
    case HttpCode.NOAUTH:
      message.error(data.msg);
      clearAuth();
      history.push('/user/login');
      break;
    default:
      break;
  }
  return data;
});

export default request;
