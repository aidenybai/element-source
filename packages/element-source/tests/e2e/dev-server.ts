import { spawn, type ChildProcess } from "node:child_process";

const URL_PATTERN = /https?:\/\/localhost:\d+/;

export const startDevServer = (
  directory: string,
  port: number,
): Promise<{ process: ChildProcess; url: string }> =>
  new Promise((resolvePromise, reject) => {
    const fallbackUrl = `http://localhost:${port}`;
    const child = spawn("pnpm", ["dev"], {
      cwd: directory,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PORT: String(port) },
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        child.kill();
        reject(new Error(`Dev server in ${directory} failed to start within 30s`));
      }
    }, 30000);

    const checkOutput = (data: Buffer) => {
      if (started) return;
      const output = data.toString();
      const urlMatch = output.match(URL_PATTERN);
      if (urlMatch || output.includes("ready")) {
        started = true;
        clearTimeout(timeout);
        const detectedUrl = urlMatch?.[0] ?? fallbackUrl;
        setTimeout(() => resolvePromise({ process: child, url: detectedUrl }), 2000);
      }
    };

    child.stdout?.on("data", checkOutput);
    child.stderr?.on("data", checkOutput);

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("exit", (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`Dev server exited with code ${code} before starting`));
      }
    });
  });

export const stopDevServer = (child: ChildProcess): Promise<void> =>
  new Promise((resolvePromise) => {
    if (!child.pid) {
      resolvePromise();
      return;
    }
    child.on("exit", () => resolvePromise());
    child.kill("SIGTERM");
    setTimeout(() => {
      child.kill("SIGKILL");
      resolvePromise();
    }, 5000);
  });
