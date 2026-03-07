type LogLevel = "info" | "warn" | "error";

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",   // cyan
  warn: "\x1b[33m",   // yellow
  error: "\x1b[31m",  // red
};
const RESET = "\x1b[0m";

function formatMsg(level: LogLevel, module: string, message: string): string {
  const ts = new Date().toISOString();
  const color = LEVEL_COLORS[level];
  return `${color}[${level.toUpperCase()}]${RESET} ${ts} [${module}] ${message}`;
}

export const logger = {
  info(module: string, message: string, ...args: unknown[]): void {
    console.log(formatMsg("info", module, message), ...args);
  },
  warn(module: string, message: string, ...args: unknown[]): void {
    console.warn(formatMsg("warn", module, message), ...args);
  },
  error(module: string, message: string, ...args: unknown[]): void {
    console.error(formatMsg("error", module, message), ...args);
  },
};
