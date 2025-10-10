import { useEffect, useRef, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import {
  InjectEffectType,
  useCmeInjectClassName,
} from "@codemirror-essentials/react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";

const initialCode = `function greet(name) {
  return \`Hello, \${name}!\`
}

const message = greet('CodeMirror')
console.log(message)`;

function App() {
  const [code, setCode] = useState(initialCode);
  const [type, setType] = useState<InjectEffectType>("RANGE");
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(1);
  const ref = useRef<EditorView | null>(null);

  const { addInject, removeInject, injectFieldExtension } =
    useCmeInjectClassName(ref.current);

  useEffect(() => {
    console.log("from : ", from);
    console.log("to : ", to);
  }, [from, to]);

  const handleHighLight = () => {
    if (type === "RANGE") {
      addInject({
        type: "RANGE",
        range: {
          from,
          to,
        },
        className: "Inject-Range-HighLight-Test",
      });
    }

    if (type === "SINGLE") {
      addInject({
        type: "SINGLE",
        singleLineNumber: from,
        className: "Inject-Single-HighLight-Test",
      });
    }
  };

  const handleRemoveHighlight = (type: "RANGE" | "SINGLE") => {
    if (type === "RANGE")
      removeInject({
        type: "className",
        content: "Inject-Range-HighLight-Test",
      });

    if (type === "SINGLE")
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
          setType((prev) => (prev === "RANGE" ? "SINGLE" : "RANGE"))
        }
      >
        Type 토글 : ${type}
      </button>
      <section>
        <label>{type === "RANGE" ? "From" : "Target"} : </label>
        <input
          type="number"
          value={from}
          onChange={(e) => setFrom(parseInt(e.target.value))}
        />
        {type === "RANGE" && (
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
        <button onClick={() => handleRemoveHighlight("SINGLE")}>
          단일 하이라이팅 제거 버튼
        </button>
        <button onClick={() => handleRemoveHighlight("RANGE")}>
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
          onCreateEditor={(view) => (ref.current = view)}
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
