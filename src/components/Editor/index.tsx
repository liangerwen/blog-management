import { useIntl } from 'umi';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import './index.less';

import { upload } from '@/services/api';
import { HttpCode } from '@/services';
import { message } from 'antd';
import mdParser from './md.config';

type PropsType = {
  value?: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
};

const Editor: React.FC<PropsType> = ({ value, onChange, readOnly }) => {
  const intl = useIntl();

  const handleUpload = (file: File) => {
    return new Promise((resolve) => {
      if (!file) resolve('');
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
      upload(data)
        .then((res) => {
          if (res.code === HttpCode.SUCCESS) {
            message.success(successMessage);
            resolve(res.data.url);
          } else {
            resolve('');
            message.error(failMessage);
          }
        })
        .catch(() => {
          resolve('');
          message.error(failMessage);
        });
    });
  };

  return (
    <MdEditor
      htmlClass="lew-post"
      imageAccept="image/*"
      style={{ height: '500px' }}
      value={value || ''}
      readOnly={readOnly}
      view={{ menu: !readOnly, md: true, html: true }}
      onImageUpload={handleUpload}
      placeholder={intl.formatMessage({
        id: 'component.editor.placeholder',
        defaultMessage: '请输入内容...',
      })}
      renderHTML={(text) => mdParser.render(text)}
      onChange={(data) => {
        onChange?.(data.text);
      }}
    />
  );
};

Editor.defaultProps = {
  readOnly: false,
};

export default Editor;
