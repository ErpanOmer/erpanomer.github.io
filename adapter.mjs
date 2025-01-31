// fc-express-adapter.mjs
import { Buffer } from 'buffer';
import { URLSearchParams } from 'url';

const createAdapter = (expressApp) => {
  return async (event, context) => {
    try {
      // 构造 Express 兼容的请求对象
      const req = createRequestObject(event);
      
      // 创建响应收集器
      const { res, responsePromise } = createResponseCollector();

      // 执行 Express 应用
      expressApp(req, res);

      // 等待响应完成
      return await responsePromise;
    } catch (error) {
      // 全局错误处理
      return formatSystemError(error);
    }
  };
};

// 构造 Express 请求对象
const createRequestObject = (event) => {
  const http = event.requestContext?.http || {};
  const headers = normalizeHeaders(event.headers || {});
  
  return {
    method: http.method || 'GET',
    url: event.rawPath || '/',
    originalUrl: event.rawPath || '/',
    path: event.rawPath || '/',
    query: event.queryParameters || {},
    params: {},  // 由 Express 路由填充
    headers,
    body: parseRequestBody(event, headers),
    ip: http.sourceIp || '',
    protocol: http.protocol?.split('/')[0].toLowerCase() || 'http',
    hostname: event.requestContext?.domainName?.split(':')[0] || 'localhost',
    get(key) {
      return this.headers[key.toLowerCase()];
    },
    // 兼容 Express 的属性链
    app: { locals: {} },
    baseUrl: '',
    cookies: {},
    signedCookies: {},
    fresh: true,
    stale: false,
    xhr: false,
    // 事件流模拟
    on: (event, listener) => {
      if (event === 'data' && event.body) {
        const chunk = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        listener(chunk);
      }
      if (event === 'end') listener();
    }
  };
};

// 创建响应收集器
const createResponseCollector = () => {
  const response = {
    statusCode: 200,
    headers: {},
    chunks: [],
    isBase64: false
  };

  const res = {
    status: (code) => {
      response.statusCode = code;
      return res;
    },
    setHeader: (key, value) => {
      response.headers[key.toLowerCase()] = value;
      return res;
    },
    getHeader: (key) => response.headers[key.toLowerCase()],
    write: (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        response.isBase64 = true;
        response.chunks.push(chunk.toString('base64'));
      } else {
        response.chunks.push(chunk);
      }
    },
    end: (chunk) => {
      if (chunk) res.write(chunk);
      res.emit('finish');
    },
    json: (data) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(data));
    },
    send: (data) => {
      if (typeof data === 'object') {
        res.json(data);
      } else {
        res.setHeader('content-type', 'text/plain');
        res.end(String(data));
      }
    },
    // 事件模拟
    on: (event, handler) => {
      if (event === 'finish') {
        finishHandlers.push(handler);
      }
    },
    emit: (event) => {
      if (event === 'finish') {
        finishHandlers.forEach(handler => handler());
      }
    }
  };

  const finishHandlers = [];
  const responsePromise = new Promise((resolve) => {
    res.on('finish', () => {
      resolve({
        statusCode: response.statusCode,
        headers: normalizeHeaders(response.headers),
        body: response.isBase64 
          ? response.chunks.join('') 
          : response.chunks.join(''),
        isBase64Encoded: response.isBase64
      });
    });
  });

  return { res, responsePromise };
};

// 请求体解析
const parseRequestBody = (event, headers) => {
  if (!event.body) return null;
  
  const contentType = headers['content-type'] || '';
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : Buffer.from(event.body);

  // JSON 处理
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody.toString());
    } catch (e) {
      return rawBody.toString();
    }
  }

  // Form 数据处理
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(rawBody.toString()));
  }

  // 二进制处理
  if (contentType.startsWith('image/') || 
      contentType.startsWith('audio/') || 
      contentType.startsWith('application/octet-stream')) {
    return rawBody;
  }

  // 默认文本处理
  return rawBody.toString();
};

// 规范化请求头（小写键名）
const normalizeHeaders = (headers) => {
  return Object.entries(headers).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});
};

// 系统级错误处理
const formatSystemError = (error) => ({
  statusCode: 500,
  headers: { 
    'Content-Type': 'application/json',
    'x-fc-error-type': 'UnhandledInvocationError'
  },
  body: JSON.stringify({
    error: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  }),
  isBase64Encoded: false
});

export default createAdapter;