import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { useCmeInjectClassName } from "./useCmeInjectClassName";

describe("useCmeInjectClassName", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("hook initialization", () => {
    it("should return required functions and extension", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      expect(result.current.addInject).toBeInstanceOf(Function);
      expect(result.current.removeInject).toBeInstanceOf(Function);
      expect(result.current.injectFieldExtension).toBeDefined();
    });

    it("should handle calls without editor gracefully", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      expect(() => {
        act(() => {
          result.current.addInject({
            type: "SINGLE",
            singleLineNumber: 1,
            className: "test-class",
          });
        });
      }).not.toThrow();
    });
  });

  describe("single line injection", () => {
    it("should inject className to a single line", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 2,
          className: "highlight-line",
        });
      });

      // Verify decoration was applied
      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      view.destroy();
    });

    it("should inject className with id attribute", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 1,
          className: "highlight",
          id: "line-1",
        });
      });

      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      view.destroy();
    });
  });

  describe("range injection", () => {
    it("should inject className to multiple lines", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "RANGE",
          range: { from: 2, to: 4 },
          className: "highlight-range",
        });
      });

      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      view.destroy();
    });

    it("should inject range with id attribute", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "RANGE",
          range: { from: 1, to: 3 },
          className: "highlight",
          id: "range-1-3",
        });
      });

      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      view.destroy();
    });
  });

  describe("remove injection", () => {
    it("should remove injections by className", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      // Add injection
      act(() => {
        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 1,
          className: "test-highlight",
        });
      });

      let decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      // Remove injection
      act(() => {
        hookWithView.current.removeInject({
          type: "className",
          content: "test-highlight",
        });
      });

      decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBe(0);

      view.destroy();
    });

    it("should remove injections by id", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      // Add injection with id
      act(() => {
        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 1,
          className: "highlight",
          id: "unique-line",
        });
      });

      let decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      // Remove by id
      act(() => {
        hookWithView.current.removeInject({
          type: "id",
          content: "unique-line",
        });
      });

      decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBe(0);

      view.destroy();
    });
  });

  describe("edge cases", () => {
    it("should ignore invalid line numbers", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 0, // Invalid: line numbers start at 1
          className: "test-class",
        });
      });

      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBe(0);

      view.destroy();
    });

    it("should ignore out of range line numbers", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "RANGE",
          range: { from: -1, to: 100 }, // Out of range
          className: "test-class",
        });
      });

      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBe(0);

      view.destroy();
    });
  });

  describe("multiple injections", () => {
    it("should handle multiple injections with different classNames", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      const state = EditorState.create({
        doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
        extensions: [result.current.injectFieldExtension],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      const { result: hookWithView } = renderHook(() =>
        useCmeInjectClassName(view)
      );

      act(() => {
        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 1,
          className: "class-1",
        });

        hookWithView.current.addInject({
          type: "SINGLE",
          singleLineNumber: 2,
          className: "class-2",
        });

        hookWithView.current.addInject({
          type: "RANGE",
          range: { from: 3, to: 4 },
          className: "class-3",
        });
      });

      const decorations = view.state.field(result.current.injectFieldExtension);
      expect(decorations.size).toBeGreaterThan(0);

      view.destroy();
    });
  });
});
