import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { useCallback } from "react";

interface InjectEffectSpec {
  type: "range" | "single";
  range?: {
    from: number;
    to: number;
  };
  singleLineNumber?: number;
  id?: string;
  className: string;
}

interface RemoveInjectEffectSepc {
  type: "className" | "id";
  content: string;
}

const addInjectEffect = StateEffect.define<InjectEffectSpec>();
const removeInjectEffect = StateEffect.define<RemoveInjectEffectSepc>();

const injectField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    value = value.map(tr.changes);

    for (const effect of tr.effects) {
      if (effect.is(addInjectEffect)) {
        const { type, range, singleLineNumber, id, className } = effect.value;
        const totalLines = tr.state.doc.lines;

        const validate = ({ from, to }: { from: number; to: number }) => {
          return from >= 1 && to <= totalLines;
        };

        if (type === "range" && range && validate(range)) {
          const startLine = tr.state.doc.lineAt(range.from).number;
          const endLine = tr.state.doc.lineAt(range.to).number;

          const decorations = [];
          for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
            const line = tr.state.doc.line(lineNum);
            const attrs: Record<string, string> = { class: className };
            if (id) {
              attrs.id = id;
            }
            decorations.push(Decoration.line(attrs).range(line.from));
          }

          value = value.update({
            add: decorations,
          });
        }

        if (
          type === "single" &&
          singleLineNumber &&
          singleLineNumber >= 1 &&
          singleLineNumber <= totalLines
        ) {
          const line = tr.state.doc.line(singleLineNumber);
          const attrs: Record<string, string> = { class: className };
          if (id) {
            attrs.id = id;
          }
          const decoration = Decoration.line(attrs).range(line.from);
          value = value.update({
            add: [decoration],
          });
        }
      }

      if (effect.is(removeInjectEffect)) {
        const { type, content } = effect.value;

        // Filter out decorations that match the removal criteria
        const filtered: any[] = [];
        value.between(0, tr.state.doc.length, (from, to, decoration) => {
          const attrs = decoration.spec.attributes as
            | Record<string, string>
            | undefined;
          if (attrs) {
            // Check if this decoration should be removed
            const shouldRemove =
              (type === "className" && attrs.class === content) ||
              (type === "id" && attrs.id === content);

            if (!shouldRemove) {
              // Keep this decoration
              filtered.push(decoration.range(from, to));
            }
          }
        });

        // Create new decoration set with filtered decorations
        value = Decoration.set(filtered);
      }
    }

    return value;
  },

  provide: (f) => EditorView.decorations.from(f),
});

export const useCmeInjectClassName = (view: EditorView | null) => {
  const addInject = useCallback(
    (spec: InjectEffectSpec) => {
      if (!view) return;

      view.dispatch({
        effects: addInjectEffect.of(spec),
      });
    },
    [view]
  );

  const removeInject = useCallback(
    (spec: RemoveInjectEffectSepc) => {
      if (!view) return;

      view.dispatch({
        effects: removeInjectEffect.of(spec),
      });
    },
    [view]
  );

  return {
    addInject,
    removeInject,
    injectFieldExtension: injectField,
  };
};
