import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import prettier from "prettier";

const root = new URL("../", import.meta.url);
const contractPath = new URL("api/backend.openapi.json", root);
const revisionPath = new URL("api/backend-revision.json", root);
const typesPath = new URL("src/generated/backend-api.ts", root);
const repository = "Goody3/discover-jesus-backend";
const sourcePath = "api/openapi.json";
const hash = (content) => createHash("sha256").update(content).digest("hex");
const validRevision = (revision) => /^[a-f0-9]{40}$/.test(revision);

async function generate() {
  const pin = JSON.parse(await readFile(revisionPath, "utf8"));
  const content = await readFile(contractPath, "utf8");
  if (!validRevision(pin.revision) || hash(content) !== pin.sha256) {
    throw new Error(
      "Backend contract provenance mismatch. Use npm run api:update for a reviewed revision.",
    );
  }
  const ast = await openapiTS(new URL(contractPath));
  const header = `// Generated from ${repository}@${pin.revision}:${sourcePath}.\n// Do not edit; run npm run api:generate.\n`;
  return prettier.format(header + astToString(ast), {
    ...(await prettier.resolveConfig(fileURLToPath(typesPath))),
    filepath: fileURLToPath(typesPath),
  });
}

const [mode, revision, checkout] = process.argv.slice(2);
if (mode === "update") {
  if (!validRevision(revision)) {
    throw new Error("Supply a full lowercase 40-character backend commit SHA.");
  }
  let content;
  if (checkout) {
    content = execFileSync("git", ["-C", checkout, "show", `${revision}:${sourcePath}`], {
      encoding: "utf8",
    });
  } else {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/contents/${sourcePath}?ref=${revision}`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Backend contract retrieval failed (${response.status}). Check revision and repository access.`,
      );
    }
    content = await response.text();
  }
  const document = JSON.parse(content);
  if (document.openapi !== "3.0.1" || !document.paths || !document.components?.schemas) {
    throw new Error("Expected the backend OpenAPI 3.0.1 document with paths and schemas.");
  }
  await mkdir(new URL("api/", root), { recursive: true });
  await mkdir(new URL("src/generated/", root), { recursive: true });
  await writeFile(contractPath, content);
  await writeFile(
    revisionPath,
    JSON.stringify({ revision, sha256: hash(content) }, null, 2) + "\n",
  );
  await writeFile(typesPath, await generate());
  console.log(
    `Updated backend contract and generated types to ${revision}. Review all three files.`,
  );
} else if (mode === "generate") {
  await writeFile(typesPath, await generate());
} else if (mode === "check") {
  if ((await readFile(typesPath, "utf8")) !== (await generate())) {
    throw new Error(
      "Stale backend API types. Run npm run api:generate and review the contract revision.",
    );
  }
  console.log("Backend contract provenance and generated types match.");
} else {
  throw new Error("Expected generate, check, or update <backend-sha> [backend-checkout].");
}
