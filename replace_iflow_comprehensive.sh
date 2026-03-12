#!/bin/bash

# 替换所有文档中的iFlow引用为NewClaw（更全面的版本）

# 1. 替换项目名称：iFlow -> NewClaw
find docs -name "*.md" -type f -exec sed -i 's/iFlow/NewClaw/g' {} \;

# 2. 替换命令行工具：iflow -> newclaw
find docs -name "*.md" -type f -exec sed -i 's/iflow /newclaw /g' {} \;

# 3. 替换配置文件：iflow.json -> newclaw.json
find docs -name "*.md" -type f -exec sed -i 's/iflow\.json/newclaw.json/g' {} \;

# 4. 替换状态目录：~/.iflow -> ~/.newclaw
find docs -name "*.md" -type f -exec sed -i 's/~\/\.iflow/~\/\.newclaw/g' {} \;

# 5. 替换服务名称：iflow-browser.service -> newclaw-browser.service
find docs -name "*.md" -type f -exec sed -i 's/iflow-browser\.service/newclaw-browser.service/g' {} \;

# 6. 特殊处理：替换iflow.ai -> newclaw.ai
find docs -name "*.md" -type f -exec sed -i 's/iflow\.ai/newclaw.ai/g' {} \;

# 7. 特殊处理：替换github仓库地址
find docs -name "*.md" -type f -exec sed -i 's|github\.com/iflow/iflow|github.com/newclaw/newclaw|g' {} \;

# 8. 特殊处理：替换iflow:开头的localStorage键
find docs -name "*.html" -type f -exec sed -i 's/iflow:/newclaw:/g' {} \;

# 9. 特殊处理：替换环境变量中的IFLOW_前缀
find docs -name "*.md" -type f -exec sed -i 's/IFLOW_/NEWCLAW_/g' {} \;

# 10. 特殊处理：替换插件包名中的@iflow/
find docs -name "*.md" -type f -exec sed -i 's/@iflow\//@newclaw\//g' {} \;

# 11. 特殊处理：替换邮箱地址中的iflow@gmail.com
find docs -name "*.md" -type f -exec sed -i 's/iflow@gmail.com/newclaw@gmail.com/g' {} \;

# 12. 特殊处理：替换DNS-SD服务名称
find docs -name "*.md" -type f -exec sed -i 's/_iflow-gw\._tcp/_newclaw-gw._tcp/g' {} \;

# 13. 特殊处理：替换mDNS主机名
find docs -name "*.md" -type f -exec sed -i 's/iflow\.local/newclaw.local/g' {} \;

# 14. 特殊处理：替换DNS域名
find docs -name "*.md" -type f -exec sed -i 's/iflow\.internal/newclaw.internal/g' {} \;

# 15. 特殊处理：替换HTTP头中的x-iflow-
find docs -name "*.md" -type f -exec sed -i 's/x-iflow-/x-newclaw-/g' {} \;

# 16. 特殊处理：替换日志文件路径中的iflow
find docs -name "*.md" -type f -exec sed -i 's|/tmp/iflow/|/tmp/newclaw/|g' {} \;

# 17. 特殊处理：替换系统服务名称
find docs -name "*.md" -type f -exec sed -i 's/iflow-gateway/newclaw-gateway/g' {} \;

# 18. 特殊处理：替换Docker镜像名称
find docs -name "*.md" -type f -exec sed -i 's/iflow-sandbox/newclaw-sandbox/g' {} \;

# 19. 特殊处理：替换workspace路径中的iflow
find docs -name "*.md" -type f -exec sed -i 's|~/iflow|~/newclaw|g' {} \;

# 20. 特殊处理：替换模型名称中的iflow
find docs -name "*.md" -type f -exec sed -i 's/model: "iflow/model: "newclaw/g' {} \;

echo "全面替换完成！"