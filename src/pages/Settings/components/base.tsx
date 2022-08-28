import React, { useRef } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, message, Form, Row, Col } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { useIntl, useModel, useRequest } from 'umi';

import styles from './BaseView.less';
import type { UserType } from '@/services/api';
import { getUserInfo, updateUserInfo } from '@/services/api';
import { upload } from '@/services/api';
import { HttpCode } from '@/services';

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({
  value = '',
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) => {
  const intl = useIntl();
  return (
    <>
      <div className={styles.avatar}>
        <img src={value} alt="avatar" />
      </div>
      <Upload
        showUploadList={false}
        beforeUpload={() => false}
        onChange={({ file }) => {
          if (!file) return;
          const successMessage = intl.formatMessage({
            id: 'component.uploadImage.success',
            defaultMessage: '上传成功！',
          });
          const failMessage = intl.formatMessage({
            id: 'component.uploadImage.failed',
            defaultMessage: '上传失败！',
          });
          const data = new FormData();
          // @ts-ignore
          data.append('file', file);
          upload(data)
            .then((res) => {
              if (res.code === HttpCode.SUCCESS) {
                message.success(successMessage);
                onChange?.(res.data.url);
              } else {
                message.error(failMessage);
              }
            })
            .catch(() => {
              message.error(failMessage);
            });
        }}
      >
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            更换头像
          </Button>
        </div>
      </Upload>
    </>
  );
};

const BaseView: React.FC = () => {
  const { data: currentUser, loading } = useRequest(() => {
    return getUserInfo();
  });
  const formRef = useRef<ProFormInstance<UserType>>();
  const { refresh } = useModel('@@initialState');

  const handleFinish = async (data: UserType) => {
    const res = await updateUserInfo(data);
    if (res.code === HttpCode.SUCCESS) {
      message.success('更新基本信息成功');
      refresh();
    } else {
      message.error(res.msg);
    }
  };
  return (
    <div className={styles.baseView}>
      {!loading && (
        <div className={styles.left}>
          <ProForm
            onFinish={handleFinish}
            formRef={formRef}
            submitter={{
              resetButtonProps: {
                style: {
                  display: 'none',
                },
              },
              submitButtonProps: {
                children: '更新基本信息',
              },
            }}
            initialValues={{
              ...currentUser,
            }}
            // 防止输入回车自动提交
            onKeyPress={() => {}}
          >
            <Row gutter={[16, 16]}>
              <Col
                xxl={{ span: 6, order: 2 }}
                sm={{ span: 12, order: 2 }}
                xs={{ span: 24, order: 1 }}
              >
                <Form.Item label="头像" name="avatar" className={styles.right}>
                  <AvatarView
                    onChange={(url) => {
                      formRef.current?.setFieldsValue?.({ avatar: url });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col
                xxl={{ span: 6, order: 1 }}
                sm={{ span: 12, order: 1 }}
                xs={{ span: 24, order: 2 }}
              >
                <ProFormText
                  width="md"
                  name="name"
                  label="昵称"
                  rules={[
                    {
                      required: true,
                      message: '请输入您的昵称!',
                    },
                  ]}
                />
                <ProFormText
                  width="md"
                  name="github"
                  label="GitHub账号地址"
                  rules={[
                    {
                      pattern:
                        /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
                      message: '请输入正确的地址!',
                    },
                  ]}
                />
                <ProFormText
                  width="md"
                  name="gitee"
                  label="Gitee账号地址"
                  rules={[
                    {
                      pattern:
                        /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
                      message: '请输入正确的地址!',
                    },
                  ]}
                />
                <ProFormTextArea name="description" label="个人简介" placeholder="个人简介" />
              </Col>
            </Row>
          </ProForm>
        </div>
      )}
    </div>
  );
};

export default BaseView;
