import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading, SettingDrawer } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import { message } from 'antd';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';

import defaultSettings from '../config/defaultSettings';

import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';

import { getAuth } from './utils';
import { getUserInfo } from '@/services/api';
import type { UserInfoData } from '@/services/api';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: UserInfoData;
  fetchUserInfo?: () => Promise<UserInfoData | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo();
      return res.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name || 'BLOG',
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!getAuth() && history.location.pathname !== loginPath) {
        history.push(loginPath);
        message.error('请登录后再进入系统！');
      }
    },
    childrenRender: (dom) => {
      const { location } = history;
      return (
        <>
          {dom}
          {location.pathname !== loginPath && (
            <SettingDrawer
              settings={initialState?.settings || defaultSettings}
              disableUrlParams
              onSettingChange={(nextSettings) =>
                setInitialState({
                  ...initialState,
                  settings: nextSettings,
                })
              }
            />
          )}
        </>
      );
    },
    links: isDev
      ? [
          <Link to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
