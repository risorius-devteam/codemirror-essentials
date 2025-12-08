import { useState, useRef } from "react";
import {
  useCmeLineReplace,
  useCmeSelection,
} from "@sung-yeop/codemirror-essentials-react";
import type { ReviewInterface } from "@sung-yeop/codemirror-essentials-react";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";

const initialCode = `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 10);
console.log(result);

// Old function with issues
function oldMultiply(x, y) {
  var result = x * y;
  return result;
}

const product = oldMultiply(3, 4);
console.log(product);`;

// Sample reviews to demonstrate diff/review functionality
const sampleReviews: ReviewInterface[] = [
  {
    range: { from: 0, to: 47, fromLine: 1, toLine: 3 },
    improvedText: `/**
 * Calculate the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function calculateSum(a, b) {
  return a + b;
}`,
    rangeClassName: "review-old",
    improvedClassName: "review-new",
    id: "review-1",
  },
  {
    range: { from: 114, to: 185, fromLine: 9, toLine: 12 },
    improvedText: `// Modern function with arrow syntax and const
const modernMultiply = (x, y) => x * y;`,
    rangeClassName: "review-old",
    improvedClassName: "review-new",
    id: "review-2",
  },
];

function App() {
  const [code, setCode] = useState(initialCode);
  const [activeReviews, setActiveReviews] = useState<string[]>([]);
  const viewRef = useRef<EditorView | null>(null);

  const {
    addReview,
    addReviews,
    removeReview,
    clearReviews,
    acceptReview,
    rejectReview,
    reviewExtension,
  } = useCmeLineReplace(viewRef.current);
  const { getSelection } = useCmeSelection(viewRef.current);

  const handleApplySampleReviews = () => {
    addReviews(sampleReviews);
    setActiveReviews(sampleReviews.map((r) => r.id || ""));
  };

  const handleClearReviews = () => {
    clearReviews();
    setActiveReviews([]);
  };

  const handleRemoveReview = (id: string) => {
    removeReview(id);
    setActiveReviews((prev) => prev.filter((reviewId) => reviewId !== id));
  };

  const handleAcceptReview = (id: string) => {
    acceptReview(id);
    setActiveReviews((prev) => prev.filter((reviewId) => reviewId !== id));
  };

  const handleRejectReview = (id: string) => {
    rejectReview(id);
    setActiveReviews((prev) => prev.filter((reviewId) => reviewId !== id));
  };

  const handleAddReviewFromSelection = () => {
    const selection = getSelection();
    if (!selection?.hasSelection) {
      alert("Please select some text first!");
      return;
    }

    const improvedText = prompt("Enter improved code:");
    if (!improvedText) return;

    const newReview: ReviewInterface = {
      range: {
        from: selection.from,
        to: selection.to,
        fromLine: selection.fromLine,
        toLine: selection.toLine,
      },
      improvedText,
      rangeClassName: "review-old",
      improvedClassName: "review-new",
      id: `review-${Date.now()}`,
    };

    addReview(newReview);
    setActiveReviews((prev) => [...prev, newReview.id || ""]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <style>{`
        /* Original code (to be replaced) - red background */
        .review-old {
          background-color: rgba(255, 100, 100, 0.15);
          border-left: 3px solid #ff6666;
          padding-left: 4px;
        }

        /* Improved code (replacement) - green background */
        .review-new {
          background-color: rgba(100, 255, 100, 0.15);
          border-left: 3px solid #66ff66;
          padding-left: 4px;
        }

        /* Custom button styles */
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .btn:hover {
          opacity: 0.8;
        }

        .btn-primary {
          background-color: #4CAF50;
          color: white;
        }

        .btn-danger {
          background-color: #f44336;
          color: white;
        }

        .btn-info {
          background-color: #2196F3;
          color: white;
        }

        .review-card {
          background: white;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .review-info {
          flex: 1;
        }

        .review-line {
          font-family: monospace;
          fontSize: 14px;
          margin-bottom: 4px;
        }

        .review-meta {
          font-size: 12px;
          color: #666;
        }
      `}</style>

      <h1>CodeMirror Essentials - Line Replace (Diff/Review) Example</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        This example demonstrates <code>useCmeLineReplace</code> with actual
        text insertion. Original code is highlighted in{" "}
        <span
          style={{
            background: "rgba(255, 100, 100, 0.15)",
            padding: "2px 4px",
            borderRadius: "2px",
          }}
        >
          red
        </span>
        , and improved code is inserted below with{" "}
        <span
          style={{
            background: "rgba(100, 255, 100, 0.15)",
            padding: "2px 4px",
            borderRadius: "2px",
          }}
        >
          green
        </span>{" "}
        highlight.
      </p>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Quick Actions</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleApplySampleReviews}
              className="btn btn-primary"
            >
              📝 Apply Sample Reviews
            </button>
            <button onClick={handleClearReviews} className="btn btn-danger">
              🗑️ Clear All Reviews
            </button>
            <button
              onClick={handleAddReviewFromSelection}
              className="btn btn-info"
            >
              ➕ Add Review from Selection
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
          }}
          value={code}
          onChange={(value) => setCode(value)}
          extensions={[javascript(), reviewExtension]}
          height="500px"
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
        <h3>Active Reviews ({activeReviews.length})</h3>
        {activeReviews.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {sampleReviews
              .filter((review) => activeReviews.includes(review.id || ""))
              .map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-info">
                    <div className="review-line">
                      <strong>
                        Lines {review.range.fromLine}-{review.range.toLine}
                      </strong>
                    </div>
                    <div className="review-meta">
                      Range: {review.range.from} - {review.range.to} | ID:{" "}
                      {review.id}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#28a745",
                      }}
                    >
                      Improved text inserted with{" "}
                      <code>{review.improvedClassName}</code> class
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => handleAcceptReview(review.id || "")}
                        className="btn btn-primary"
                        style={{ padding: "4px 12px", fontSize: "12px" }}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id || "")}
                        className="btn btn-danger"
                        style={{ padding: "4px 12px", fontSize: "12px" }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveReview(review.id || "")}
                      className="btn btn-info"
                      style={{ padding: "4px 12px", fontSize: "12px" }}
                    >
                      Remove (decoration only)
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            No active reviews. Click "Apply Sample Reviews" or add your own!
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
        <h3>How to use:</h3>
        <ul>
          <li>
            Click <strong>"Apply Sample Reviews"</strong> to insert improved
            code below the original
          </li>
          <li>
            <span style={{ color: "#ff6666" }}>Red highlights</span> show
            original code (will be replaced)
          </li>
          <li>
            <span style={{ color: "#66ff66" }}>Green highlights</span> show
            improved code (actual text inserted below)
          </li>
          <li>
            Select any text and click{" "}
            <strong>"Add Review from Selection"</strong> to add your own
          </li>
        </ul>

        <h3 style={{ marginTop: "20px" }}>Accept / Reject / Remove:</h3>
        <ul>
          <li>
            <strong style={{ color: "#4CAF50" }}>Accept</strong>: Keeps the improved text (green), removes the original text (red)
          </li>
          <li>
            <strong style={{ color: "#f44336" }}>Reject</strong>: Removes the improved text (green), restores the original text (red)
          </li>
          <li>
            <strong style={{ color: "#2196F3" }}>Remove</strong>: Only removes highlights/decorations, keeps all text as-is
          </li>
        </ul>

        <h3 style={{ marginTop: "20px" }}>Sample Reviews:</h3>
        <ol>
          <li>
            <strong>Lines 1-3 (calculateSum):</strong> Adds JSDoc documentation
            with parameter and return type descriptions
          </li>
          <li>
            <strong>Lines 9-12 (oldMultiply):</strong> Modernizes to arrow
            function with const
          </li>
        </ol>

        <h3 style={{ marginTop: "20px" }}>Customization:</h3>
        <p>
          You can customize the highlight colors by modifying the CSS classes:
        </p>
        <ul>
          <li>
            <code>.review-old</code> - Original code style (default: red)
          </li>
          <li>
            <code>.review-new</code> - Improved code style (default: green)
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
