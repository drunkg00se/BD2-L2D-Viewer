import { execSync } from "child_process";

console.log("正在更新子模块...");

try {
  // 更新子模块
  execSync("git submodule update --remote", { stdio: "inherit" });

  // 检查是否有更改
  const status = execSync("git status --porcelain").toString();

  if (status.trim()) {
    console.log("检测到更新，更新SpineInfo...");
    execSync("npm run build-json-dev", { stdio: "inherit" });

    console.log("正在提交...");
    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "Update submodule"', { stdio: "inherit" });
    console.log("✅ 子模块更新并提交完成");
  } else {
    console.log("📭 没有检测到子模块更新");
  }
} catch (error) {
  console.error("❌ 更新子模块失败:", error.message);
  process.exit(1);
}
