// Exact accepted combinations, never a major/minor range or substring match.
export const CODEX_VERSION='0.164.0-alpha.11.1';
export const SUPPORTED_CODEX_VERSIONS=Object.freeze([CODEX_VERSION,'0.163.0-alpha.10.2']);
export function parseCodexVersion(text){const m=/^codex-cli ([0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?)\s*$/.exec(String(text));return m&&SUPPORTED_CODEX_VERSIONS.includes(m[1])?m[1]:null;}
