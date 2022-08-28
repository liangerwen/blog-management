import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Button, List, message, Modal, Row, Space } from 'antd';
import { useRequest } from 'umi';
import moment from 'moment';
import {
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  MessageOutlined,
  RightOutlined,
} from '@ant-design/icons';
import Editor from '@/components/Editor';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { getUserInfo } from '@/services/api';
import type { CommentType } from '@/services/api/leancloud';
import {
  addComment,
  selectComments,
  updateComment,
  delRootComment,
  delReplyComments,
} from '@/services/api/leancloud';
import { HttpCode } from '@/services';
import classNames from 'classnames';

import styles from './index.less';

enum EditorType {
  ADD,
  EDIT,
  REPLY,
}

enum ListType {
  COMMENT,
  REPLY,
}

const CommentList: React.FC<{ url: string }> = ({ url }) => {
  const [comments, setComments] = useState<{
    list: CommentType[];
    total: number;
    loading: boolean;
  }>({
    list: [],
    total: 0,
    loading: true,
  });
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10 });
  const [reply, setReply] = useState<(CommentType & { type: EditorType }) | null>(null);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const formRef = useRef<ProFormInstance>();
  const { data: currentUser } = useRequest(() => {
    return getUserInfo();
  });

  const queryAndSetComments = useCallback(() => {
    setComments({ ...comments, loading: true });
    selectComments({ url, ...queryParams }).then((res) => {
      if (res.code === HttpCode.SUCCESS) {
        setComments({ list: res.data?.data, total: res.data?.count, loading: false });
      } else {
        message.error(res.msg);
      }
    });
  }, [queryParams, url]);

  useEffect(() => {
    queryAndSetComments();
  }, [queryAndSetComments]);

  const renderEditor = (obj: CommentType, type: EditorType) => {
    let content = '';
    if (type === EditorType.EDIT) {
      content = obj.comment.replace(/(<([^>]+)>)/gi, '').replace(/[\r\n]/g, ' ');
    }
    if (obj.rid) {
      content = content.split(`${obj.nick} , `)?.[1] || content;
    }
    return (
      <ProForm
        initialValues={{
          content,
        }}
        submitter={{
          render: (formProps) => {
            return [
              <Button type="primary" key="submit" onClick={() => formProps.form?.submit?.()}>
                提交
              </Button>,
              <Button key="cancel" onClick={() => setReply(null)}>
                取消
              </Button>,
            ];
          },
        }}
        onFinish={async (data) => {
          switch (type) {
            case EditorType.ADD:
              addComment({
                QQAvatar: currentUser?.avatar,
                nick: currentUser?.name,
                comment: data.content,
                url,
              }).then((res) => {
                if (res.code === HttpCode.SUCCESS) {
                  setReply(null);
                  message.success('新增成功！');
                  queryAndSetComments();
                } else {
                  message.error(res.msg);
                }
                return Promise.resolve(true);
              });
              break;
            case EditorType.EDIT:
              updateComment(
                obj.objectId,
                obj.rid
                  ? `<p><a class="at" href="#${obj.objectId}">@${obj.nick}</a> , ${data.content}</p>`
                  : data.content,
              ).then((res) => {
                if (res.code === HttpCode.SUCCESS) {
                  setReply(null);
                  message.success('修改成功！');
                  queryAndSetComments();
                } else {
                  message.error(res.msg);
                }
                return Promise.resolve(true);
              });
              break;
            case EditorType.REPLY:
              addComment({
                QQAvatar: currentUser?.avatar,
                nick: currentUser?.name,
                comment: `<p><a class="at" href="#${obj.objectId}">@${obj.nick}</a> , ${data.content}</p>`,
                pid: obj.objectId,
                rid: obj.rid || obj.objectId,
                url,
              }).then((res) => {
                if (res.code === HttpCode.SUCCESS) {
                  setReply(null);
                  message.success('回复成功！');
                  queryAndSetComments();
                } else {
                  message.error(res.msg);
                }
                return Promise.resolve(true);
              });
              break;
            default:
              break;
          }
        }}
      >
        <ProForm.Item
          name="content"
          rules={[
            {
              required: true,
              message: '请输入内容',
            },
          ]}
        >
          <Editor
            onChange={(val) => {
              formRef.current?.setFieldsValue?.({ content: val });
            }}
          />
        </ProForm.Item>
      </ProForm>
    );
  };

  const renderWarp = (child: React.ReactElement) => <div style={{ flex: 1 }}>{child}</div>;

  const renderContent = (item: CommentType) => (
    <>
      <List.Item.Meta
        avatar={<Avatar src={item.QQAvatar || 'https://joeschmoe.io/api/v1/random'} />}
        title={<span id={item.objectId}>{item.nick}</span>}
        description={
          <span>
            <FieldTimeOutlined /> {moment(item.createdAt).format('YYYY-MM-DD hh:mm:ss')}
          </span>
        }
      />
      <p dangerouslySetInnerHTML={{ __html: item.comment }}></p>
      {reply?.objectId === item.objectId &&
        reply?.type === EditorType.EDIT &&
        renderEditor(item, EditorType.EDIT)}
      {reply?.objectId === item.objectId &&
        reply?.type === EditorType.REPLY &&
        renderEditor(item, EditorType.REPLY)}
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
      {openKeys.includes(item.objectId) && renderList(item.reply as CommentType[], ListType.REPLY)}
    </>
  );

  const renderList = (list: CommentType[], type: ListType = ListType.COMMENT) => {
    return (
      <List
        itemLayout={type === ListType.REPLY ? 'vertical' : 'horizontal'}
        dataSource={list}
        pagination={
          type === ListType.COMMENT
            ? {
                current: queryParams.page,
                pageSize: queryParams.limit,
                total: comments.total,
                onChange: (page, pageSize) => {
                  setQueryParams({ page, limit: pageSize || 10 });
                },
              }
            : undefined
        }
        renderItem={(item) => (
          <List.Item
            style={{ alignItems: 'start' }}
            extra={
              <Space>
                <MessageOutlined
                  style={{ color: '#1890ff' }}
                  onClick={() => {
                    setReply({ ...item, type: EditorType.REPLY });
                  }}
                />
                <EditOutlined
                  style={{ color: '#95de64' }}
                  onClick={() => {
                    setReply({ ...item, type: EditorType.EDIT });
                  }}
                />
                <DeleteOutlined
                  style={{ color: '#ffa39e' }}
                  onClick={() => {
                    const delConfirm = Modal.confirm({
                      content: '删除后无法恢复，确认删除此回复和所有子回复？',
                      cancelText: '再想想',
                      okText: '确定',
                      onOk: (close) => {
                        delConfirm.update({
                          okButtonProps: {
                            loading: true,
                          },
                          cancelButtonProps: {
                            disabled: true,
                          },
                        });
                        if (item.rid) {
                          delReplyComments(item.rid, item.objectId).then((res) => {
                            if (res.code === HttpCode.SUCCESS) {
                              message.success('删除成功！');
                              queryAndSetComments();
                              close();
                            } else {
                              message.error(res.msg);
                            }
                          });
                        } else {
                          delRootComment(item.objectId).then((res) => {
                            if (res.code === HttpCode.SUCCESS) {
                              message.success('删除成功！');
                              queryAndSetComments();
                              close();
                            } else {
                              message.error(res.msg);
                            }
                          });
                        }
                      },
                    });
                  }}
                />
              </Space>
            }
          >
            {type === ListType.COMMENT && (
              <RightOutlined
                className={classNames(styles.spread, {
                  [styles.yes]: openKeys.includes(item.objectId),
                })}
                onClick={() => {
                  openKeys.includes(item.objectId)
                    ? setOpenKeys(openKeys.filter((i) => i !== item.objectId))
                    : setOpenKeys([...openKeys, item.objectId]);
                }}
              />
            )}
            {type === ListType.COMMENT ? renderWarp(renderContent(item)) : renderContent(item)}
          </List.Item>
        )}
      />
    );
  };

  return (
    <>
      <Row justify="end" style={{ marginBottom: '10px' }}>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setReply({ type: EditorType.ADD } as CommentType & { type: EditorType });
            }}
          >
            新增一条
          </Button>
          <Button
            onClick={() => {
              queryAndSetComments();
            }}
            loading={comments.loading}
          >
            刷新列表
          </Button>
        </Space>
      </Row>
      {reply?.type === EditorType.ADD && renderEditor({} as CommentType, EditorType.ADD)}
      {renderList(comments.list)}
    </>
  );
};

export default CommentList;
