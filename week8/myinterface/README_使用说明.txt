DON'T TOUCH ME! — 完整可用项目（2026-11-13）
==========================================

这是一个完整项目，不是补丁。请只使用此文件夹中的文件。

文件：
- index.html       完整网页 / Proposal / Sketches / Documentation
- sketch.js        p5.js + ml5.js HandPose 手势识别及生物动画
- style.css        网页排版
- assets/          你提供的两张手绘草图 + 三张真实测试截图

本版已包含：
- 失败测试：摄像头有画面，但 NO HAND
- 修复说明：改成 p5.js 1.x 的 preload() 初始化 HandPose
- 成功测试：OPEN HAND / APPROACH
- 成功测试：FIST / STARTLED（随后逃跑）
- 系统流程图、概念、交互逻辑、Reflection

运行方法：
1. 将这个 myinterface 文件夹放入 VS Code 工作区，比如 week8/ 下。
2. 在 VS Code 打开整个 myinterface 文件夹。
3. 右键 index.html -> Open with Live Server。
4. 在 Chrome 允许摄像头，首次需要联网下载 p5、ml5 和模型。
5. 张开手 → 生物靠近；握拳 → 惊吓并逃跑；手离开 → 它会返回。
6. 若不生效，刷新页面并查看 Chrome 开发者工具 Console。

上传到 GitHub：
把 index.html、sketch.js、style.css 与整个 assets 文件夹一起上传到
GitHub 仓库中同一个文件夹（例如 week8/myinterface/）。
如果文件在 week8/myinterface/ 下，且你的 Pages 源是仓库根目录，
网页地址通常是：
https://<username>.github.io/<repo>/week8/myinterface/
具体地址以你自己的仓库和 Pages 设置为准。

注意：
- 不要混用旧版的 index.html、sketch.js、style.css。
- 不需要 Teachable Machine、不需要训练 Background。
- 手势分类是基于四根手指关键点的简单启发式规则。
- 用户测试截图证明模型能识别 Open Hand 与 Fist；在你自己的
  设备与光线下仍需实际测试，尤其是摄像头方向与握拳角度。
