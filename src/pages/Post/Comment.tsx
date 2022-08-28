import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import type { IRouteComponentProps } from 'umi';

import CommentList from '@/components/CommentList';

const PostComment: React.FC<IRouteComponentProps<{ id: string }>> = (props) => {
  return (
    <PageContainer>
      <Card className="card-container">
        <CommentList url={`/posts/${props.match.params.id}`} />
      </Card>
    </PageContainer>
  );
};

export default PostComment;
