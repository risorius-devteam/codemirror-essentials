import { useRef, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { useCmeDiff } from "@codemirror-essentials/react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import "./styles.css";

const initialCode = `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('CodeMirror');
console.log(message);`;

function App() {
  const ref = useRef<EditorView | null>(null);
  const [code, setCode] = useState(initialCode);
  const [diffId, setDiffId] = useState(1);
  const [start, setStart] = useState<number>(1);
  const [end, setEnd] = useState<number>(1);
  const [greenTargetText, setGreenTargetText] = useState<string>("");

  const {
    handleDiff,
    removeDiffRedRange,
    diffWidgetExtension,
    injectFieldExtension,
  } = useCmeDiff(ref.current);

  const handle = () => {
    handleDiff({
      redRange: {
        from: start,
        to: end,
      },
      // redRangeTargetText를 생략하면 자동으로 from~to 라인의 내용을 추출
      greenRangeTargetText: greenTargetText,
      id: "10",
      above: true,
    });
  };

  return (
    <div className="container">
      <section>
        <label>Start</label>
        <input
          value={start}
          onChange={(e) => setStart(parseInt(e.target.value))}
          type="number"
        />
      </section>
      <section>
        <label>End</label>
        <input
          value={end}
          onChange={(e) => setEnd(parseInt(e.target.value))}
          type="number"
        />
      </section>
      <section>
        <input
          onChange={(e) => setGreenTargetText(e.target.value)}
          value={greenTargetText}
        />
      </section>
      <button onClick={handle}>Apply</button>
      <div className="editor-container">
        <CodeMirror
          onCreateEditor={(view) => (ref.current = view)}
          value={code}
          onChange={(value) => setCode(value)}
          extensions={[javascript(), diffWidgetExtension, injectFieldExtension]}
          className="editor"
          height="400px"
        />
      </div>
    </div>
  );
}

export default App;
