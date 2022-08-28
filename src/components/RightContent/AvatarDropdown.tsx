import React, { useCallback } from 'react';
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import { FormattedMessage, history, useModel } from 'umi';
import { stringify } from 'querystring';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { clearAuth } from '@/utils';
import { useEffect } from 'react';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const { query = {}, pathname } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note
  clearAuth();
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: pathname,
      }),
    });
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    if (!initialState?.currentUser) {
      const data = await initialState?.fetchUserInfo?.();
      setInitialState({ ...initialState, currentUser: data });
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        loginOut();
        return;
      }
      history.push(`/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {menu && (
        <Menu.Item key="settings">
          <SettingOutlined />
          <FormattedMessage id="component.avatar.options.settings" defaultMessage="个人设置" />
        </Menu.Item>
      )}
      {menu && <Menu.Divider />}

      <Menu.Item key="logout">
        <LogoutOutlined />
        <FormattedMessage id="component.avatar.options.logout" defaultMessage="退出登录" />
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      {!initialState ? (
        loading
      ) : (
        <HeaderDropdown overlay={menuHeaderDropdown}>
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar
              size="small"
              className={styles.avatar}
              src={
                initialState.currentUser?.avatar ||
                'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
              }
              alt="avatar"
            />
            <span className={`${styles.name} anticon`}>
              {initialState.currentUser?.name || 'liangerwen'}
            </span>
          </span>
        </HeaderDropdown>
      )}
    </>
  );
};

export default AvatarDropdown;
