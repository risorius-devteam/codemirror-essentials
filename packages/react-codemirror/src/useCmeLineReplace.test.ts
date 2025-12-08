import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { act, renderHook } from "@testing-library/react";
import { describe, beforeEach, afterEach, expect, it } from "vitest";
import { useCmeLineReplace, ReviewInterface } from "./useCmeLineReplace";

describe("useCmeLineReplace", () => {
  let view: EditorView;
  let container: HTMLElement;

  const createViewWithExtension = (doc: string) => {
    const { result } = renderHook(() => useCmeLineReplace(null));

    const state = EditorState.create({
      doc,
      extensions: [result.current.reviewExtension],
    });

    return new EditorView({
      state,
      parent: container,
    });
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    container.remove();
  });

  describe("hook initialization", () => {
    it("should return all expected functions and extension", () => {
      const { result } = renderHook(() => useCmeLineReplace(null));

      expect(result.current.addReview).toBeInstanceOf(Function);
      expect(result.current.addReviews).toBeInstanceOf(Function);
      expect(result.current.removeReview).toBeInstanceOf(Function);
      expect(result.current.clearReviews).toBeInstanceOf(Function);
      expect(result.current.acceptReview).toBeInstanceOf(Function);
      expect(result.current.rejectReview).toBeInstanceOf(Function);
      expect(result.current.getReviewMetadata).toBeInstanceOf(Function);
      expect(result.current.reviewExtension).toBeDefined();
    });

    it("should handle null view gracefully", () => {
      const { result } = renderHook(() => useCmeLineReplace(null));

      expect(() => {
        act(() => {
          result.current.addReview({
            range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
            improvedText: "New Line 1",
            id: "test-1",
          });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.acceptReview("test-1");
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.rejectReview("test-1");
        });
      }).not.toThrow();

      expect(result.current.getReviewMetadata("test-1")).toBeUndefined();
    });
  });

  describe("addReview", () => {
    it("should add review with improved text", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "New Line 1",
        rangeClassName: "review-delete",
        improvedClassName: "review-new",
        id: "review-1",
      };

      act(() => {
        result.current.addReview(review);
      });

      // Force rerender to get updated view state
      rerender();

      // Check that the improved text was inserted
      const docText = view.state.doc.toString();
      expect(docText).toContain("New Line 1");
    });
  });

  describe("acceptReview", () => {
    it("should keep improved text and remove original text", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "New Line 1",
        rangeClassName: "review-delete",
        improvedClassName: "review-new",
        id: "review-1",
      };

      act(() => {
        result.current.addReview(review);
      });

      rerender();

      // Document should now have both original (hidden by widget) and improved text
      let docText = view.state.doc.toString();
      expect(docText).toContain("Line 1");
      expect(docText).toContain("New Line 1");

      act(() => {
        result.current.acceptReview("review-1");
      });

      rerender();

      // After accept: original text should be removed, improved text remains
      docText = view.state.doc.toString();
      expect(docText).toContain("New Line 1");
      // Original "Line 1\n" should be removed
      expect(docText.startsWith("New Line 1")).toBe(true);
    });

    it("should handle non-existent review id gracefully", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3");
      const { result } = renderHook(() => useCmeLineReplace(view));

      expect(() => {
        act(() => {
          result.current.acceptReview("non-existent-id");
        });
      }).not.toThrow();
    });
  });

  describe("rejectReview", () => {
    it("should remove improved text and restore original text", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "New Line 1",
        rangeClassName: "review-delete",
        improvedClassName: "review-new",
        id: "review-1",
      };

      act(() => {
        result.current.addReview(review);
      });

      rerender();

      // Document should now have both texts
      let docText = view.state.doc.toString();
      expect(docText).toContain("New Line 1");

      act(() => {
        result.current.rejectReview("review-1");
      });

      rerender();

      // After reject: improved text should be removed, original text remains
      docText = view.state.doc.toString();
      expect(docText).not.toContain("New Line 1");
      expect(docText).toContain("Line 1");
    });

    it("should handle non-existent review id gracefully", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3");
      const { result } = renderHook(() => useCmeLineReplace(view));

      expect(() => {
        act(() => {
          result.current.rejectReview("non-existent-id");
        });
      }).not.toThrow();
    });
  });

  describe("getReviewMetadata", () => {
    it("should return metadata for existing review", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "New Line 1",
        id: "review-1",
      };

      act(() => {
        result.current.addReview(review);
      });

      rerender();

      const metadata = result.current.getReviewMetadata("review-1");

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe("review-1");
      expect(metadata?.originalText).toBe("Line 1");
    });

    it("should return undefined for non-existent review", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3");
      const { result } = renderHook(() => useCmeLineReplace(view));

      const metadata = result.current.getReviewMetadata("non-existent");

      expect(metadata).toBeUndefined();
    });
  });

  describe("multiple reviews", () => {
    it("should handle multiple reviews correctly", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review1: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "New Line 1",
        id: "review-1",
      };

      const review2: ReviewInterface = {
        range: { from: 14, to: 20, fromLine: 3, toLine: 3 },
        improvedText: "New Line 3",
        id: "review-2",
      };

      act(() => {
        result.current.addReview(review1);
      });

      rerender();

      act(() => {
        result.current.addReview(review2);
      });

      rerender();

      // Both improved texts should be present
      let docText = view.state.doc.toString();
      expect(docText).toContain("New Line 1");
      expect(docText).toContain("New Line 3");

      // Accept first review
      act(() => {
        result.current.acceptReview("review-1");
      });

      rerender();

      docText = view.state.doc.toString();
      expect(docText).toContain("New Line 1");
      expect(docText).toContain("New Line 3");

      // Second review metadata should still be accessible
      const meta2 = result.current.getReviewMetadata("review-2");
      expect(meta2).toBeDefined();
    });

    it("should remove metadata after accepting review", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "Short",
        id: "review-1",
      };

      act(() => {
        result.current.addReview(review);
      });

      rerender();

      // After adding, metadata should exist
      const metaBefore = result.current.getReviewMetadata("review-1");
      expect(metaBefore).toBeDefined();

      // Accept the review
      act(() => {
        result.current.acceptReview("review-1");
      });

      rerender();

      // After accept, metadata should be removed
      const metaAfter = result.current.getReviewMetadata("review-1");
      expect(metaAfter).toBeUndefined();
    });

    it("should remove metadata after rejecting review", () => {
      view = createViewWithExtension("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      const { result, rerender } = renderHook(() => useCmeLineReplace(view));

      const review: ReviewInterface = {
        range: { from: 0, to: 6, fromLine: 1, toLine: 1 },
        improvedText: "Short",
        id: "review-1",
      };

      act(() => {
        result.current.addReview(review);
      });

      rerender();

      // After adding, metadata should exist
      const metaBefore = result.current.getReviewMetadata("review-1");
      expect(metaBefore).toBeDefined();

      // Reject the review
      act(() => {
        result.current.rejectReview("review-1");
      });

      rerender();

      // After reject, metadata should be removed
      const metaAfter = result.current.getReviewMetadata("review-1");
      expect(metaAfter).toBeUndefined();
    });
  });
});
