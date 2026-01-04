## 修改计划

**文件**: `src/utils/proxy.ts`

**修改内容**:
1. 移除 URL 扩展名判断逻辑（删除 lines 47-49）
2. 新增通过 `content-type` header 判断静态资源的逻辑
3. 定义常见静态资源的 MIME 类型白名单

**修改后的逻辑**:
```typescript
// 根据响应 Content-Type 判断是否为静态资源
const contentType = resp.headers.get('content-type') || '';
const isStaticResource = 
    contentType.startsWith('text/css') ||
    contentType.startsWith('application/javascript') ||
    contentType.startsWith('text/javascript') ||
    contentType.startsWith('image/') ||
    contentType.startsWith('font/') ||
    contentType.includes('woff') ||
    contentType.includes('octet-stream');

if (isStaticResource) {
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
} else {
    newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
}
```

**优点**:
- 更准确地识别资源类型
- 不依赖 URL 路径格式
- 能正确处理没有扩展名的资源