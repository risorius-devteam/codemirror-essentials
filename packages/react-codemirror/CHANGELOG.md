# @sung-yeop/codemirror-essentials-react

## 0.0.4

### Patch Changes

- Add useCmeLineReplace hook with Decoration.replace() widget support
  - Implement OriginalCodeWidget to display original code as a block without line numbers
  - Add Decoration.replace() for range highlighting
  - Support rangeClassName and improvedClassName for custom styling
  - Insert improved text with actual document changes
  - Add comprehensive example in examples/line-replace

## 0.0.2

### Patch Changes

- d10b6ff: Add useCmeSelection hook to get editor selection information (from, to, fromLine, toLine, text, hasSelection)
