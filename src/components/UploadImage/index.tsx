import { createRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useIntl } from 'umi';

import { upload as UploadImg } from '@/services/api';
import { HttpCode } from '@/services';
import PreviewImage from './components/imageContainer';

import styles from './index.less';

type PropsType = {
  onUpload: (url: string) => void;
  onChange?: (url: string) => void;
  readonly?: boolean;
  url?: string;
  value?: string;
};

const UploadImage: React.FC<PropsType> = (props) => {
  const { onUpload, readonly, url, value, onChange } = props;
  const intl = useIntl();
  const input = createRef<HTMLInputElement>();
  const [imageUrl, setImageUrl] = useState<string>(url || value || '');

  const handleUpload = (file: File | null | undefined) => {
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
    data.append('file', file);
    UploadImg(data)
      .then((res) => {
        if (res.code === HttpCode.SUCCESS) {
          message.success(successMessage);
          onUpload(res.data.url);
          setImageUrl(res.data.url);
          onChange?.(res.data.url);
        } else {
          message.error(failMessage);
        }
      })
      .catch(() => {
        message.error(failMessage);
      });
  };
  return (
    <div className={styles.uploadContainer}>
      <PreviewImage
        canDelete={!readonly}
        url={imageUrl}
        onDelete={() => {
          setImageUrl('');
          onChange?.('');
        }}
      />
      {!readonly && (
        <div
          className={styles.uploadBtn}
          onClick={() => {
            input.current?.click();
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={input}
            onChange={(e) => {
              if (e.target.files?.[0]?.type?.startsWith('image/')) {
                handleUpload(e.target.files?.[0]);
              } else {
                const typeErrorMessage = intl.formatMessage({
                  id: 'component.uploadImage.typeError',
                  defaultMessage: '文件只能为图片格式！',
                });
                message.error(typeErrorMessage);
              }
              e.target.value = '';
            }}
          />
          <PlusOutlined />
        </div>
      )}
    </div>
  );
};

UploadImage.defaultProps = {
  readonly: false,
  url: '',
};

export default UploadImage;
