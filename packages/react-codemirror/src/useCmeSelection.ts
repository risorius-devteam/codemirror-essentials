import { EditorView } from "@codemirror/view";
import { useCallback } from "react";

/**
 * Information about the current selection in the editor
 */
export interface SelectionInfo {
  /** Starting position of the selection (character offset) */
  from: number;
  /** Ending position of the selection (character offset) */
  to: number;
  /** Line number where the selection starts (1-indexed) */
  fromLine: number;
  /** Line number where the selection ends (1-indexed) */
  toLine: number;
  /** The selected text content */
  text: string;
  /** Whether there is an active selection (from !== to) */
  hasSelection: boolean;
}

/**
 * Hook to get information about the current selection in CodeMirror editor
 *
 * @param view - CodeMirror EditorView instance
 * @returns Object containing getSelection function
 *
 * @example
 * ```tsx
 * const { getSelection } = useCmeSelection(editorView);
 *
 * const handleClick = () => {
 *   const selection = getSelection();
 *   if (selection?.hasSelection) {
 *     console.log(`Selected lines ${selection.fromLine} to ${selection.toLine}`);
 *     console.log(`Selected text: ${selection.text}`);
 *   }
 * };
 * ```
 */
export const useCmeSelection = (view: EditorView | null) => {
  /**
   * Get the current selection information from the editor
   *
   * @returns SelectionInfo object or null if view is not available
   */
  const getSelection = useCallback((): SelectionInfo | null => {
    if (!view) {
      return null;
    }

    const selection = view.state.selection.main;
    const doc = view.state.doc;

    const from = selection.from;
    const to = selection.to;

    return {
      from,
      to,
      fromLine: doc.lineAt(from).number,
      toLine: doc.lineAt(to).number,
      text: view.state.sliceDoc(from, to),
      hasSelection: from !== to,
    };
  }, [view]);

  return {
    getSelection,
  };
};
