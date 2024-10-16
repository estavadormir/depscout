import path from "path";
import { checkDependencies } from "./dependencyChecker";
import { analyzeImportsWithSwc, getAllFiles } from "./fileAnalyser";

async function main() {
  // Check dependencies
  const { dependencies, devDependencies } = await checkDependencies();
  console.log("Dependencies:", dependencies);
  console.log("DevDependencies:", devDependencies);

  // Get all .ts and .js files in the src directory
  const srcDir = path.join(process.cwd(), "src");
  const allFiles = getAllFiles(srcDir); // Get all files in the src directory
  console.log("All Files:", allFiles);

  // Analyze imports for each file
  for (const file of allFiles) {
    const imports = await analyzeImportsWithSwc(file); // Ensure this is awaited if it's asynchronous
    console.log(`Imports in ${file}:`, imports);
  }
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
