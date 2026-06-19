import { exec, execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.config', 'meituan-travel');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

// ============================================================
// Token 管理
// 优先级：.env (MEITUAN_API_TOKEN) > ~/.config/meituan-travel/config.json
// 服务启动时自动将 .env 的 token 同步到 config.json，确保 CLI 可用
// ============================================================

export interface TokenStatus {
  exists: boolean;
  hasKey: boolean;
  source: 'env' | 'config' | 'none';
}

/**
 * 获取有效的 Token
 * 优先级：环境变量 MEITUAN_API_TOKEN > config.json
 */
function getToken(): string | null {
  // 优先从环境变量读取
  const envToken = process.env.MEITUAN_API_TOKEN;
  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  // 回退到 config.json
  try {
    if (existsSync(CONFIG_PATH)) {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      if (config.key && config.key.trim().length > 0) {
        return config.key.trim();
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * 将 Token 同步到 ~/.config/meituan-travel/config.json（供 mttravel CLI 使用）
 * 在服务启动时自动调用
 */
export function syncTokenToCLIConfig(): void {
  const token = getToken();
  if (!token) return;

  try {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // 只在 token 变化时才写入
    let currentToken: string | null = null;
    try {
      if (existsSync(CONFIG_PATH)) {
        const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
        currentToken = config.key || null;
      }
    } catch {
      // ignore
    }

    if (currentToken !== token) {
      writeFileSync(CONFIG_PATH, JSON.stringify({ key: token }, null, 2));
      console.log('🔑 美团 Token 已同步到 CLI 配置');
    }
  } catch (e) {
    console.warn('⚠️  同步美团 Token 到 CLI 配置失败:', e);
  }
}

/** 检查 Token 配置状态 */
export function getTokenStatus(): TokenStatus {
  // 检查环境变量
  const envToken = process.env.MEITUAN_API_TOKEN;
  if (envToken && envToken.trim().length > 0) {
    return { exists: true, hasKey: true, source: 'env' };
  }

  // 检查 config.json
  try {
    if (existsSync(CONFIG_PATH)) {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      if (config.key && config.key.trim().length > 0) {
        return { exists: true, hasKey: true, source: 'config' };
      }
    }
  } catch {
    // ignore
  }

  return { exists: false, hasKey: false, source: 'none' };
}

/**
 * 保存 Token 到 config.json（同时也提示更新 .env）
 * 用于通过对话方式动态更新 Token
 */
export function saveToken(token: string): void {
  // 写入 config.json（供 CLI 使用）
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify({ key: token.trim() }, null, 2));
  console.log('🔑 美团 Token 已保存到 CLI 配置');
}

// ============================================================
// CLI 相关
// ============================================================

/** 检查 mttravel CLI 是否已安装 */
export function isCLIInstalled(): boolean {
  try {
    execSync('which mttravel 2>/dev/null || npm list -g @meituan-travel/travel-cli 2>/dev/null', {
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
  return 'npm i -g @meituan-travel/travel-cli';
}

/** 需要配置 Token 时返回的提示消息 */
export function getTokenRequiredMessage(): string {
  return `🔑 **需要配置 API Token**

请在服务器 \`.env\` 文件中设置 \`MEITUAN_API_TOKEN\`，或通过对话发送 Token 字符串。

Token 获取方式：前往美团开发者中心入驻个人开发者并创建 Token：
[点击此处前往创建 Token](https://developer.meituan.com/zh/v2/dev/token)`;
}

/** Token 失效时返回的提示消息 */
export function getTokenExpiredMessage(): string {
  return `⚠️ **Token 已失效，需要更新**

请前往[开发者中心](https://developer.meituan.com/zh/v2/dev/token)重新创建 Token，然后更新服务器 \`.env\` 中的 \`MEITUAN_API_TOKEN\`。

⚠️ Token 为极高敏感凭证，禁止在对话中打印 Token 明文`;
}

// ============================================================
// 执行 CLI 查询
// ============================================================

export interface MeituanTravelResult {
  success: boolean;
  /** 需要 Token 时返回 */
  needToken?: boolean;
  /** Token 失效时返回 */
  tokenExpired?: boolean;
  /** 成功时的 CLI 输出 */
  content?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 执行美团旅行 CLI 查询
 * @param city  城市名
 * @param query 查询需求（越具体越好）
 */
export async function searchMeituanTravel(city: string, query: string): Promise<MeituanTravelResult> {
  // Step 1: 检查 Token（优先 .env，其次 config.json）
  const token = getToken();
  if (!token) {
    return {
      success: false,
      needToken: true,
      error: getTokenRequiredMessage(),
    };
  }

  // Step 2: 确保 CLI 配置已同步（兜底：服务启动时未同步的情况）
  syncTokenToCLIConfig();

  // Step 3: 检查 CLI 是否安装
  if (!isCLIInstalled()) {
    return {
      success: false,
      error: `⚠️ 美团旅行 CLI 未安装。请先运行：\n\`\`\`bash\n${getInstallCommand()}\n\`\`\``,
    };
  }

  // Step 4: 执行 CLI（超时 120 秒）
  try {
    const output = await new Promise<string>((resolve, reject) => {
      const safeCity = city.replace(/"/g, '\\"');
      const safeQuery = query.replace(/"/g, '\\"');

      const child = exec(
        `mttravel "${safeCity}" "${safeQuery}"`,
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
            const authKeywords = ['鉴权失败', '无效的访问令牌', 'token', '未设置', 'access token', 'key'];
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
