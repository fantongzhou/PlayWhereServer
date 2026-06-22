#!/usr/bin/env bash
# ============================================================
# 飞猪旅行服务 — 环境初始化脚本
# 在启动 Node 服务前运行，确保 flyai CLI 和 skills 已安装
# ============================================================
set -e

echo "=========================================="
echo "  🐷 飞猪旅行服务 - 环境初始化"
echo "=========================================="

# ---- Step 1: 检查 Node.js ----
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js >= 18"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# ---- Step 2: 检查/安装 flyai CLI ----
echo ""
echo "📦 检查 flyai CLI..."

if command -v flyai &> /dev/null; then
    echo "✅ flyai CLI 已安装: $(flyai --version 2>/dev/null || echo 'ok')"
else
    echo "📦 正在安装 flyai skill（通过 npx）..."
    npx --yes skills add alibaba-flyai/flyai-skill

    if command -v flyai &> /dev/null; then
        echo "✅ flyai CLI 安装成功"
    else
        echo "⚠️  flyai CLI 安装后未检测到，请检查 PATH 或手动运行:"
        echo "   npx skills add alibaba-flyai/flyai-skill"
    fi
fi

# ---- Step 3: 配置 API Key ----
echo ""
echo "🔑 配置飞猪 API Key..."

if [ -n "$FLYAI_API_KEY" ]; then
    flyai config set FLYAI_API_KEY "$FLYAI_API_KEY" 2>/dev/null && \
        echo "✅ 飞猪 API Key 已配置" || \
        echo "⚠️  飞猪 API Key 配置失败，请手动运行: flyai config set FLYAI_API_KEY \"your-key\""
else
    echo "⚠️  环境变量 FLYAI_API_KEY 未设置，跳过 API Key 配置"
    echo "   请在 .env 文件中设置 FLYAI_API_KEY，或手动运行:"
    echo "   flyai config set FLYAI_API_KEY \"your-key\""
fi

# ---- Step 4: 验证 ----
echo ""
echo "🔍 验证 flyai 配置..."
if command -v flyai &> /dev/null; then
    echo "   flyai 可用命令列表:"
    flyai --help 2>/dev/null | head -5 || echo "   (无法获取帮助信息)"
else
    echo "   ⚠️  flyai 不可用"
fi

echo ""
echo "=========================================="
echo "  ✅ 飞猪旅行服务初始化完成"
echo "=========================================="
