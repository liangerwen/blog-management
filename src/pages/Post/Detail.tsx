import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import type { IRouteComponentProps } from 'umi';

import Form from './components/Form';

const PostDetail: React.FC<IRouteComponentProps<{ id: string }>> = (props) => {
  return (
    <PageContainer>
      <Card className="card-container">
        <Form id={props.match.params.id} disabled />
      </Card>
    </PageContainer>
  );
};

export default PostDetail;
