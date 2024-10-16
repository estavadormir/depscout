import path from "path";
import readPkg from "read-pkg";

// Function to check for dependencies in package.json
export async function checkDependencies(cwd: string) {
  try {
    const packageJson = await readPkg({
      cwd: path.resolve(cwd), // Read from the provided project directory
    });

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    return { dependencies, devDependencies };
  } catch (error) {
    console.error("Error reading package.json:", error);
    return { dependencies: {}, devDependencies: {} };
  }
}

// Function to get all dependency names
export function getAllDeps(
  dependencies: Record<string, any>,
  devDependencies: Record<string, any>,
) {
  return {
    all: Object.keys(dependencies),
    dev: Object.keys(devDependencies),
  };
}
