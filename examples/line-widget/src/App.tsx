import { useState, useRef } from "react";
import { useCmeLineWidget } from "@sung-yeop/codemirror-essentials-react";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";

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
    {text}
  </div>
);

function App() {
  const [code, setCode] = useState(initialCode);
  const [lineNumber, setLineNumber] = useState(2);
  const [widgetText, setWidgetText] = useState("Hello from widget!");
  const viewRef = useRef<EditorView | null>(null);
  const idMap = useRef<Map<number, string>>(new Map());

  const { addLineWidget, removeLineWidget, lineWidgetExtension } =
    useCmeLineWidget(viewRef.current);

  // 현재 코드의 라인 수 계산
  const totalLines = code.split("\n").length;

  const handleInsertWidget = () => {
    const id = `widget-${Date.now()}`;
    addLineWidget({
      lineNumber,
      component: (
        <MyCustomWidget
          text="텍스트"
          removeHandler={() => removeLineWidget(id)}
        />
      ),
      id,
    });
    idMap.current.set(0, id);
  };

  const handleInsertAbove = () => {
    const id = `widget-above-${Date.now()}`;
    addLineWidget({
      lineNumber,
      above: true,
      component: (
        <MyCustomWidget
          text="텍스트"
          removeHandler={() => removeLineWidget(id)}
        />
      ),
      id,
    });
  };

  const handleRemoveWidget = () => {
    const deleteId = idMap.current.get(0);

    removeLineWidget(deleteId ?? "");
  };

  return (
    <div style={{ padding: "20px", height: "100vh" }}>
      <h1>CodeMirror Essentials - Line Widget Example</h1>

      <div style={{ marginBottom: "16px" }}>
        <label>
          Line Number (1-{totalLines}):
          <input
            type="number"
            min="1"
            value={lineNumber}
            onChange={(e) => {
              const value = Number(e.target.value);
              setLineNumber(value);
            }}
            style={{
              marginLeft: "8px",
              marginRight: "16px",
              width: "80px",
              backgroundColor:
                lineNumber > totalLines || lineNumber < 1 ? "#ffe6e6" : "white",
            }}
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
          onCreateEditor={(view) => (viewRef.current = view)}
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
