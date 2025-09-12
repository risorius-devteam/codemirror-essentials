import { useState, useRef, useEffect } from "react";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import {
  CodeMirror,
  useCmeInjectClassName,
} from "@codemirror-essentials/react";

const initialCode = `function greet(name) {
  return \`Hello, \${name}!\`
}

const message = greet('CodeMirror')
console.log(message)`;

function App() {
  const [code, setCode] = useState(initialCode);
  const viewRef = useRef<EditorView | null>(null);
  const [type, setType] = useState<"range" | "single">("range");
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(1);

  useEffect(() => {
    console.log("to : ", to);
  }, [to]);

  const { addInject, removeInject, injectFieldExtension } =
    useCmeInjectClassName(viewRef.current);

  const handleHighLight = () => {
    if (type === "range") {
      addInject({
        type: "range",
        range: {
          from,
          to,
        },
        className: "Inject-Range-HighLight-Test",
      });
    }

    if (type === "single") {
      addInject({
        type: "single",
        singleLineNumber: from,
        className: "Inject-Single-HighLight-Test",
      });
    }
  };

  const handleRemoveHighlight = (type: "Range" | "Single") => {
    //       interface RemoveInjectEffectSepc {
    //     type: "className" | "id";
    //     content: string;
    // }

    if (type === "Range")
      removeInject({
        type: "className",
        content: "Inject-Range-HighLight-Test",
      });

    if (type === "Single")
      removeInject({
        type: "className",
        content: "Inject-Single-HighLight-Test",
      });
  };

  return (
    <div style={{ padding: "20px", height: "100vh" }}>
      <h1>CodeMirror Essentials - Line Widget Example</h1>
      <button
        onClick={() =>
          setType((prev) => (prev === "range" ? "single" : "range"))
        }
      >
        Type 토글 : ${type}
      </button>
      <section>
        <label>{type === "range" ? "From" : "Target"} : </label>
        <input
          type="number"
          value={from}
          onChange={(e) => setFrom(parseInt(e.target.value))}
        />
        {type === "range" && (
          <>
            <label>To : </label>
            <input
              type="number"
              value={to}
              onChange={(e) => setTo(parseInt(e.target.value))}
            />
          </>
        )}
      </section>

      <section>
        <button onClick={handleHighLight}>하이라이팅 버튼</button>
        <button onClick={() => handleRemoveHighlight("Single")}>
          단일 하이라이팅 제거 버튼
        </button>
        <button onClick={() => handleRemoveHighlight("Range")}>
          범위 하이라이팅 제거 버튼
        </button>
      </section>

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
          extensions={[javascript(), injectFieldExtension]}
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
