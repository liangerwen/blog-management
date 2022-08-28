import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { editPost } from '@/services/api';
import Form from './components/Form';
import type { IRouteComponentProps } from 'umi';

const PostAdd: React.FC<IRouteComponentProps<{ id: string }>> = (props) => {
  return (
    <PageContainer>
      <Card className="card-container">
        <Form
          id={props.match.params.id}
          onSubmit={(formData) => editPost({ ...formData, id: props.match.params.id })}
        />
      </Card>
    </PageContainer>
  );
};

export default PostAdd;
