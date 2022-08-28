import { useIntl } from 'umi';

import styles from './index.less';

export default () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '亮尔大大',
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.footerDesc}>
        ©{currentYear} By {defaultMessage}
      </p>
    </footer>
  );
};
