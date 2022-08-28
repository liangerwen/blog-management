import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { Form, message } from 'antd';
import { getTags, getCategories, getPost } from '@/services/api';
import type { PostType, PostParams } from '@/services/api';
import type { CategoryOrTag } from '@/services/api';
import { useIntl, history } from 'umi';
import Editor from '@/components/Editor';
import UploadImage from '@/components/UploadImage';
import type { HttpResponse } from '@/services';
import { HttpCode } from '@/services';

export type PropsType = {
  id?: string;
  onSubmit?: (data: PostParams) => Promise<HttpResponse<any>>;
  disabled?: boolean;
};

const PostEdit: React.FC<PropsType> = ({ onSubmit, disabled, id }) => {
  const [categoriyOptions, setCategoryOptions] = useState<CategoryOrTag[]>([]);
  const [tagOptions, setTagOptions] = useState<CategoryOrTag[]>([]);
  const formRef = useRef<ProFormInstance<PostType>>();
  const intl = useIntl();

  const getOptions = async () => {
    const categoriyOptionsRes = await getCategories();
    const tagOptionsRes = await getTags();
    setCategoryOptions(categoriyOptionsRes.data);
    setTagOptions(tagOptionsRes.data);
  };

  useEffect(() => {
    getOptions();
  }, []);

  return (
    <>
      <ProForm<PostType>
        submitter={disabled ? false : undefined}
        onFinish={async (formData) => {
          const successMessage = intl.formatMessage({
            id: 'pages.postForm.submit.success',
            defaultMessage: '提交成功！',
          });
          const newTags = formData.tags?.filter((r) => !tagOptions.map((i) => i.id).includes(r));
          const newCategories = formData.categories?.filter(
            (r) => !categoriyOptions.map((i) => i.id).includes(r),
          );
          const tags = formData.tags?.filter((r) => tagOptions.map((i) => i.id).includes(r));
          const categories = formData.categories?.filter((r) =>
            categoriyOptions.map((i) => i.id).includes(r),
          );
          const res = await onSubmit?.({ ...formData, tags, categories, newTags, newCategories });
          if (res?.code === HttpCode.SUCCESS) {
            message.success(successMessage);
            history.push('/post/list');
          } else {
            message.error(res?.msg);
          }
        }}
        formRef={formRef}
        params={{ id }}
        request={async (params) => {
          if (params.id) {
            const res = await getPost(params.id);
            return res.data;
          }
          return Promise.resolve({} as PostType);
        }}
        // 防止输入回车自动提交
        onKeyPress={() => {}}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="title"
            label={intl.formatMessage({
              id: 'pages.postForm.label.title',
              defaultMessage: '文章标题',
            })}
            tooltip={intl.formatMessage({
              id: 'pages.postForm.tip.title',
              defaultMessage: '最长为 30 位',
            })}
            placeholder={intl.formatMessage({
              id: 'pages.postForm.placeholder.title',
              defaultMessage: '请输入文章标题',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.postForm.rules.title',
                  defaultMessage: '请输入文章标题',
                }),
              },
              {
                max: 30,
                message: intl.formatMessage({
                  id: 'pages.postForm.rules.titleMax',
                  defaultMessage: '最长为 30 位',
                }),
              },
            ]}
            disabled={disabled}
          />
          <ProFormSelect
            options={categoriyOptions.map((r) => ({ value: r.id, label: r.name }))}
            width="sm"
            name="categories"
            label={intl.formatMessage({
              id: 'pages.postForm.label.categories',
              defaultMessage: '分类',
            })}
            placeholder={
              !disabled
                ? intl.formatMessage({
                    id: 'pages.postForm.placeholder.categories',
                    defaultMessage: '请选择分类',
                  })
                : intl.formatMessage({
                    id: 'pages.postForm.placeholder.noCategories',
                    defaultMessage: '暂无分类',
                  })
            }
            mode="tags"
            disabled={disabled}
          />
          <ProFormSelect
            options={tagOptions.map((r) => ({ value: r.id, label: r.name }))}
            width="sm"
            name="tags"
            label={intl.formatMessage({ id: 'pages.postForm.label.tags', defaultMessage: '标签' })}
            mode="tags"
            placeholder={
              !disabled
                ? intl.formatMessage({
                    id: 'pages.postForm.placeholder.tags',
                    defaultMessage: '请选择标签',
                  })
                : intl.formatMessage({
                    id: 'pages.postForm.placeholder.noTags',
                    defaultMessage: '暂无标签',
                  })
            }
            disabled={disabled}
          />
        </ProForm.Group>
        <ProForm.Group>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.postForm.label.coverImg',
              defaultMessage: '封面图片',
            })}
            name="cover_img"
          >
            <UploadImage
              readonly={disabled}
              onUpload={(url) => {
                formRef.current?.setFieldsValue?.({ cover_img: url });
              }}
              onChange={(url) => {
                formRef.current?.setFieldsValue?.({ cover_img: url });
              }}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.postForm.label.topImg',
              defaultMessage: '顶部图片',
            })}
            name="top_img"
          >
            <UploadImage
              readonly={disabled}
              onUpload={(url) => {
                formRef.current?.setFieldsValue?.({ top_img: url });
              }}
              onChange={(url) => {
                formRef.current?.setFieldsValue?.({ top_img: url });
              }}
            />
          </Form.Item>
        </ProForm.Group>
        <ProForm.Item
          label={intl.formatMessage({
            id: 'pages.postForm.label.content',
            defaultMessage: '文章内容',
          })}
          name="content"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.postForm.rules.content',
                defaultMessage: '请输入文章内容',
              }),
            },
          ]}
        >
          <Editor
            readOnly={disabled}
            onChange={(val) => {
              formRef.current?.setFieldsValue?.({ content: val });
            }}
          />
        </ProForm.Item>
      </ProForm>
    </>
  );
};

PostEdit.defaultProps = {
  disabled: false,
};

export default PostEdit;
