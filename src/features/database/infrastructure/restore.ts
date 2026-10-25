import "server-only";

import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { createGunzip } from "node:zlib";

import { env } from "@/lib/env";

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const username = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const host = parsed.hostname;
  const port = parsed.port || "3306";
  const database = parsed.pathname.replace(/^\//, "");
  return { username, password, host, port, database };
}

export async function restoreSqlDump(
  buffer: Buffer,
  options: { gzip?: boolean } = {},
): Promise<void> {
  const { username, password, host, port, database } = parseDatabaseUrl(env.DATABASE_URL);
  const args = [`--host=${host}`, `--port=${port}`, `--user=${username}`, database];

  return new Promise((resolve, reject) => {
    const child = spawn("mysql", args, {
      env: { ...process.env, MYSQL_PWD: password },
    });
    let error = "";
    child.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(error || `mysql restore gagal dengan kode ${code}`));
        return;
      }
      resolve();
    });

    if (options.gzip) {
      const gunzip = createGunzip();
      const stream = Readable.from(buffer);
      stream.pipe(gunzip).pipe(child.stdin);
    } else {
      child.stdin.write(buffer);
      child.stdin.end();
    }
  });
}
