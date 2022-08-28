import request from '../index';
import type { HttpResponse } from '../index';

export type LoginParams = {
  username?: string;
  passowrd?: string;
};
export type LoginData = {
  token: string;
};
export async function login(data: LoginParams) {
  return request<HttpResponse<LoginData>>('/user/login', {
    method: 'POST',
    data,
  });
}

export type UserInfoData = {
  name: string;
  avatar: string;
};

export async function getUserInfo() {
  return request<HttpResponse<UserInfoData>>('/user', {
    method: 'GET',
  });
}

export type UserType = {
  username: string;
  avatar: string;
  github: string;
  gitee: string;
  description: string;
};

export async function updateUserInfo(data: UserType) {
  return request<HttpResponse>('/user/update', {
    method: 'POST',
    data,
  });
}

export type PasswordType = {
  password: string;
  newPassword: string;
};

export async function editPassword(data: PasswordType) {
  return request<HttpResponse>('/user/editPwd', {
    method: 'POST',
    data,
  });
}
