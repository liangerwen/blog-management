import { PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, message, Modal } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage, history } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import moment from 'moment';

import { getPosts, delPost, getTags, getCategories } from '@/services/api';
import type { CategoryOrTag, GetPostsParams, PostType } from '@/services/api';
import { Arr2Obj } from '@/utils';
import { HttpCode } from '@/services';
import PreviewImages from '@/components/PreviewImages';
import MarkdownIt from 'markdown-it';

const fetchPostsData = async (params: GetPostsParams) => {
  const res = await getPosts(params);
  if (res.code === HttpCode.SUCCESS) {
    return {
      data: res.data.list,
      total: res.data.total,
      success: true,
    };
  }
  return {
    data: [],
    total: 0,
    success: false,
  };
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowsState, setSelectedRows] = useState<PostType[]>([]);
  const [categoriyOptions, setCategoryOptions] = useState<CategoryOrTag[]>([]);
  const [tagOptions, setTagOptions] = useState<CategoryOrTag[]>([]);
  const [preview, setPreview] = useState({
    open: false,
    url: '',
  });
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

  const handleDelete = (removeRows: PostType[]) => {
    const titleMessage = intl.formatMessage({
      id: 'pages.postsList.delete.modal.title',
      defaultMessage: '提示',
    });
    const contentMessage = intl.formatMessage({
      id: 'pages.postsList.delete.modal.content',
      defaultMessage: '确定删除？',
    });
    const loadingMessage = intl.formatMessage({
      id: 'pages.postsList.delete.loading',
      defaultMessage: '正在删除',
    });
    const successMessage = intl.formatMessage({
      id: 'pages.postsList.delete.success',
      defaultMessage: '删除成功',
    });
    const failedMessage = intl.formatMessage({
      id: 'pages.postsList.delete.failed',
      defaultMessage: '删除失败，请重试',
    });
    Modal.confirm({
      title: titleMessage,
      content: contentMessage,
      onOk: async () => {
        const hide = message.loading(loadingMessage);
        if (!removeRows) return;
        try {
          const res = await delPost(removeRows.map((i) => i.id));
          if (res.code === HttpCode.SUCCESS) {
            setSelectedRows([]);
            actionRef?.current?.reloadAndRest?.();
            message.success(successMessage);
          } else {
            message.error(failedMessage);
          }
        } catch (error) {
          message.error(failedMessage);
        } finally {
          hide();
        }
      },
    });
  };

  const columns: ProColumns<PostType>[] = [
    {
      align: 'center',
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.title" defaultMessage="标题" />,
      align: 'center',
      dataIndex: 'title',
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.categories" defaultMessage="分类" />,
      align: 'center',
      dataIndex: 'categories',
      valueType: 'select',
      valueEnum: Arr2Obj(categoriyOptions, 'id', 'name'),
      search: false,
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.tags" defaultMessage="标签" />,
      align: 'center',
      dataIndex: 'tags',
      valueType: 'select',
      valueEnum: Arr2Obj(tagOptions, 'id', 'name'),
      search: false,
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.content" defaultMessage="内容" />,
      align: 'center',
      dataIndex: 'content',
      search: false,
      render: (val) => {
        const mdParser = new MarkdownIt({ html: false });
        return (
          <p
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              margin: '0',
              maxWidth: '150px',
            }}
            dangerouslySetInnerHTML={{
              __html: mdParser
                .render(val as string)
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/[\r\n]/g, ' '),
            }}
          ></p>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.coverImg" defaultMessage="封面图片" />,
      align: 'center',
      dataIndex: 'cover_img',
      search: false,
      render: (val) =>
        val === '-' ? (
          <span>暂无图片</span>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setPreview({
                open: true,
                url: val as string,
              });
            }}
          >
            预览
          </Button>
        ),
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.topImg" defaultMessage="顶部图片" />,
      align: 'center',
      dataIndex: 'top_img',
      search: false,
      render: (val) =>
        val === '-' ? (
          <span>暂无图片</span>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setPreview({
                open: true,
                url: val as string,
              });
            }}
          >
            预览
          </Button>
        ),
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.createTime" defaultMessage="创建时间" />,
      dataIndex: 'create_time',
      valueType: 'dateTime',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.createTime" defaultMessage="创建时间" />,
      dataIndex: 'create_time',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startCreateTime: moment(value[0]).valueOf(),
            endCreateTime: moment(value[1]).valueOf(),
          };
        },
      },
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.updateTime" defaultMessage="更新时间" />,
      dataIndex: 'update_time',
      valueType: 'dateTime',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.updateTime" defaultMessage="更新时间" />,
      dataIndex: 'update_time',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startUpdateTime: moment(value[0]).valueOf(),
            endUpdateTime: moment(value[1]).valueOf(),
          };
        },
      },
    },
    {
      title: <FormattedMessage id="pages.postsList.colums.option" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown.Button
          type="primary"
          onClick={() => {
            history.push(`/post/detail/${record.id}`);
          }}
          overlay={
            <Menu>
              <Menu.Item
                key="1"
                className="ant-btn-text"
                style={{ color: '#ffa940' }}
                onClick={() => {
                  history.push(`/post/comment/${record.id}`);
                }}
              >
                <FormattedMessage
                  id="pages.postsList.colums.option.message"
                  defaultMessage="评论"
                />
              </Menu.Item>
              <Menu.Item
                key="2"
                className="ant-btn-link"
                style={{ color: '#1890ff' }}
                onClick={() => {
                  history.push(`/post/edit/${record.id}`);
                }}
              >
                <FormattedMessage id="pages.postsList.colums.option.edit" defaultMessage="编辑" />
              </Menu.Item>
              <Menu.Item
                key="3"
                className="ant-btn-dangerous ant-btn-text"
                onClick={() => {
                  handleDelete([record]);
                }}
              >
                <FormattedMessage id="pages.postsList.colums.option.delete" defaultMessage="删除" />
              </Menu.Item>
            </Menu>
          }
        >
          {intl.formatMessage({
            id: 'pages.postsList.actions.detail',
            defaultMessage: '详情',
          })}
        </Dropdown.Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<PostType, GetPostsParams>
        headerTitle={intl.formatMessage({
          id: 'pages.postsList.title',
          defaultMessage: '文章列表',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              history.push('/post/add');
            }}
          >
            <PlusOutlined />{' '}
            <FormattedMessage id="pages.postsList.actions.add" defaultMessage="新建" />
          </Button>,
        ]}
        request={fetchPostsData}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.postsList.actions.chosen" defaultMessage="已选择" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.postsList.actions.item" defaultMessage="项" />
            </div>
          }
        >
          <Button
            onClick={() => {
              handleDelete(selectedRowsState);
            }}
            danger
          >
            <FormattedMessage
              id="pages.postsList.actions.batchDeletion"
              defaultMessage="批量删除"
            />
          </Button>
        </FooterToolbar>
      )}
      <PreviewImages
        images={[{ source: preview.url }]}
        open={preview.open}
        onClose={() => setPreview({ open: false, url: '' })}
      />
    </PageContainer>
  );
};

export default TableList;
