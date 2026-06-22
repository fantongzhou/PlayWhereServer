import { exec } from 'child_process';
import { homedir } from 'os';

// ============================================================
// 飞猪（Fliggy）旅行服务 — 基于 flyai CLI
// ============================================================
// API Key 管理：flyai CLI 通过 `flyai config set FLYAI_API_KEY` 自行管理
// 服务启动时自动从环境变量 FLYAI_API_KEY 同步到 flyai CLI 配置
// ============================================================

const INSTALL_COMMAND = 'npx skills add alibaba-flyai/flyai-skill';

export interface TokenStatus {
  exists: boolean;
  hasKey: boolean;
  source: 'env' | 'none';
}

// ============================================================
// Token / API Key 管理
// ============================================================

/**
 * 获取有效的 API Key（从环境变量 FLYAI_API_KEY）
 */
function getApiKey(): string | null {
  const envKey = process.env.FLYAI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return null;
}

/**
 * 将环境变量中的 API Key 同步到 flyai CLI 配置
 * flyai CLI 通过 `flyai config set` 管理配置
 * 在服务启动时自动调用
 */
export function syncApiKeyToCLI(): void {
  const key = getApiKey();
  if (!key) return;

  try {
    // flyai config set FLYAI_API_KEY "your-key"
    exec(
      `flyai config set FLYAI_API_KEY "${key.replace(/"/g, '\\"')}"`,
      { timeout: 10000, env: { ...process.env, HOME: homedir() } },
      (error, _stdout, stderr) => {
        if (error) {
          console.warn('⚠️  同步飞猪 API Key 到 flyai CLI 失败:', stderr || error.message);
        } else {
          console.log('🔑 飞猪 API Key 已同步到 flyai CLI 配置');
        }
      },
    );
  } catch (e) {
    console.warn('⚠️  同步飞猪 API Key 到 flyai CLI 失败:', e);
  }
}

/** 检查 API Key 配置状态 */
export function getTokenStatus(): TokenStatus {
  const envKey = process.env.FLYAI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return { exists: true, hasKey: true, source: 'env' };
  }
  return { exists: false, hasKey: false, source: 'none' };
}

/**
 * 保存 API Key（通过 flyai config set）
 * 用于通过对话方式动态更新 Key
 */
export function saveToken(token: string): void {
  try {
    execSync(
      `flyai config set FLYAI_API_KEY "${token.trim().replace(/"/g, '\\"')}"`,
      { timeout: 10000, stdio: 'ignore', env: { ...process.env, HOME: homedir() } },
    );
    console.log('🔑 飞猪 API Key 已保存到 flyai CLI 配置');
  } catch (e: any) {
    console.warn('⚠️  保存飞猪 API Key 失败:', e.message);
    throw new Error(`保存 API Key 失败：${e.message}`);
  }
}

// ============================================================
// CLI 相关
// ============================================================

/** 检查 flyai CLI 是否已安装 */
export function isCLIInstalled(): boolean {
  try {
    const { execSync } = require('child_process');
    execSync('which flyai 2>/dev/null', {
      stdio: 'ignore',
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

/** 安装 CLI 的命令 */
export function getInstallCommand(): string {
  return INSTALL_COMMAND;
}

/** 需要配置 API Key 时返回的提示消息 */
export function getTokenRequiredMessage(): string {
  return `🔑 **需要配置飞猪 API Key**

请在服务器 \`.env\` 文件中设置 \`FLYAI_API_KEY\`，或通过对话发送 Key 字符串。

API Key 获取方式：前往飞猪开放平台控制台获取正式的 API Key：
[点击此处前往飞猪控制台](https://open.fliggy.com/)`;
}

/** API Key 失效时返回的提示消息 */
export function getTokenExpiredMessage(): string {
  return `⚠️ **飞猪 API Key 已失效，需要更新**

请前往[飞猪控制台](https://open.fliggy.com/)重新获取 API Key，然后更新服务器 \`.env\` 中的 \`FLYAI_API_KEY\`。

⚠️ API Key 为极高敏感凭证，禁止在对话中打印 Key 明文`;
}

// ============================================================
// 执行 CLI 查询
// ============================================================

import { execSync } from 'child_process';

export interface FliggyTravelResult {
  success: boolean;
  /** 需要 API Key 时返回 */
  needToken?: boolean;
  /** API Key 失效时返回 */
  tokenExpired?: boolean;
  /** 成功时的 CLI 输出 */
  content?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 执行飞猪旅行 CLI 查询
 * @param city  城市名
 * @param query 查询需求（越具体越好）
 */
export async function searchFliggyTravel(city: string, query: string): Promise<FliggyTravelResult> {
  // Step 1: 检查 API Key
  const key = getApiKey();
  if (!key) {
    return {
      success: false,
      needToken: true,
      error: getTokenRequiredMessage(),
    };
  }

  // Step 2: 确保 CLI 配置已同步（兜底：服务启动时未同步的情况）
  syncApiKeyToCLI();

  // Step 3: 检查 CLI 是否安装
  if (!isCLIInstalled()) {
    return {
      success: false,
      error: `⚠️ 飞猪旅行 CLI (flyai) 未安装。请先运行：\n\`\`\`bash\n${getInstallCommand()}\n\`\`\``,
    };
  }

  // Step 4: 执行 CLI（超时 120 秒）
  // flyai fliggy-fast-search --query "城市 查询需求"
  const fullQuery = `${city} ${query}`;

  try {
    const output = await new Promise<string>((resolve, reject) => {
      const safeQuery = fullQuery.replace(/"/g, '\\"');

      const child = exec(
        `flyai fliggy-fast-search --query "${safeQuery}"`,
        {
          timeout: 120000,
          maxBuffer: 10 * 1024 * 1024,
          env: { ...process.env, HOME: homedir() },
        },
        (error, stdout, stderr) => {
          if (error) {
            if ((error as any).killed) {
              reject(new Error('请求超时啦，当前查询人数较多，请换个问法或稍后再试。'));
              return;
            }
            const errMsg = (stderr + stdout).toLowerCase();
            const authKeywords = ['鉴权失败', '无效的访问令牌', 'token', '未设置', 'access token', 'key', 'unauthorized', 'api key'];
            if (authKeywords.some(kw => errMsg.includes(kw))) {
              resolve('__TOKEN_EXPIRED__');
              return;
            }
            reject(new Error(stderr || error.message));
            return;
          }
          resolve(stdout);
        },
      );
    });

    if (output === '__TOKEN_EXPIRED__') {
      return {
        success: false,
        tokenExpired: true,
        error: getTokenExpiredMessage(),
      };
    }

    if (!output || output.trim().length === 0) {
      return {
        success: false,
        error: '暂无相关结果，建议调整查询关键词或换个问法重试。',
      };
    }

    return {
      success: true,
      content: output.trim(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '查询失败，请换个问法重试。',
    };
  }
}
