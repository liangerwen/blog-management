import MarkdownIt from 'markdown-it';
// @ts-ignore
import MarkdownItSub from 'markdown-it-sub';
// @ts-ignore
import MarkdownItSup from 'markdown-it-sup';
// @ts-ignore
import MarkdownItFootnote from 'markdown-it-footnote';
// @ts-ignore
import MarkdownItTaskList from 'markdown-it-task-lists';
// @ts-ignore
import MarkdownItContainer from 'markdown-it-container';
import type Token from 'markdown-it/lib/token';
import hljs from 'highlight.js';
// @ts-ignore
const mdParser = new MarkdownIt({
  html: false,
  highlight: (str, lang) => {
    let preCode = '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        preCode = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch {
        preCode = mdParser.utils.escapeHtml(str);
      }
    } else {
      preCode = mdParser.utils.escapeHtml(str);
    }
    // 以换行进行分割
    const lines = preCode.split(/\n/).slice(0, -1);
    // 添加自定义行号
    let html = lines
      .map((item, index) => {
        return `<li><span class="line-num" data-line="${index + 1}"></span>${item}</li>`;
      })
      .join('');
    html = `<ol>${html}</ol>`;
    return `<pre class="highlight">
               <div class="highlight-tools">
                 <div class="code-lang">${lang || 'CODE'}</div>
               </div>
               <div class="highlight-code">${html}</div>
             </pre>`;
  },
});
mdParser
  .use(MarkdownItSub)
  .use(MarkdownItSup)
  .use(MarkdownItFootnote)
  .use(MarkdownItTaskList)
  .use(MarkdownItContainer, 'notice', {
    validate: (params: string) => {
      const paramsAry = params.split(/ +/).filter((i) => !!i);
      if (paramsAry[0] === 'notice') return true;
      return false;
    },
    render: (tokens: Token[], idx: number) => {
      if (tokens[idx].nesting === 1) {
        const { info } = tokens[idx];
        const types = ['primary', 'warning', 'success', 'info', 'error'];
        const paramsAry = info.split(/ +/).filter((i) => !!i);
        if (paramsAry[1]) {
          if (types.includes(paramsAry[1])) {
            return `<div class="notice ${paramsAry[1]}">`;
          }
        }
        return '<div class="notice">';
      }
      return '</div>\n';
    },
  });

mdParser.renderer.rules.text = (tokens, idx) => {
  const content = mdParser.utils.escapeHtml(tokens[idx].content);
  return content.replace(
    /\$(\[((success)|(warning)|(error)|(info)|(primary))\])? *([\w\W]+) *\$/g,
    '<span class="tag $2">$8</span>',
  );
};

mdParser.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const targetIdx = tokens[idx].attrIndex('target');
  if (targetIdx < 0) {
    tokens[idx].attrPush(['target', '_blank']);
  } else {
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    tokens[idx].attrs[targetIdx][1] = '_blank';
  }
  return self.renderToken(tokens, idx, options);
};

mdParser.renderer.rules.ordered_list_open = (tokens, idx, options, _env, self) => {
  tokens[idx].attrPush(['class', 'order_list']);
  return self.renderToken(tokens, idx, options);
};

export default mdParser;
