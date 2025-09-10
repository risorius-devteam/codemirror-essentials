import { useState, useRef } from "react";
import { CodeMirror, useInsertComponent } from "@codemirror-essentials/react";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";

const initialCode = `function greet(name) {
  return \`Hello, \${name}!\`
}

const message = greet('CodeMirror')
console.log(message)`;

// 삽입할 컴포넌트 예시
const MyCustomWidget = ({
  text,
  removeHandler,
}: {
  text: string;
  removeHandler: () => void;
}) => (
  <div
    style={{
      background: "#f0f0f0",
      border: "1px solid #ccc",
      padding: "8px",
      margin: "4px 0",
      borderRadius: "4px",
      fontSize: "14px",
    }}
    onClick={removeHandler}
  >
    📝 {text}
  </div>
);

function App() {
  const [code, setCode] = useState(initialCode);
  const [lineNumber, setLineNumber] = useState(2);
  const [widgetText, setWidgetText] = useState("Hello from widget!");
  const viewRef = useRef<EditorView | null>(null);
  const idMap = useRef<Map<number, string>>(new Map());

  const { insertComponent, removeComponent, lineWidgetExtension } =
    useInsertComponent(viewRef.current);

  const handleInsertWidget = () => {
    const id = `widget-${Date.now()}`;
    insertComponent(
      <MyCustomWidget
        text={widgetText}
        removeHandler={() => removeComponent(id)}
      />,
      {
        lineNumber,
        position: "below",
        id,
      }
    );
    idMap.current.set(0, id);
  };

  const handleInsertAbove = () => {
    const id = `widget-above-${Date.now()}`;
    insertComponent(
      <div
        style={{
          background: "#e6f3ff",
          padding: "8px",
          border: "1px solid #007acc",
          borderRadius: "4px",
        }}
      >
        ⬆️ 위에 삽입된 컴포넌트
      </div>,
      {
        lineNumber,
        position: "above",
        id,
      }
    );
  };

  const handleRemoveWidget = () => {
    const deleteId = idMap.current.get(0);

    removeComponent(deleteId ?? "");
  };

  return (
    <div style={{ padding: "20px", height: "100vh" }}>
      <h1>CodeMirror Essentials - Line Widget Example</h1>

      <div style={{ marginBottom: "16px" }}>
        <label>
          라인 번호:
          <input
            type="number"
            min="1"
            value={lineNumber}
            onChange={(e) => setLineNumber(Number(e.target.value))}
            style={{ marginLeft: "8px", marginRight: "16px" }}
          />
        </label>

        <label>
          위젯 텍스트:
          <input
            type="text"
            value={widgetText}
            onChange={(e) => setWidgetText(e.target.value)}
            style={{ marginLeft: "8px", marginRight: "16px" }}
          />
        </label>

        <button onClick={handleInsertWidget} style={{ marginRight: "8px" }}>
          라인 아래에 위젯 삽입
        </button>
        <button onClick={handleRemoveWidget}>삭제</button>

        <button onClick={handleInsertAbove}>라인 위에 위젯 삽입</button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
          height: "400px",
        }}
      >
        <CodeMirror
          ref={(view) => {
            if (view) viewRef.current = view.getView();
          }}
          value={code}
          onChange={(value) => setCode(value)}
          extensions={[javascript(), lineWidgetExtension]}
          className="editor"
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>현재 코드:</h3>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
            maxHeight: "200px",
          }}
        >
          {code}
        </pre>
      </div>
    </div>
  );
}

export default App;
