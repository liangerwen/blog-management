import React, { useRef } from 'react';
import { message } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText } from '@ant-design/pro-form';

import type { PasswordType } from '@/services/api';
import { editPassword } from '@/services/api';
import { HttpCode } from '@/services';

const AccountView: React.FC = () => {
  const formRef = useRef<ProFormInstance<PasswordType>>();
  const handleFinish = async (data: PasswordType) => {
    const res = await editPassword(data);
    if (res.code === HttpCode.SUCCESS) {
      message.success('更新密码成功');
    } else {
      message.error(res.msg);
    }
  };
  return (
    <ProForm
      onFinish={handleFinish}
      submitter={{
        resetButtonProps: {
          style: {
            display: 'none',
          },
        },
        submitButtonProps: {
          children: '更新密码',
        },
      }}
      formRef={formRef}
      // 防止输入回车自动提交
      onKeyPress={() => {}}
    >
      <ProFormText.Password
        width="md"
        name="password"
        label="原密码"
        rules={[
          {
            required: true,
            message: '请输入原密码!',
          },
        ]}
      />
      <ProFormText.Password
        width="md"
        name="newPassword"
        label="新密码"
        rules={[
          {
            required: true,
            message: '请输入新密码!',
          },
          {
            validator: (_rule, value: string, callback) => {
              if (value && value === formRef.current?.getFieldValue('password')) {
                callback('与原密码一致!');
              }
              callback();
            },
          },
        ]}
      />
      <ProFormText.Password
        width="md"
        name="newPassword2"
        label="确认新密码"
        rules={[
          {
            required: true,
            message: '请再次输入新密码!',
          },
          {
            validator: (_rule, value: string, callback) => {
              if (value && value !== formRef.current?.getFieldValue('newPassword')) {
                callback('两次新密码不一致!');
              }
              callback();
            },
          },
        ]}
      />
    </ProForm>
  );
};

export default AccountView;
