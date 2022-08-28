import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { addPost } from '@/services/api';
import Form from './components/Form';

const PostAdd: React.FC = () => {
  return (
    <PageContainer>
      <Card className="card-container">
        <Form onSubmit={addPost} />
      </Card>
    </PageContainer>
  );
};

export default PostAdd;
