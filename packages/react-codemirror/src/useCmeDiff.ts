import { StateEffect, StateField } from "@codemirror/state";
import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { ReactElement, useCallback } from "react";
import { useCmeInjectClassName } from "./useCmeInjectClassName";
import { useCmeLineWidget } from "./useCmeLineWidget";

export interface DiffWidgetSpec {
  redRange: {
    from: number;
    to: number;
  };
  targetText: string; // 내부적으로 사용 (widget에 표시할 텍스트)
  id: string;
  above?: boolean;
}

export interface RemoveDiffSpec {
  id: string;
}

const addDiffHighlight = StateEffect.define<DiffWidgetSpec>();
const clearDiffHighlight = StateEffect.define<RemoveDiffSpec>();

// 삭제된 텍스트를 표시하는 Widget 클래스
class DiffDeletedWidget extends WidgetType {
  constructor(
    private targetText: string,
    public id: string
  ) {
    super();
  }

  toDOM() {
    const div = document.createElement("div");
    div.className = "cm-diff-red-range";
    div.setAttribute("data-id", this.id);
    div.setAttribute("data-diff-type", "red");
    div.textContent = this.targetText;
    return div;
  }

  eq(other: DiffDeletedWidget) {
    return this.id === other.id && this.targetText === other.targetText;
  }
}

// Diff 하이라이트 데코레이션 필드
const diffHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);

    for (const e of tr.effects) {
      if (e.is(addDiffHighlight)) {
        const { redRange, id, targetText, above = true } = e.value;

        const decorationsToAdd = [];

        // 삭제될 텍스트를 block widget으로 표시 (빨간색, 새 줄)
        if (
          redRange.from >= 0 && // position은 0부터 시작
          redRange.from <= tr.state.doc.length &&
          targetText
        ) {
          const widget = Decoration.widget({
            widget: new DiffDeletedWidget(targetText, id),
            side: above ? -1 : 1, // above: true면 텍스트 위(-1), false면 아래(1)
            block: true,
          });

          decorationsToAdd.push(widget.range(redRange.from));
        }

        decorations = decorations.update({ add: decorationsToAdd });
      } else if (e.is(clearDiffHighlight)) {
        if (e.value.id) {
          decorations = decorations.update({
            filter: (from, to, decoration) => {
              const widget = decoration.spec.widget as DiffDeletedWidget;
              return widget.id !== e.value.id;
            },
          });
        } else {
          decorations = Decoration.none;
        }
      }
    }

    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export const useCmeDiff = (view: EditorView | null) => {
  const { addInject, removeInject, injectFieldExtension } =
    useCmeInjectClassName(view);
  const { addLineWidget, removeLineWidget, lineWidgetExtension } =
    useCmeLineWidget(view);

  const addDiffRedRange = useCallback(
    (spec: DiffWidgetSpec) => {
      if (!view) return;

      view.dispatch({
        effects: addDiffHighlight.of(spec),
      });
    },
    [view]
  );

  const removeDiffRedRange = useCallback(
    (spec: RemoveDiffSpec) => {
      if (!view) return;

      // 1. red widget 제거
      view.dispatch({
        effects: clearDiffHighlight.of(spec),
      });

      // 2. green decoration 제거
      removeInject({
        type: "id",
        content: spec.id,
      });
    },
    [view, removeInject]
  );

  const handleDiff = useCallback(
    ({
      redRange,
      greenRangeTargetText,
      id,
      above = true,
      diffOptionComponent,
    }: {
      redRange: { from: number; to: number };
      redRangeTargetText?: string;
      greenRangeTargetText: string;
      id: string;
      above?: boolean;
      diffOptionComponent: ReactElement;
    }) => {
      if (!view) return;

      // 1. redRange는 line number로 받음
      const fromLineNumber = redRange.from;
      const toLineNumber = redRange.to;

      // 2. line number에서 실제 position 계산 (변경 전)
      const fromLine = view.state.doc.line(fromLineNumber);
      const insertPosition = fromLine.from;
      const toLine = view.state.doc.line(toLineNumber);
      const endPosition = toLine.to;

      // 3. from~to 라인의 실제 텍스트 추출 (항상 실행)
      const redLines = [];
      for (let lineNum = fromLineNumber; lineNum <= toLineNumber; lineNum++) {
        const line = view.state.doc.line(lineNum);
        redLines.push(line.text);
      }
      const actualRedText = redLines.join("\n");

      // 4. greenText가 개행으로 끝나지 않으면 개행 추가 (라인 단위로 처리)
      const greenTextWithNewline = greenRangeTargetText.endsWith("\n")
        ? greenRangeTargetText
        : greenRangeTargetText + "\n";

      // 5. green text의 길이 계산
      const greenTextLength = greenTextWithNewline.length;

      // 6. red widget position 계산
      // above=true: insertPosition에 side=-1 → green 위
      // above=false: insertPosition + greenTextLength에 side=1 → green 아래

      console.log("insertPosition : ", insertPosition);
      const redWidgetPosition = above
        ? insertPosition
        : insertPosition + greenTextLength;

      console.log("redWidgetPosition : ", redWidgetPosition);

      // 7. 한 번의 dispatch에 changes + effects 모두 적용
      // redRange(from~to 라인)의 텍스트를 삭제하고 greenText로 replace
      view.dispatch({
        changes: {
          from: insertPosition, // fromLine의 시작
          to: endPosition, // toLine의 끝 (from~to 라인 전체를 삭제)
          insert: greenTextWithNewline,
        },
        effects: [
          // redRange block widget 추가
          addDiffHighlight.of({
            redRange: {
              from: redWidgetPosition,
              to: redWidgetPosition, // widget이므로 point position
            },
            targetText: actualRedText,
            id,
            above,
          }),
        ],
      });

      // 8. 삽입된 텍스트의 라인 범위 계산
      // greenTextWithNewline은 항상 \n으로 끝나므로 split 결과 마지막은 빈 문자열
      const lines = greenTextWithNewline.split("\n");
      const lineCount = lines.length - 1; // 마지막 빈 문자열 제외
      const startLine = fromLineNumber;
      const endLine = fromLineNumber + lineCount - 1;

      console.log("=== handleDiff ===");
      console.log("redRange (line):", fromLineNumber, "~", toLineNumber);
      console.log("actualRedText:", actualRedText);
      console.log("greenText:", greenRangeTargetText);
      console.log("insertPosition:", insertPosition);
      console.log("greenText lines:", lines);
      console.log("lineCount:", lineCount);
      console.log("green decoration:", startLine, "~", endLine);

      // 9. 삽입된 라인들에 초록색 decoration 추가
      addInject({
        type: "RANGE",
        range: {
          from: startLine,
          to: endLine,
        },
        className: "cm-diff-green-range",
        id,
      });

      // 10. diffOption Component 추가 (Accept / Reject)
      addLineWidget({
        lineNumber: endLine,
        above: false,
        isBlock: true,
        id: `cme-diff-option-${id}`,
        component: diffOptionComponent,
      });
    },
    [view, addInject, addLineWidget]
  );

  return {
    handleDiff,
    addDiffRedRange,
    removeDiffRedRange,
    diffWidgetExtension: diffHighlightField,
    injectFieldExtension,
    lineWidgetExtension,
  };
};
