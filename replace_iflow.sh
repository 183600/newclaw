#!/bin/bash

# 替换所有文档中的iFlow引用为NewClaw

# 替换项目名称：iFlow -> NewClaw
find docs -name "*.md" -type f -exec sed -i 's/iFlow/NewClaw/g' {} \;

# 替换命令行工具：iflow -> newclaw
find docs -name "*.md" -type f -exec sed -i 's/iflow /newclaw /g' {} \;

# 替换配置文件：iflow.json -> newclaw.json
find docs -name "*.md" -type f -exec sed -i 's/iflow\.json/newclaw.json/g' {} \;

# 替换状态目录：~/.iflow -> ~/.newclaw
find docs -name "*.md" -type f -exec sed -i 's/~\/\.iflow/~\/\.newclaw/g' {} \;

# 替换服务名称：iflow-browser.service -> newclaw-browser.service
find docs -name "*.md" -type f -exec sed -i 's/iflow-browser\.service/newclaw-browser.service/g' {} \;

# 特殊处理：替换iflow.ai -> newclaw.ai
find docs -name "*.md" -type f -exec sed -i 's/iflow\.ai/newclaw.ai/g' {} \;

# 特殊处理：替换github仓库地址
find docs -name "*.md" -type f -exec sed -i 's|github\.com/iflow/iflow|github.com/newclaw/newclaw|g' {} \;

# 特殊处理：替换iflow:开头的localStorage键
find docs -name "*.html" -type f -exec sed -i 's/iflow:/newclaw:/g' {} \;

echo "替换完成！"