import inquirer from "inquirer"; // Import inquirer
import path from "path";
import { checkDependencies, getAllDeps } from "./dependencyChecker";
import {
  analyzeImportsWithSwc,
  getAllFiles,
  loadIgnorePatterns,
} from "./fileAnalyser";

async function getSourceDirectory() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "srcDir",
      message: "Please enter the path to the source code directory:",
      default: "src", // Set a default, e.g., "src" if no input is provided
    },
  ]);
  return answers.srcDir;
}

async function main() {
  // Get source directory from user input
  const srcDir = await getSourceDirectory();
  const resolvedDir = path.resolve(process.cwd(), srcDir); // Resolve to an absolute path

  // Load ignore patterns from the .ignore file
  const ignorePatterns = loadIgnorePatterns(
    path.join(process.cwd(), ".ignore"),
  );

  // Get all files while respecting the ignore patterns
  const allFiles = getAllFiles(resolvedDir, [], ignorePatterns); // Get all files in the specified directory

  // Check dependencies for the specified project directory
  const { dependencies, devDependencies } =
    await checkDependencies(resolvedDir); // Pass resolved directory to checkDependencies
  console.log("Dependencies:", dependencies);
  console.log("DevDependencies:", devDependencies);

  // Gather all imports from the analyzed files
  const allImports: string[] = [];

  // Create a usage counter for each dependency
  const usageCount: Record<string, number> = {};

  // Analyze imports for each file
  for (const file of allFiles) {
    const imports = await analyzeImportsWithSwc(file);
    allImports.push(...imports); // Aggregate imports into the allImports array
    // Update usage counter for each imported dependency
    for (const imp of imports) {
      if (usageCount[imp] !== undefined) {
        usageCount[imp] += 1; // Increment count if already present
      } else {
        usageCount[imp] = 1; // Initialize count
      }
    }
  }

  // Identify unused dependencies
  const unusedDeps = getAllDeps(dependencies, devDependencies).all.filter(
    (dep) => !allImports.includes(dep),
  );

  // Report unused dependencies
  if (unusedDeps.length) {
    console.log("Usage Count:", usageCount);
    console.log("Unused Dependencies:", unusedDeps);
  } else {
    console.log("All dependencies are being used!");
  }
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
