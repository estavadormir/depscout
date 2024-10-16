import path from "path";
import readPkg from "read-pkg";

// Function to check for dependencies in package.json
export async function checkDependencies() {
  try {
    const packageJson = await readPkg({
      cwd: path.resolve(process.cwd()), // Read from the current project root
    });

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    return { dependencies, devDependencies };
  } catch (error) {
    console.error("Error reading package.json:", error);
    return { dependencies: {}, devDependencies: {} };
  }
}
