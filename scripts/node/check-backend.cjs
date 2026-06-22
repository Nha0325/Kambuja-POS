const { readdirSync, statSync } = require("node:fs")
const { join, relative, resolve } = require("node:path")
const { spawnSync } = require("node:child_process")

const backendRoot = resolve(__dirname, "../../Backend")
const ignoredDirectories = new Set(["node_modules", "upload"])

function collectJavaScriptFiles(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const fullPath = join(directory, entry)
      const relativePath = relative(backendRoot, fullPath)

      if (statSync(fullPath).isDirectory()) {
        return ignoredDirectories.has(entry) ? [] : collectJavaScriptFiles(fullPath)
      }

      return relativePath.endsWith(".js") ? [fullPath] : []
    })
    .sort()
}

const files = collectJavaScriptFiles(backendRoot)

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  })

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }
}

console.log(`Checked ${files.length} Backend JavaScript files.`)
