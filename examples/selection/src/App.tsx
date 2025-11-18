import { useState, useRef } from "react";
import { useCmeSelection } from "@sung-yeop/codemirror-essentials-react";
import type { SelectionInfo } from "@sung-yeop/codemirror-essentials-react";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";

const initialCode = `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('CodeMirror');
console.log(message);

// Try selecting some text!
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);`;

function App() {
  const [code, setCode] = useState(initialCode);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(
    null
  );
  const viewRef = useRef<EditorView | null>(null);

  const { getSelection } = useCmeSelection(viewRef.current);

  // Update selection info helper
  const updateSelectionInfo = () => {
    const info = getSelection();
    setSelectionInfo(info);
  };

  const handleSelectLine = (lineNumber: number) => {
    if (!viewRef.current) return;

    const doc = viewRef.current.state.doc;
    if (lineNumber < 1 || lineNumber > doc.lines) return;

    const line = doc.line(lineNumber);
    viewRef.current.dispatch({
      selection: EditorSelection.single(line.from, line.to),
    });
    viewRef.current.focus();

    // Update selection info after selection change
    setTimeout(updateSelectionInfo, 0);
  };

  const handleSelectRange = (fromLine: number, toLine: number) => {
    if (!viewRef.current) return;

    const doc = viewRef.current.state.doc;
    if (
      fromLine < 1 ||
      toLine < 1 ||
      fromLine > doc.lines ||
      toLine > doc.lines ||
      fromLine > toLine
    ) {
      return;
    }

    const startLine = doc.line(fromLine);
    const endLine = doc.line(toLine);
    viewRef.current.dispatch({
      selection: EditorSelection.single(startLine.from, endLine.to),
    });
    viewRef.current.focus();

    // Update selection info after selection change
    setTimeout(updateSelectionInfo, 0);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>CodeMirror Essentials - Selection Example</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Try selecting text in the editor below to see the selection information
        update in real-time.
      </p>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Quick Selection Actions</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => handleSelectLine(1)}>
              Select Line 1 (function)
            </button>
            <button onClick={() => handleSelectLine(5)}>
              Select Line 5 (const message)
            </button>
            <button onClick={() => handleSelectRange(1, 3)}>
              Select Lines 1-3 (function body)
            </button>
            <button onClick={() => handleSelectRange(8, 9)}>
              Select Lines 8-9 (array code)
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <CodeMirror
          onCreateEditor={(view) => {
            viewRef.current = view;
            // Initialize selection info after editor is created
            setTimeout(updateSelectionInfo, 0);
          }}
          onUpdate={(viewUpdate) => {
            // Update selection info when selection changes
            if (viewUpdate.selectionSet) {
              updateSelectionInfo();
            }
          }}
          value={code}
          onChange={(value) => setCode(value)}
          extensions={[javascript()]}
          height="300px"
          className="editor"
        />
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "4px",
          border: "1px solid #ddd",
        }}
      >
        <h3>Selection Information</h3>
        {selectionInfo ? (
          <div style={{ fontFamily: "monospace" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <div>
                <strong>Has Selection:</strong>
              </div>
              <div
                style={{
                  color: selectionInfo.hasSelection ? "#22c55e" : "#ef4444",
                  fontWeight: "bold",
                }}
              >
                {selectionInfo.hasSelection ? "Yes ✓" : "No ✗"}
              </div>

              <div>
                <strong>From Position:</strong>
              </div>
              <div>{selectionInfo.from}</div>

              <div>
                <strong>To Position:</strong>
              </div>
              <div>{selectionInfo.to}</div>

              <div>
                <strong>From Line:</strong>
              </div>
              <div>{selectionInfo.fromLine}</div>

              <div>
                <strong>To Line:</strong>
              </div>
              <div>{selectionInfo.toLine}</div>

              <div>
                <strong>Selection Length:</strong>
              </div>
              <div>{selectionInfo.text.length} characters</div>
            </div>

            {selectionInfo.hasSelection && (
              <div>
                <strong>Selected Text:</strong>
                <pre
                  style={{
                    background: "#fff",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginTop: "8px",
                    maxHeight: "150px",
                    overflow: "auto",
                  }}
                >
                  {selectionInfo.text}
                </pre>
              </div>
            )}

            {!selectionInfo.hasSelection && (
              <div
                style={{
                  color: "#666",
                  fontStyle: "italic",
                  marginTop: "8px",
                }}
              >
                No text selected. Click and drag in the editor to select text.
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            Waiting for editor initialization...
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
        <h3>How to use:</h3>
        <ul>
          <li>Select text in the editor by clicking and dragging</li>
          <li>
            Use the quick selection buttons to programmatically select lines
          </li>
          <li>Watch the selection information update in real-time</li>
          <li>Try selecting single lines or multiple lines</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
