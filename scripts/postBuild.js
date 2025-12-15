import { rm, cp } from "node:fs/promises";

rm("dist/SpineInfo.json");
cp("scripts/makeSpineInfo.js", "dist/makeSpineInfo.js");
