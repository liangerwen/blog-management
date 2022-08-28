import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message } from 'antd';
import React, { useState, useEffect } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang } from 'umi';
import { throttle } from 'lodash';
import classNames from 'classnames';

import Footer from '@/components/Footer';
import { login, completeDB, initDB } from '@/services/api';
import type { LoginParams } from '@/services/api';
import useMouseXY from '@/hooks/useMouseXY';
import { setAuth } from '@/utils';
import { HttpCode } from '@/services';

import styles from './index.less';
import './customAntd.less';

import Earth from '@/assets/earth.png';
import Man from '@/assets/man.png';
import Planet1 from '@/assets/planet1.png';
import Planet3 from '@/assets/planet3.png';
import Planet4 from '@/assets/planet4.png';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
      background: 'transparent',
      color: '#ff4d4f',
      borderColor: '#ff4d4f',
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [userLoginState, setUserLoginState] = useState<boolean>(true);
  const intl = useIntl();
  const { X, Y } = useMouseXY();
  const [baseTranslate, setBaseTranslate] = useState({ X: 0, Y: 0 });
  const [isInit, setIsInit] = useState(true);

  const changeBaseTranslate = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const gini = 120;
    setBaseTranslate({
      X: -((X - windowWidth / 2) / windowWidth) * gini,
      Y: -((Y - windowHeight / 2) / windowHeight) * gini,
    });
  };

  const checkIsInit = async () => {
    try {
      const init = await completeDB();
      setIsInit(init.code === HttpCode.SUCCESS && init.data === true);
    } catch (e) {
      setIsInit(true);
    }
  };

  useEffect(() => {
    checkIsInit();
  }, []);

  useEffect(() => {
    throttle(changeBaseTranslate, 200)();
  }, [X, Y]);

  const handleSubmit = async (values: LoginParams) => {
    setSubmitting(true);
    if (!isInit) {
      const init = await initDB({ ...values });
      if (init.code === HttpCode.SUCCESS) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.initDB.success',
          defaultMessage: '初始化数据库成功！',
        });
        message.success(defaultLoginSuccessMessage);
        setIsInit(true);
      } else {
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.initDB.failure',
          defaultMessage: '初始化失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
      }
      setSubmitting(false);
      return;
    }
    login({ ...values }).then((res) => {
      if (res.code === HttpCode.SUCCESS) {
        setAuth(res.data.token);
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
      } else {
        setUserLoginState(false);
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
        setSubmitting(false);
      }
    });
  };

  const animationItemListConfig = [
    {
      key: 1,
      gini: 0.5,
      img: Planet1,
    },
    {
      key: 2,
      gini: 0.5,
      img: Man,
    },
    {
      key: 3,
      gini: 0.75,
      img: Earth,
    },
    {
      key: 4,
      gini: 1,
      img: Planet3,
    },
    {
      key: 5,
      gini: 2,
      img: Planet4,
    },
  ];

  return (
    <div className={classNames(styles.container, 'login')}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang reload={false} />}
      </div>
      <ul className={styles.animationBox}>
        {animationItemListConfig.map((i) => (
          <li
            key={i.key}
            className={styles.animationItem}
            style={{
              transform: `translate3d(${baseTranslate.X * i.gini}px, ${
                baseTranslate.Y * i.gini
              }px, 0)`,
            }}
          >
            <img src={i.img} alt="" />
          </li>
        ))}
      </ul>
      <div className={styles.main}>
        <h1 className={styles.title}>
          <em>
            {intl.formatMessage({
              id: 'pages.layouts.userLayout.title',
              defaultMessage: '登录失败，请重试！',
            })}
          </em>
        </h1>
        <ProForm
          initialValues={{
            username: 'liangerwen',
            password: '123456',
          }}
          submitter={{
            searchConfig: {
              submitText: intl.formatMessage({
                id: isInit ? 'pages.login.submit' : 'pages.login.init',
                defaultMessage: '登录',
              }),
            },
            render: (_, dom) => dom.pop(),
            submitButtonProps: {
              loading: submitting,
              size: 'large',
              style: {
                width: '100%',
              },
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as LoginParams);
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.username.placeholder',
              defaultMessage: '用户名',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={styles.prefixIcon} />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
          {!userLoginState && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误！',
              })}
            />
          )}
        </ProForm>
        <div className={styles.footer}></div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
