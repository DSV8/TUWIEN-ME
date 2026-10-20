# Workspace overview

Packages:
- [packages/language](./packages/language/README.md) - Contains the language definition.
- [packages/cli](./packages/cli/README.md) - Contains the command-line interface.
- [packages/extension](./packages/extension/langium-quickstart.md) - Contains the VSCode extension.


In the root directory:
- [package.json](./package.json) - The manifest file the main workspace package
- [tsconfig.json](./tsconfig.json) - The base TypeScript compiler configuration
- [tsconfig.build.json](./package.json) - Configuration used to build the complete source code.
- [.gitignore](.gitignore) - Files ignored by git

## Getting Started

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Run CLI:

```
node ./packages/cli/bin/cli.js generate <file> <destination> <format>
```



