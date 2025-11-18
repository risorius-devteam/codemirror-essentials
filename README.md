# CodeMirror Essentials

Essential CodeMirror 6 extensions for modern development.

## 📦 Packages

### [@sung-yeop/codemirror-essentials-react](./packages/react-codemirror)

React wrapper for CodeMirror 6 with essential hooks.

```bash
pnpm add @sung-yeop/codemirror-essentials-react
```

## 🚀 Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Build library only
pnpm run build:lib

# Run examples
pnpm run dev:line-widget
pnpm run dev:inject-class

# Lint & Type Check
pnpm run lint
pnpm run type-check
```

## 📝 Publishing

1. **Login to NPM**
   ```bash
   npm login
   ```

2. **Create a changeset**
   ```bash
   pnpm changeset
   ```
   Select the package and version bump type (patch/minor/major)

3. **Update versions**
   ```bash
   pnpm version
   ```
   This will update package versions and generate CHANGELOGs

4. **Build and publish**
   ```bash
   pnpm release
   ```
   This will build the library and publish to NPM

## 📄 License

MIT © [sung-yeop](https://github.com/sung-yeop)
