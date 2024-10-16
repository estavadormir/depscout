import { transform } from "@swc/core";
import fs from "fs";
import { minimatch } from "minimatch";
import path from "path";

// Function to load ignore patterns from the .ignore file
export function loadIgnorePatterns(ignoreFilePath: string): string[] {
  if (!fs.existsSync(ignoreFilePath)) {
    console.warn(`Ignore file not found at ${ignoreFilePath}, skipping...`);
    return [];
  }

  const patterns = fs.readFileSync(ignoreFilePath, "utf-8").split("\n");
  return patterns.map((pattern) => pattern.trim()).filter(Boolean);
}

// Function to recursively get all .ts/.js files in a directory
export function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = [],
  ignorePatterns: string[] = []
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    // Skip if the current file or directory matches any ignore patterns
    if (ignorePatterns.some((pattern) => minimatch(fullPath, pattern))) {
      return; // Skip this file or directory
    }

    // Check if it's a directory and if it's named node_modules
    if (fs.statSync(fullPath).isDirectory()) {
      // Specifically skip the 'node_modules' directory by name
      if (file === "node_modules") {
        return; // Skip this directory and all its contents
      }

      // Recur down the directory
      getAllFiles(fullPath, arrayOfFiles, ignorePatterns);
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      // Collect TypeScript or JavaScript files
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export async function analyzeImportsWithSwc(filePath: string) {
  const code = await Bun.file(filePath).text(); // Get file content using Bun's API

  const { code: transformedCode } = await transform(code, {
    filename: filePath,
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: false,
      },
      target: "es2018",
    },
  });

  const imports: string[] = []; // Define the imports array as an array of strings
  const regex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null; // Define the match variable

  while ((match = regex.exec(transformedCode)) !== null) {
    imports.push(match[1]); // Extract import paths
  }

  return imports;
}
