// adapter.mjs
export default (expressApp) => {
  return async (event) => {
    // 1. 转换请求对象
    const req = {
      method: event.httpMethod,
      url: event.rawPath,
      headers: lowerCaseKeys(event.headers || {}),
      query: event.queryParameters || {},
      body: parseBody(event),
      ip: event.requestContext?.http?.sourceIP || '',
      protocol: event.requestContext?.http?.protocol || 'http',
      get(key) {
        return this.headers[key.toLowerCase()];
      }
    };

    // 2. 构造响应对象
    let statusCode = 200;
    const headers = {};
    let body = '';
    let isBase64 = false;

    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      setHeader: (key, value) => {
        headers[key.toLowerCase()] = value;
        return res;
      },
      send: (data) => {
        if (Buffer.isBuffer(data)) {
          body = data.toString('base64');
          isBase64 = true;
        } else {
          body = typeof data === 'object' ? JSON.stringify(data) : data;
        }
      },
      json: (data) => {
        headers['content-type'] = 'application/json';
        res.send(data);
      }
    };

    // 3. 执行 Express 应用
    await new Promise((resolve) => {
      expressApp(req, res, resolve);
    });

    // 4. 返回 FC 兼容响应
    return {
      statusCode,
      headers,
      body,
      isBase64Encoded: isBase64
    };
  };
};

// 工具函数
const lowerCaseKeys = (obj) => 
  Object.entries(obj).reduce((acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  }, {});

const parseBody = (event) => {
  if (!event.body) return null;
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;
};