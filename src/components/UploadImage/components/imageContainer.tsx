import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import PreviewImages from '@/components/PreviewImages';

import styles from './index.less';
import { useState } from 'react';
import classNames from 'classnames';

type PropsType = {
  canDelete?: boolean;
  url: string;
  onDelete?: () => void;
};

const PreviewImage: React.FC<PropsType> = ({ canDelete, url, onDelete }) => {
  const [isopen, setIsopen] = useState(false);
  return (
    <div className={classNames(styles.previewContainer, { [styles.noImg]: !url })}>
      {url ? (
        <div
          style={{
            backgroundImage: `url(${url})`,
          }}
          className={styles.thumb}
        >
          <EyeOutlined
            className={styles.action}
            onClick={() => {
              setIsopen(true);
            }}
          />
          {canDelete && (
            <DeleteOutlined
              className={styles.action}
              onClick={() => {
                onDelete?.();
              }}
            />
          )}
        </div>
      ) : (
        <span className={styles.noImgTxt}>暂无图片</span>
      )}

      <PreviewImages images={[{ source: url }]} open={isopen} onClose={() => setIsopen(false)} />
    </div>
  );
};

PreviewImage.defaultProps = {
  canDelete: true,
};

export default PreviewImage;
