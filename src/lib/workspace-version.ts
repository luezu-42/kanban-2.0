let serverVersion = 0;

export function getServerVersion() {
  return serverVersion;
}

export function rememberServerVersion(version: number) {
  if (!Number.isFinite(version) || version < 0) return;
  serverVersion = version;
}
