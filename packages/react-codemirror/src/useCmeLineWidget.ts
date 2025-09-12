import { useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  EditorView,
  WidgetType,
  Decoration,
  DecorationSet,
} from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

interface LineWidgetSpec {
  lineNumber: number;
  component: React.ReactElement;
  id?: string;
  above?: boolean;
  isBlock?: boolean;
}

const addLineWidgetEffect = StateEffect.define<LineWidgetSpec>();
const removeLineWidgetEffect = StateEffect.define<string>();

class ReactLineWidget extends WidgetType {
  public id?: string;

  constructor(
    private component: React.ReactElement,
    id?: string
  ) {
    super();
    this.id = id;
  }

  toDOM() {
    const container = document.createElement("div");
    container.className = "cm-line-widget";
    if (this.id) {
      container.id = `line-widget-${this.id}`;
    }

    const root = createRoot(container);
    root.render(this.component);

    (container as any).__reactRoot = root;

    return container;
  }

  destroy(dom: HTMLElement) {
    const container = dom as any;
    if (container?.__reactRoot) {
      container.__reactRoot.unmount();
    }
  }

  eq(other: ReactLineWidget) {
    return this.id === other.id;
  }
}

const lineWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(widgets, tr) {
    widgets = widgets.map(tr.changes);

    for (const effect of tr.effects) {
      if (effect.is(addLineWidgetEffect)) {
        const {
          lineNumber,
          component,
          id,
          above = false,
          isBlock = true,
        } = effect.value;

        const totalLines = tr.state.doc.lines;
        const validLineNumber = Math.max(1, Math.min(lineNumber, totalLines));

        const line = tr.state.doc.line(validLineNumber);
        const pos = above ? line.from : line.to;

        const widget = new ReactLineWidget(component, id);
        const decoration = Decoration.widget({
          widget,
          side: above ? -1 : 1,
          block: isBlock,
        });

        widgets = widgets.update({
          add: [decoration.range(pos)],
        });
      }

      if (effect.is(removeLineWidgetEffect)) {
        const id = effect.value;
        widgets = widgets.update({
          filter: (_from, _to, decoration) => {
            const widget = decoration.spec.widget as ReactLineWidget;
            return widget?.id !== id;
          },
        });
      }
    }

    return widgets;
  },

  provide: (f) => EditorView.decorations.from(f),
});

export const useCmeLineWidget = (view: EditorView | null) => {
  const addLineWidget = useCallback(
    (spec: LineWidgetSpec) => {
      if (!view) return;

      view.dispatch({
        effects: addLineWidgetEffect.of(spec),
      });
    },
    [view]
  );

  const removeLineWidget = useCallback(
    (id: string) => {
      if (!view) return;

      view.dispatch({
        effects: removeLineWidgetEffect.of(id),
      });
    },
    [view]
  );

  return {
    addLineWidget,
    removeLineWidget,
    lineWidgetExtension: lineWidgetField,
  };
};
