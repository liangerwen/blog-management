import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'LEW-Blog',
  pwa: false,
  logo: '/favicon.ico',
  iconfontUrl: '',
  menu: {
    locale: true,
  },
  splitMenus: false,
};

export default Settings;
