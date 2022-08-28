import React, { useState, useRef, useLayoutEffect } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Menu } from 'antd';
import BaseView from './components/base';
import AccountView from './components/account';
import BlogView from './components/blog';
import styles from './index.less';

const { Item } = Menu;

type SettingsStateKeys = 'base' | 'account' | 'blog';
type SettingsStateMode = 'inline' | 'horizontal';

const Settings: React.FC = () => {
  const menuMap: Record<string, React.ReactNode> = {
    base: '个人设置',
    account: '账号设置',
    blog: '博客设置',
  };

  const [mode, setMode] = useState<SettingsStateMode>('inline');
  const [selectKey, setSelectKey] = useState<SettingsStateKeys>('base');
  const dom = useRef<HTMLDivElement>();

  const resize = () => {
    requestAnimationFrame(() => {
      if (!dom.current) {
        return;
      }
      let newMode: SettingsStateMode = 'inline';
      const { offsetWidth } = dom.current;
      if (dom.current.offsetWidth < 641 && offsetWidth > 400) {
        newMode = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        newMode = 'horizontal';
      }
      setMode(newMode);
    });
  };

  useLayoutEffect(() => {
    if (dom.current) {
      window.addEventListener('resize', resize);
      resize();
    }
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [dom.current]);

  const getMenu = () => {
    return Object.keys(menuMap).map((item) => <Item key={item}>{menuMap[item]}</Item>);
  };

  const renderChildren = () => {
    switch (selectKey) {
      case 'base':
        return <BaseView />;
      case 'account':
        return <AccountView />;
      case 'blog':
        return <BlogView />;
      default:
        return null;
    }
  };

  return (
    <GridContent>
      <div
        className={styles.main}
        ref={(ref) => {
          if (ref) {
            dom.current = ref;
          }
        }}
      >
        <div className={styles.leftMenu}>
          <Menu
            mode={mode}
            selectedKeys={[selectKey]}
            onClick={({ key }) => {
              // @ts-ignore
              setSelectKey(key);
            }}
          >
            {getMenu()}
          </Menu>
        </div>
        <div className={styles.right}>
          <div className={styles.title}>{menuMap[selectKey]}</div>
          {renderChildren()}
        </div>
      </div>
    </GridContent>
  );
};
export default Settings;
