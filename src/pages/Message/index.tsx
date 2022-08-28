import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';

import CommentList from '@/components/CommentList';

const Message: React.FC = () => {
  return (
    <PageContainer>
      <Card className="card-container">
        <CommentList url={`/message`} />
      </Card>
    </PageContainer>
  );
};

export default Message;
