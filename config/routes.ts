export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'post',
    path: '/post',
    icon: 'table',
    breadcrumbName: 'posts',
    routes: [
      {
        name: 'list',
        path: '/post/list',
        component: './Post/List',
        breadcrumbName: 'list',
      },
      {
        name: 'comment',
        path: '/post/comment/:id',
        component: './Post/Comment',
        breadcrumbName: 'comment',
        hideInMenu: true,
      },
      {
        name: 'detail',
        path: '/post/detail/:id',
        component: './Post/Detail',
        breadcrumbName: 'detail',
        hideInMenu: true,
      },
      {
        name: 'edit',
        path: '/post/edit/:id',
        component: './Post/Edit',
        breadcrumbName: 'edit',
        hideInMenu: true,
      },
      {
        name: 'add',
        path: '/post/add',
        component: './Post/Add',
        breadcrumbName: 'add',
      },
      {
        redirect: '/404',
      },
    ],
  },
  {
    name: 'message',
    path: '/message',
    component: './Message',
    icon: 'message',
    breadcrumbName: 'message',
  },
  {
    name: 'settings',
    path: '/settings',
    component: './Settings',
    icon: 'setting',
    breadcrumbName: 'settings',
  },
  {
    path: '/',
    redirect: '/post/list',
  },
  {
    breadcrumbName: '404',
    component: './404',
  },
];
