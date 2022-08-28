import request from '../index';
import type { TableData } from '../index';
import type { HttpResponse } from '../index';

export type GetPostsParams = {
  pageSize?: number;
  current?: number;
  title?: string;
  startCreateTime?: number;
  endCreateTime?: number;
  startUpdateTime?: number;
  endUpdateTime?: number;
};
export async function getPosts(data: GetPostsParams) {
  return request<HttpResponse<TableData<PostType>>>('/post/list', {
    method: 'GET',
    params: data,
  });
}

export type PostType = {
  id: number | string;
  title: string;
  categories: (number | string)[];
  tags: (number | string)[];
  content: string;
  cover_img: string;
  top_img: string;
  updateTime?: number;
  createTime?: number;
};

export type PostParams = PostType & {
  newTags: (number | string)[];
  newCategories: (number | string)[];
};

export async function addPost(data: PostParams) {
  return request<HttpResponse>('/post/add', {
    method: 'POST',
    data,
  });
}

export async function editPost(data: PostParams) {
  return request<HttpResponse>('/post/edit', {
    method: 'POST',
    data,
  });
}

export async function getPost(id: number) {
  return request<HttpResponse<PostType>>('/post/detail', {
    method: 'GET',
    params: { id },
  });
}

export async function delPost(ids: (number | string)[]) {
  return request<HttpResponse>('/post/delete', {
    method: 'POST',
    data: { ids },
  });
}

export type CategoryOrTag = {
  id: number | string;
  name: string;
};

export async function getCategories(postId?: number) {
  return request<HttpResponse<CategoryOrTag[]>>('/post/categories', {
    method: 'GET',
    params: postId ? { postId } : {},
  });
}
export async function getTags(postId?: number) {
  return request<HttpResponse<CategoryOrTag[]>>('/post/tags', {
    method: 'GET',
    params: postId ? { postId } : {},
  });
}
