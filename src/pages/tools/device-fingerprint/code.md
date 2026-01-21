```js
import { generateFingerprint } from './sdk.js';

// 生成指纹
const result = await generateFingerprint({
  canvas: true,   // 启用 Canvas 指纹
  audio: true,    // 启用 Audio 指纹
  webgl: true,    // 启用 WebGL 指纹 (新增)
  fonts: true,    // 启用字体检测 (新增)
  hardware: true, // 启用硬件特征
});

console.log(result.deviceId); 
// 输出: "84e1b..." (16位稳定唯一 ID)`;
```