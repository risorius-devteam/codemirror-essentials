# @sung-yeop/codemirror-essentials-react

Essential CodeMirror 6 extensions for React applications.

## Installation

```bash
# pnpm
pnpm add @sung-yeop/codemirror-essentials-react

# npm
npm install @sung-yeop/codemirror-essentials-react

# yarn
yarn add @sung-yeop/codemirror-essentials-react
```

## Peer Dependencies

This package requires:
- `react` >= 16.8.0
- `react-dom` >= 16.8.0

## Features

### `useCmeLineWidget`

A React hook for adding custom widgets to specific lines in CodeMirror editor.

```tsx
import { useCmeLineWidget } from '@sung-yeop/codemirror-essentials-react';

function MyEditor() {
  const lineWidgetExtension = useCmeLineWidget({
    // Your line widget configuration
  });

  return (
    <CodeMirror
      extensions={[lineWidgetExtension]}
      // ... other props
    />
  );
}
```

### `useCmeInjectClassName`

A React hook for injecting custom class names into CodeMirror editor elements.

```tsx
import { useCmeInjectClassName } from '@sung-yeop/codemirror-essentials-react';
import type { InjectEffectType } from '@sung-yeop/codemirror-essentials-react';

function MyEditor() {
  const injectClassExtension = useCmeInjectClassName({
    // Your class injection configuration
  });

  return (
    <CodeMirror
      extensions={[injectClassExtension]}
      // ... other props
    />
  );
}
```

## API

### Exports

- `useCmeLineWidget` - Hook for line widget functionality
- `useCmeInjectClassName` - Hook for class name injection
- `InjectEffectType` - TypeScript type for injection effects

## License

MIT © [sung-yeop](https://github.com/sung-yeop)

## Repository

[https://github.com/risorius-devteam/codemirror-essentials](https://github.com/risorius-devteam/codemirror-essentials)

## Issues

Found a bug? Please [create an issue](https://github.com/risorius-devteam/codemirror-essentials/issues).
