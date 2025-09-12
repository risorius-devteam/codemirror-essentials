import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { EditorView, EditorViewConfig, ViewUpdate } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";

export interface CodeMirrorProps {
  /** The initial value of the editor */
  value?: string;
  /** Called when the editor content changes */
  onChange?: (value: string, viewUpdate: ViewUpdate) => void;
  /** CodeMirror extensions */
  extensions?: Extension[];
  /** Editor configuration */
  config?: Partial<EditorViewConfig>;
  /** Whether the editor is editable */
  editable?: boolean;
  /** CSS class name */
  className?: string;
}

export interface CodeMirrorRef {
  /** Get the current editor value */
  getValue: () => string;
  /** Set the editor value */
  setValue: (value: string) => void;
  /** Get the CodeMirror view instance */
  getView: () => EditorView | null;
}

export const CodeMirror = forwardRef<CodeMirrorRef, CodeMirrorProps>(
  (
    {
      value = "",
      onChange,
      extensions = [],
      config = {},
      editable = true,
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => viewRef.current?.state.doc.toString() ?? "",
      setValue: (newValue: string) => {
        if (viewRef.current) {
          viewRef.current.dispatch({
            changes: {
              from: 0,
              to: viewRef.current.state.doc.length,
              insert: newValue,
            },
          });
        }
      },
      getView: () => viewRef.current,
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const state = EditorState.create({
        doc: value,
        extensions: [
          ...extensions,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
              onChange(update.state.doc.toString(), update);
            }
          }),
          EditorState.readOnly.of(!editable),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
        ...config,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, [config, editable, extensions, onChange, value]);

    // Update value when prop changes
    useEffect(() => {
      if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: value,
          },
        });
      }
    }, [value]);

    // Update extensions when they change
    useEffect(() => {
      if (viewRef.current) {
        const newState = EditorState.create({
          doc: viewRef.current.state.doc,
          extensions: [
            ...extensions,
            EditorView.updateListener.of((update) => {
              if (update.docChanged && onChange) {
                onChange(update.state.doc.toString(), update);
              }
            }),
            EditorState.readOnly.of(!editable),
          ],
        });
        viewRef.current.setState(newState);
      }
    }, [extensions, editable, onChange]);

    return <div ref={containerRef} className={className} />;
  }
);

CodeMirror.displayName = "CodeMirror";
