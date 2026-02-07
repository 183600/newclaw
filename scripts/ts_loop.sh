#!/usr/bin/env bash
set -u
set -o pipefail

RELEASE_WINDOW_SECONDS=604800
PNPM_LOG="/tmp/iflow_pnpm_last.log"

WORK_BRANCH="${WORK_BRANCH:-main}"

# marker 文件放在真实的 git dir 下，确保不会被 git add/commit/push
GIT_DIR_REAL="$(git rev-parse --git-dir 2>/dev/null || echo ".git")"
RELEASE_MARKER_FILE="${RELEASE_MARKER_FILE:-${GIT_DIR_REAL%/}/iflow_release_tag}"

# 从 package.json 提取版本号
extract_package_version() {
  if [[ ! -f "package.json" ]]; then
    return 1
  fi
  local ver
  ver="$(node -p "require('./package.json').version" 2>/dev/null || true)"
  [[ -n "${ver:-}" ]] || return 1
  printf '%s\n' "$ver"
}

has_error_in_log() {
  local log="$1"
  [[ -f "$log" ]] || return 1
  grep -Eiq '(^|[^[:alpha:]])(error:|fatal:|panic:|exception:|segmentation fault|FAIL|Error:)([^[:alpha:]]|$)' "$log"
}

latest_release_age_ok() {
  command -v gh >/dev/null 2>&1 || return 1
  [[ -n "${GITHUB_REPOSITORY:-}" ]] || return 1
  if [[ -z "${GH_TOKEN:-}" && -z "${GITHUB_TOKEN:-}" ]]; then
    return 1
  fi

  local published_at pub_ts now_ts delta
  published_at="$(gh api "/repos/${GITHUB_REPOSITORY}/releases/latest" --jq '.published_at' 2>/dev/null || true)"
  if [[ -z "${published_at:-}" || "${published_at}" == "null" ]]; then
    return 0
  fi

  pub_ts="$(date -d "$published_at" +%s 2>/dev/null || echo 0)"
  now_ts="$(date +%s)"
  [[ "$pub_ts" -gt 0 ]] || return 1

  delta=$(( now_ts - pub_ts ))
  (( delta >= RELEASE_WINDOW_SECONDS ))
}

attempt_bump_and_tag() {
  if [[ "${GITHUB_ACTIONS:-}" != "true" ]]; then
    echo "ℹ️ 非 GitHub Actions 环境，跳过自动发布准备。"
    return 0
  fi

  if [[ -f "$RELEASE_MARKER_FILE" ]]; then
    echo "ℹ️ 已存在 release marker（$(cat "$RELEASE_MARKER_FILE" 2>/dev/null || true)），跳过。"
    return 0
  fi

  if ! latest_release_age_ok; then
    echo "ℹ️ 最近 7 天内已有 release（或无法判断），跳过自动发布准备。"
    return 0
  fi

  git fetch --tags --force >/dev/null 2>&1 || true

  local old_ver new_ver tag
  old_ver="$(extract_package_version || true)"
  echo "ℹ️ 当前版本：${old_ver:-<unknown>}"

  echo "满足发布条件：开始 bump 版本号（iFlow）..."
  iflow '增加版本号(例如0.9.1变成0.9.2)，请修改 package.json 文件中的 version 字段，不要修改其他文件。think:high' --yolo || {
    echo "⚠️ bump 版本号失败，跳过本次发布准备。"
    return 0
  }

  git add -A

  new_ver="$(extract_package_version || true)"
  echo "ℹ️ bump 后版本：${new_ver:-<unknown>}"
  [[ -n "${new_ver:-}" ]] || { echo "⚠️ 无法提取版本号，跳过。"; return 0; }

  if [[ -n "${old_ver:-}" && "${new_ver}" == "${old_ver}" ]]; then
    echo "⚠️ 版本号未变化（${old_ver} -> ${new_ver}），跳过。"
    return 0
  fi

  if git diff --cached --quiet; then
    echo "⚠️ bump 后没有 staged 变更，跳过。"
    return 0
  fi

  git commit -m "chore(release): v${new_ver}" || {
    echo "⚠️ 提交 bump commit 失败，跳过。"
    return 0
  }

  tag="v${new_ver}"

  if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
    echo "ℹ️ 本地 tag ${tag} 已存在，跳过打 tag。"
  else
    git tag -a "${tag}" -m "${tag}" || {
      echo "⚠️ 打 tag 失败，跳过。"
      return 0
    }
  fi

  mkdir -p "$(dirname -- "$RELEASE_MARKER_FILE")"
  printf '%s\n' "${tag}" > "$RELEASE_MARKER_FILE"
  echo "✅ 已准备发布：${tag}（等待后续 push tag 触发发布工作流）"
}

trap 'echo; echo "已终止."; exit 0' INT TERM

while true; do
  echo "===================="
  echo "$(date '+%F %T') 运行测试：pnpm test"
  echo "===================="

  : > "$PNPM_LOG"

  # 如果 AI 修改了任何 package.json / pnpm-lock.yaml，必须重新安装依赖
  if git diff --name-only | grep -Eq '(^|/)(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$'; then
    echo "📦 检测到依赖相关文件变更，正在 pnpm install..."
    pnpm install
    git add -A
  fi

  pnpm test 2>&1 | tee "$PNPM_LOG"
  ps=("${PIPESTATUS[@]}")
  PNPM_STATUS="${ps[0]:-255}"

  HAS_ERROR=0
  if has_error_in_log "$PNPM_LOG"; then
    HAS_ERROR=1
  fi

  if [[ "$PNPM_STATUS" -eq 0 ]]; then
    # 请求增加测试用例（依然用 npm test 语义，但执行器是 pnpm test）
    iflow "给这个项目增加一些 pnpm test 测试用例，不要超过10个，使用标准的 Jest/Vitest/Mocha 测试语法 think:high" --yolo || true

    git add -A
    if git diff --cached --quiet; then
      echo "ℹ️ 没有文件变化可提交"
    else
      git commit -m "测试通过" || true
    fi

    if [[ "$HAS_ERROR" -eq 0 ]]; then
      attempt_bump_and_tag || true
    else
      echo "ℹ️ pnpm test 退出码为 0，但日志检测到 error 关键词，跳过发布准备。"
    fi
  else
    echo "调用 iflow 修复..."
    iflow '解决 pnpm test 显示的所有问题（除了warning），除非测试用例本身有编译错误，否则只修改测试用例以外的代码。如果报错提示缺少模块（Cannot find module），请在 package.json 的 dependencies 或 devDependencies 中添加相应的包，然后代码中使用 import/require 引入。debug时可通过加日志和打断点，一定不要消耗大量CPU/内存资源 think:high' --yolo || true
  fi

  echo "🔁 回到第 1 步..."
  sleep 1
done
