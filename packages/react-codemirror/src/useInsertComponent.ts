import { useCallback } from "react";
import { EditorView } from "@codemirror/view";
import { useLineWidget } from "./useLineWidget";

export interface InsertComponentOptions {
  lineNumber: number;
  position?: "above" | "below"; // Default is Below
  id?: string;
}

export const useInsertComponent = (view: EditorView | null) => {
  const { addLineWidget, removeLineWidget, lineWidgetExtension } =
    useLineWidget(view);

  const insertComponent = useCallback(
    (component: React.ReactElement, options: InsertComponentOptions) => {
      const { lineNumber, position = "below", id } = options;

      addLineWidget({
        lineNumber,
        component,
        id: id || `widget-${Date.now()}`,
        above: position === "above",
      });
    },
    [addLineWidget]
  );

  const removeComponent = useCallback(
    (id: string) => {
      removeLineWidget(id);
    },
    [removeLineWidget]
  );

  return {
    insertComponent,
    removeComponent,
    lineWidgetExtension,
  };
};
