# useCmeLineReplace - Diff/Review 기능 사용 예제

## 개요

`useCmeLineReplace`는 CodeMirror 에디터에서 diff/review 기능을 구현하기 위한 React hook입니다.

**핵심 특징:**
- 원본 코드 영역을 사용자 정의 CSS 클래스로 highlight
- 개선된 코드를 원본 아래에 **실제로 삽입** (document 변경)
- CodeMirror가 자동으로 라인 넘버 부여
- `onChange` 이벤트 발생

## 타입 정의

```typescript
interface RangeInterface {
  from: number;      // 시작 위치 (문자 오프셋)
  to: number;        // 종료 위치 (문자 오프셋)
  fromLine: number;  // 시작 라인 (1-indexed)
  toLine: number;    // 종료 라인 (1-indexed)
}

interface ReviewInterface {
  range: RangeInterface;
  improvedText: string;
  rangeClassName?: string;      // 원본 코드 highlight CSS 클래스
  improvedClassName?: string;   // 개선 코드 highlight CSS 클래스
  id?: string;                  // 선택적 고유 식별자
}
```

## 동작 방식

1. **원본 코드 (range)**: `rangeClassName`으로 highlight (예: 빨간색)
2. **개선 코드 삽입**: `toLine` 다음에 `\n + improvedText` 실제 삽입
3. **개선 코드 highlight**: 삽입된 텍스트에 `improvedClassName` 적용 (예: 초록색)
4. **라인 넘버**: CodeMirror가 자동 생성

## 기본 사용법

```tsx
import { useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { useCmeLineReplace } from '@sung-yeop/codemirror-essentials-react';

function MyEditor() {
  const editorRef = useRef<EditorView | null>(null);
  const {
    addReview,
    addReviews,
    removeReview,
    clearReviews,
    reviewExtension
  } = useCmeLineReplace(editorRef.current);

  const handleAddReview = () => {
    addReview({
      range: {
        from: 0,
        to: 47,
        fromLine: 1,
        toLine: 3
      },
      improvedText: `/**
 * Calculate the sum of two numbers
 */
function calculateSum(a, b) {
  return a + b;
}`,
      rangeClassName: "review-old",
      improvedClassName: "review-new",
      id: "review-1"
    });
  };

  return (
    <div>
      <style>{`
        .review-old {
          background-color: rgba(255, 100, 100, 0.15);
          border-left: 3px solid #ff6666;
          padding-left: 4px;
        }
        .review-new {
          background-color: rgba(100, 255, 100, 0.15);
          border-left: 3px solid #66ff66;
          padding-left: 4px;
        }
      `}</style>

      <button onClick={handleAddReview}>Add Review</button>

      <CodeMirror
        value="function calculateSum(a, b) {\n  return a + b;\n}"
        extensions={[reviewExtension]}
        onCreateEditor={(view) => {
          editorRef.current = view;
        }}
        onChange={(value) => {
          console.log("Document changed:", value);
        }}
      />
    </div>
  );
}
```

## 여러 Review 추가하기

```tsx
const reviews: ReviewInterface[] = [
  {
    range: { from: 0, to: 47, fromLine: 1, toLine: 3 },
    improvedText: "// Improved version\nconst sum = (a, b) => a + b;",
    rangeClassName: "review-old",
    improvedClassName: "review-new",
    id: "review-1"
  },
  {
    range: { from: 114, to: 185, fromLine: 9, toLine: 12 },
    improvedText: "const multiply = (x, y) => x * y;",
    rangeClassName: "review-old",
    improvedClassName: "review-new",
    id: "review-2"
  }
];

// 한 번에 여러 review 추가 (성능 최적화)
addReviews(reviews);
```

## useCmeSelection과 함께 사용하기

```tsx
import { useCmeSelection, useCmeLineReplace } from '@sung-yeop/codemirror-essentials-react';

function EditorWithReview() {
  const editorRef = useRef<EditorView | null>(null);
  const { getSelection } = useCmeSelection(editorRef.current);
  const { addReview, reviewExtension } = useCmeLineReplace(editorRef.current);

  const handleAddReviewFromSelection = () => {
    const selection = getSelection();
    if (!selection?.hasSelection) {
      alert("Please select some text first!");
      return;
    }

    const improvedCode = prompt("Enter improved code:");
    if (!improvedCode) return;

    addReview({
      range: {
        from: selection.from,
        to: selection.to,
        fromLine: selection.fromLine,
        toLine: selection.toLine
      },
      improvedText: improvedCode,
      rangeClassName: "review-old",
      improvedClassName: "review-new",
      id: `review-${Date.now()}`
    });
  };

  return (
    <div>
      <button onClick={handleAddReviewFromSelection}>
        Add Review from Selection
      </button>
      <CodeMirror
        value="const x = 1;\nconst y = 2;"
        extensions={[reviewExtension]}
        onCreateEditor={(view) => {
          editorRef.current = view;
        }}
      />
    </div>
  );
}
```

## API 레퍼런스

### `addReview(review: ReviewInterface)`
단일 review를 추가하고 improved text를 실제로 삽입합니다.

### `addReviews(reviews: ReviewInterface[])`
여러 review를 한 번에 추가합니다. 성능 최적화를 위해 권장됩니다.

### `removeReview(id: string)`
특정 ID의 review highlight를 제거합니다. **주의**: 삽입된 텍스트는 제거되지 않습니다.

### `clearReviews()`
모든 review highlight를 제거합니다. **주의**: 삽입된 텍스트는 제거되지 않습니다.

### `reviewExtension`
CodeMirror extension으로, editor의 `extensions` 배열에 추가해야 합니다.

## CSS 스타일링

기본 스타일 예시:

```css
/* 원본 코드 (삭제 예정) - 빨간색 */
.review-old {
  background-color: rgba(255, 100, 100, 0.15);
  border-left: 3px solid #ff6666;
  padding-left: 4px;
}

/* 개선된 코드 (추가됨) - 초록색 */
.review-new {
  background-color: rgba(100, 255, 100, 0.15);
  border-left: 3px solid #66ff66;
  padding-left: 4px;
}
```

## 중요 사항

1. **실제 document 변경**: `improvedText`가 실제로 삽입되어 `onChange` 이벤트가 발생합니다.
2. **라인 넘버 자동 생성**: CodeMirror가 자동으로 라인 넘버를 부여합니다.
3. **Remove는 highlight만**: `removeReview()`는 highlight만 제거하며, 삽입된 텍스트는 남아있습니다.
4. **성능**: 여러 review를 추가할 때는 `addReviews([...])`를 사용하세요.
5. **className 필수**: `rangeClassName`과 `improvedClassName`을 지정해야 highlight가 표시됩니다.

## 사용 사례

- AI 코드 리뷰 및 제안 도구
- Diff/merge 시각화
- 교육용 코드 피드백 시스템
- 린팅 및 코드 품질 개선 제안
- 자동 리팩토링 도구
