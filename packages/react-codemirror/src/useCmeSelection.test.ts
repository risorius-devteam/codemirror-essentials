import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { EditorView } from "@codemirror/view";
import { EditorState, EditorSelection } from "@codemirror/state";
import { useCmeSelection } from "./useCmeSelection";

describe("useCmeSelection", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("hook initialization", () => {
    it("should return getSelection function", () => {
      const { result } = renderHook(() => useCmeSelection(null));

      expect(result.current.getSelection).toBeInstanceOf(Function);
    });

    it("should handle null view gracefully", () => {
      const { result } = renderHook(() => useCmeSelection(null));

      const selectionInfo = result.current.getSelection();
      expect(selectionInfo).toBeNull();
    });
  });

  describe("selection info", () => {
    it("should return selection info when no text is selected", () => {
      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(0);
      expect(selectionInfo?.to).toBe(0);
      expect(selectionInfo?.fromLine).toBe(1);
      expect(selectionInfo?.toLine).toBe(1);
      expect(selectionInfo?.text).toBe("");
      expect(selectionInfo?.hasSelection).toBe(false);

      view.destroy();
    });

    it("should return correct info for single line selection", () => {
      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
        selection: EditorSelection.single(7, 13), // "Line 2" text
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(7);
      expect(selectionInfo?.to).toBe(13);
      expect(selectionInfo?.fromLine).toBe(2);
      expect(selectionInfo?.toLine).toBe(2);
      expect(selectionInfo?.text).toBe("Line 2");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });

    it("should return correct info for multi-line selection", () => {
      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
        selection: EditorSelection.single(7, 20), // "Line 2\nLine 3"
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(7);
      expect(selectionInfo?.to).toBe(20);
      expect(selectionInfo?.fromLine).toBe(2);
      expect(selectionInfo?.toLine).toBe(3);
      expect(selectionInfo?.text).toBe("Line 2\nLine 3");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });

    it("should handle selection at document start", () => {
      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        selection: EditorSelection.single(0, 6), // "Line 1"
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(0);
      expect(selectionInfo?.to).toBe(6);
      expect(selectionInfo?.fromLine).toBe(1);
      expect(selectionInfo?.toLine).toBe(1);
      expect(selectionInfo?.text).toBe("Line 1");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });

    it("should handle selection at document end", () => {
      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        selection: EditorSelection.single(14, 20), // "Line 3"
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(14);
      expect(selectionInfo?.to).toBe(20);
      expect(selectionInfo?.fromLine).toBe(3);
      expect(selectionInfo?.toLine).toBe(3);
      expect(selectionInfo?.text).toBe("Line 3");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });

    it("should handle partial line selection", () => {
      const state = EditorState.create({
        doc: "Hello World\nFoo Bar\nBaz Qux",
        selection: EditorSelection.single(6, 11), // "World"
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(6);
      expect(selectionInfo?.to).toBe(11);
      expect(selectionInfo?.fromLine).toBe(1);
      expect(selectionInfo?.toLine).toBe(1);
      expect(selectionInfo?.text).toBe("World");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });

    it("should handle entire document selection", () => {
      const docText = "Line 1\nLine 2\nLine 3";
      const state = EditorState.create({
        doc: docText,
        selection: EditorSelection.single(0, docText.length),
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(0);
      expect(selectionInfo?.to).toBe(docText.length);
      expect(selectionInfo?.fromLine).toBe(1);
      expect(selectionInfo?.toLine).toBe(3);
      expect(selectionInfo?.text).toBe(docText);
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });
  });

  describe("edge cases", () => {
    it("should handle empty document", () => {
      const state = EditorState.create({
        doc: "",
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.from).toBe(0);
      expect(selectionInfo?.to).toBe(0);
      expect(selectionInfo?.fromLine).toBe(1);
      expect(selectionInfo?.toLine).toBe(1);
      expect(selectionInfo?.text).toBe("");
      expect(selectionInfo?.hasSelection).toBe(false);

      view.destroy();
    });

    it("should handle single line document", () => {
      const state = EditorState.create({
        doc: "Single line",
        selection: EditorSelection.single(0, 11),
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      const selectionInfo = result.current.getSelection();

      expect(selectionInfo).not.toBeNull();
      expect(selectionInfo?.fromLine).toBe(1);
      expect(selectionInfo?.toLine).toBe(1);
      expect(selectionInfo?.text).toBe("Single line");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });

    it("should return updated selection info after selection change", () => {
      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result } = renderHook(() => useCmeSelection(view));

      // Initial selection
      let selectionInfo = result.current.getSelection();
      expect(selectionInfo?.hasSelection).toBe(false);

      // Change selection
      view.dispatch({
        selection: EditorSelection.single(0, 6), // Select "Line 1"
      });

      // Get updated selection
      selectionInfo = result.current.getSelection();
      expect(selectionInfo?.from).toBe(0);
      expect(selectionInfo?.to).toBe(6);
      expect(selectionInfo?.text).toBe("Line 1");
      expect(selectionInfo?.hasSelection).toBe(true);

      view.destroy();
    });
  });
});
