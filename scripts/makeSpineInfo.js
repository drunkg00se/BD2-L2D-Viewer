import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 遍历目录，收集 atlas 信息
 * @param {string} dir 绝对路径
 * @param {Array} result
 * @param {Array} missingAssets
 */
function traverse(dir, result, missingAssets) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // 当前目录是否存在 .atlas 文件
  const atlasFile = entries.find((e) => e.isFile() && e.name.endsWith(".atlas"));

  if (atlasFile) {
    const name = path.basename(atlasFile.name, ".atlas");

    const pngName = `${name}.png`;
    const pngfile = entries.find((e) => e.isFile() && e.name === pngName);
    if (!pngfile) {
      missingAssets.push(dir + ", " + pngName);
      return;
    }

    const matchId = /char([0-9]{6})$/.exec(name);
    const id = matchId ? matchId[1] : name;

    result.push({
      id,
      charName: name,
      costumeName: "",
      spine: path.relative(process.cwd(), path.join(dir, atlasFile.name)).replace(/\\/g, "/"),
      cutscene: "",
      datingHasNoBg: false,
      dating: "",
    });

    // 找到 atlas 后，停止对此目录的进一步遍历
    return;
  }

  // 未找到 atlas，继续遍历子目录
  for (const entry of entries) {
    if (entry.isDirectory()) {
      traverse(path.join(dir, entry.name), result, missingAssets);
    }
  }
}

/**
 * 收集 atlas 数据
 * @param {string} rootDir
 * @returns {Array}
 */
function collectAtlas(rootDir) {
  const result = [];
  const missingAssets = [];
  traverse(path.resolve(rootDir, "spine"), result, missingAssets);
  return [result, missingAssets];
}

function makeCharInfoPath(cate, root, name) {
  if (name === "") return "";

  let relativePath;

  if (cate === "character") {
    relativePath = `char/${name}/${name}.atlas`;
  } else if (cate === "ultimate") {
    relativePath = `cutscenes/${name}/${name}.atlas`;
  } else {
    relativePath = `illust/illust_dating/${name}/${name}.atlas`;
  }

  return path.relative(process.cwd(), path.resolve(root, relativePath)).replace(/\\/g, "/");
}

function transformCharInfo(targetDir) {
  const root = path.resolve(targetDir, "spine");

  const filePath = path.resolve(targetDir, "CharInfo.json");
  const jsonString = fs.readFileSync(filePath, { encoding: "utf-8" });
  const data = JSON.parse(jsonString);

  return data.flatMap((item) => {
    const { charId, charName, costumes, guest, prestigeSkin } = item;
    const items = [];

    for (const costume of costumes) {
      const { costumeId, costumeName, spine, cutscene } = costume;

      if (spine === "" && cutscene === "") continue;

      items.push({
        id: costumeId,
        charName,
        costumeName,
        spine: makeCharInfoPath("character", root, spine),
        cutscene: makeCharInfoPath("ultimate", root, cutscene),
        datingHasNoBg: true,
        dating: "",
      });
    }

    if (guest) {
      items.push({
        id: `${charId}_${guest.interact}`,
        charName,
        costumeName: `${charName}_${guest.interact}`,
        spine: "",
        cutscene: "",
        datingHasNoBg: true,
        dating: makeCharInfoPath("dating", root, guest.interact),
      });
    }

    if (prestigeSkin) {
      const { prestigeSkinName, spine, interact } = prestigeSkin;

      items.push({
        id: spine.match(/[0-9]+/)[0] + "",
        charName,
        costumeName: prestigeSkinName,
        spine: makeCharInfoPath("character", root, spine),
        cutscene: "",
        datingHasNoBg: false,
        dating: makeCharInfoPath("dating", root, interact),
      });
    }

    return items;
  });
}

function makeAvatarMap(targetDir) {
  const root = path.resolve(targetDir, "ui/icon/icon_char/");
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const iconMap = {};

  for (const entry of entries) {
    if (entry.isFile()) {
      const matchCharId = /icon_char([0-9]+).+\.png$/.exec(entry.name);

      if (matchCharId) {
        iconMap[matchCharId[1]] = path
          .relative(process.cwd(), path.resolve(root, entry.name))
          .replace(/\\/g, "/");
      }
    }
  }

  iconMap.unknown = path
    .relative(process.cwd(), path.resolve(root, "icon_charinfo.png"))
    .replace(/\\/g, "/");

  return iconMap;
}

const targetDir = process.argv[2];
const outputPath = process.argv[3] || __dirname;

if (!targetDir) {
  console.error("请提供要扫描的目录路径");
  process.exit(1);
}

const [data, missingAssets] = collectAtlas(targetDir);
const charInfo = transformCharInfo(targetDir);
const avatarMap = makeAvatarMap(targetDir);

// 写入 JSON 文件
const spineListPath = path.resolve(outputPath, "SpineInfo.json");
fs.writeFileSync(
  spineListPath,
  JSON.stringify({ all: data, char: charInfo, avatar: avatarMap }, null, 2),
  "utf-8"
);
console.log(`已生成 JSON 文件：${spineListPath}`);

if (missingAssets.length) {
  console.log(`缺少 ${missingAssets.length} 条 PNG 数据`);
  console.log(missingAssets.toString());
}
