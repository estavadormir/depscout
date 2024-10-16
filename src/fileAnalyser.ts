import { transform } from "@swc/core";
import fs from "fs";
import path from "path";

// Function to recursively get all .ts/.js files in a directory
export function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = [],
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
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
    imports.push(match[1]); // This will now be properly typed as a string
  }

  return imports;
}
