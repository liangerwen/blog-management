import AV from 'leancloud-storage';
import type { HttpResponse } from '..';
import { createDataResponse, createErrorResponse } from '..';

AV.init({
  appId: 'your appid',
  appKey: 'your appkey',
  serverURL: 'https://avoscloud.com',
});

type CommentItemType = {
  nick: string;
  ip: string;
  mail: string;
  ua: string;
  insertedAt: Date;
  link: string;
  comment: string;
  url: string;
  QQAvatar: string;
  objectId: string;
  createdAt: Date;
  updatedAt: Date;
  pid?: string;
  rid?: string;
};

export type CommentType = CommentItemType & {
  reply?: CommentItemType[];
};

const getReplyIds = (rid: string, id: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const comments = new AV.Query('Comment');
    comments
      .equalTo('rid', rid)
      .find()
      .then((res) => {
        const replys = res.map((i) => i.toJSON());
        const ids = [id];
        const appendChildrenId = (pid: string) => {
          const child = replys.find((i) => i.pid === pid);
          if (child) {
            ids.push(child.objectId);
            appendChildrenId(child.objectId);
          }
        };
        appendChildrenId(id);
        resolve(ids);
      })
      .catch(() => {
        resolve([]);
      });
  });
};

const getCommentReply = (rid: string) => {
  return new Promise((resolve) => {
    const comments = new AV.Query('Comment');
    comments
      .equalTo('rid', rid)
      .ascending('createdAt')
      .find()
      .then((res) => {
        resolve(res.map((i) => i.toJSON()));
      })
      .catch(() => {
        resolve([]);
      });
  });
};

export const selectComments = ({
  url,
  page = 1,
  limit = 10,
}: {
  url: string;
  page?: number;
  limit?: number;
}): Promise<HttpResponse<{ data: CommentType[]; count: number }>> => {
  return new Promise((resolve) => {
    const comments = new AV.Query('Comment');
    comments
      .equalTo('url', url)
      .equalTo('rid', null)
      .descending('createdAt')
      .limit(limit)
      .skip((page - 1) * limit)
      .findAndCount()
      .then(async (res) => {
        const data = res[0].map((i) => i.toJSON());
        const commentsAndReply = await Promise.all(
          data.map(async (i) => {
            return {
              ...i,
              reply: await getCommentReply(i.objectId),
            };
          }),
        );
        resolve(
          createDataResponse({
            data: commentsAndReply,
            count: res[1],
          }),
        );
      })
      .catch(() => {
        resolve(
          createDataResponse({
            data: [],
            count: 0,
          }),
        );
      });
  });
};

export const addComment = (obj: {
  QQAvatar?: string;
  nick?: string;
  comment: string;
  url: string;
  pid?: string;
  rid?: string;
}) => {
  return new Promise<HttpResponse>((resolve) => {
    const Comment = AV.Object.extend('Comment');
    const comment = new Comment();
    Object.keys(obj).forEach((i) => {
      comment.set(i, obj[i]);
    });
    const curDate = new Date();
    comment.set('insertedAt', curDate);
    comment.set('ua', window.navigator.userAgent);
    comment
      .save()
      .then(() => {
        resolve(createDataResponse());
      })
      .catch((err) => {
        resolve(createErrorResponse(err.message));
      });
  });
};

export const delReplyComments = (rid: string, id: string) => {
  return new Promise<HttpResponse>((resolve) => {
    getReplyIds(rid, id).then((ids) => {
      const comments = ids.map((i) => AV.Object.createWithoutData('Comment', i));
      AV.Object.destroyAll(comments)
        .then(() => {
          resolve(createDataResponse());
        })
        .catch((err) => {
          resolve(createErrorResponse(err.message));
        });
    });
  });
};

export const delRootComment = (id: string) => {
  return new Promise<HttpResponse>((resolve) => {
    const comments = new AV.Query('Comment');
    comments
      .equalTo('rid', id)
      .find()
      .then(async (res) => {
        const objs = res.map((i) => AV.Object.createWithoutData('Comment', i.id as string));
        AV.Object.destroyAll([...objs, AV.Object.createWithoutData('Comment', id)])
          .then(() => {
            resolve(createDataResponse());
          })
          .catch((err) => {
            resolve(createErrorResponse(err.message));
          });
      });
  });
};

export const updateComment = (id: string, content: string) => {
  return new Promise<HttpResponse>((resolve) => {
    const comment = AV.Object.createWithoutData('Comment', id);
    comment.set('comment', content);
    comment
      .save()
      .then(() => {
        resolve(createDataResponse());
      })
      .catch((err) => {
        resolve(createErrorResponse(err.message));
      });
  });
};
