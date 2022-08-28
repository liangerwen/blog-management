import React, { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormList } from '@ant-design/pro-form';
import { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useRequest } from 'umi';
import { getBlogConfig, updateBlogConfig } from '@/services/api';
import { HttpCode } from '@/services';
import { Form, message } from 'antd';
import UploadImage from '@/components/UploadImage';

type BlogType = {
  music_server: string;
  music_id: string;
  quotes: { text: string }[];
  wx_exceptional: string;
  alipay_exceptional: string;
};

const BlogView: React.FC = () => {
  const formRef = useRef<ProFormInstance<BlogType>>();
  const handleFinish = async (data: BlogType) => {
    const res = await updateBlogConfig({ ...data, quotes: data.quotes.map((i) => i.text) });
    if (res.code === HttpCode.SUCCESS) {
      message.success('更改博客配置成功');
    } else {
      message.error(res.msg);
    }
  };

  const { data: blogConfig, loading } = useRequest(() => {
    return getBlogConfig();
  });
  return (
    <>
      {!loading && (
        <ProForm
          onFinish={handleFinish}
          submitter={{
            resetButtonProps: {
              style: {
                display: 'none',
              },
            },
            submitButtonProps: {
              children: '更改设置',
            },
          }}
          formRef={formRef}
          initialValues={{
            ...blogConfig,
            quotes: blogConfig?.quotes?.map((i) => ({ text: i })) || [],
          }}
          hideRequiredMark
          // 防止输入回车自动提交
          onKeyPress={() => {}}
        >
          <ProForm.Group>
            <ProFormSelect
              width="sm"
              name="music_server"
              label="音乐"
              placeholder="音乐平台"
              options={[
                { label: '网易', value: 'netease' },
                { label: '腾讯', value: 'tencent' },
                { label: '酷狗', value: 'kugou' },
                { label: '虾米', value: 'xiami' },
                { label: '百度', value: 'baidu' },
              ]}
              rules={[
                {
                  required: true,
                  message: '请选择音乐平台!',
                },
              ]}
            ></ProFormSelect>
            <ProFormText
              width="md"
              name="music_id"
              label=" "
              placeholder="歌曲ID /播放列表ID /专辑ID"
              rules={[
                {
                  required: true,
                  message: '请输入ID!',
                },
              ]}
            />
          </ProForm.Group>
          <ProFormList
            name="quotes"
            label="首屏励志语录"
            initialValue={[]}
            copyIconProps={false}
            rules={[
              {
                validator: async (_, value) => {
                  if (value && value.length > 0) {
                    return;
                  }
                  throw new Error('至少要有一项！');
                },
              },
            ]}
          >
            <ProFormText
              name="text"
              width="md"
              rules={[{ required: true, message: '请输入语录' }]}
            />
          </ProFormList>
          <ProForm.Group>
            <Form.Item
              label="微信收款码"
              name="wx_exceptional"
              rules={[
                {
                  required: true,
                  message: '请上传微信收款码!',
                },
              ]}
            >
              <UploadImage
                onUpload={(url) => {
                  formRef.current?.setFieldsValue?.({ wx_exceptional: url });
                }}
                onChange={(url) => {
                  formRef.current?.setFieldsValue?.({ wx_exceptional: url });
                }}
              />
            </Form.Item>
            <Form.Item
              label="支付宝收款码"
              name="alipay_exceptional"
              rules={[
                {
                  required: true,
                  message: '请上传支付宝收款码!',
                },
              ]}
            >
              <UploadImage
                onUpload={(url) => {
                  formRef.current?.setFieldsValue?.({ alipay_exceptional: url });
                }}
                onChange={(url) => {
                  formRef.current?.setFieldsValue?.({ alipay_exceptional: url });
                }}
              />
            </Form.Item>
          </ProForm.Group>
        </ProForm>
      )}
    </>
  );
};

export default BlogView;
