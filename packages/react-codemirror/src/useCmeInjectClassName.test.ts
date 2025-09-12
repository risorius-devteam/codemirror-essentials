import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { useCmeInjectClassName } from "./useCmeInjectClassName";

describe("useCmeInjectClassName", () => {
  let mockView: EditorView;
  let mockDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = vi.fn();

    const state = EditorState.create({
      doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
    });

    mockView = {
      state,
      dispatch: mockDispatch,
    } as unknown as EditorView;
  });

  describe("hook initialization", () => {
    it("should return addInject, removeInject functions and injectFieldExtension", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      expect(result.current.addInject).toBeInstanceOf(Function);
      expect(result.current.removeInject).toBeInstanceOf(Function);
      expect(result.current.injectFieldExtension).toBeDefined();
    });

    it("should handle null view gracefully", () => {
      const { result } = renderHook(() => useCmeInjectClassName(null));

      expect(() => {
        act(() => {
          result.current.addInject({
            type: "single",
            singleLineNumber: 1,
            className: "test-class",
          });
        });
      }).not.toThrow();

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("addInject", () => {
    it("should dispatch effect for single line injection", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "single",
          singleLineNumber: 2,
          className: "highlight-line",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        type: "single",
        singleLineNumber: 2,
        className: "highlight-line",
      });
    });

    it("should dispatch effect for single line injection with id", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "single",
          singleLineNumber: 3,
          className: "highlight-line",
          id: "line-3",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        type: "single",
        singleLineNumber: 3,
        className: "highlight-line",
        id: "line-3",
      });
    });

    it("should dispatch effect for range injection", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "range",
          range: { from: 2, to: 4 },
          className: "highlight-range",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        type: "range",
        range: { from: 2, to: 4 },
        className: "highlight-range",
      });
    });

    it("should dispatch effect for range injection with id", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "range",
          range: { from: 1, to: 3 },
          className: "highlight-range",
          id: "range-1-3",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        type: "range",
        range: { from: 1, to: 3 },
        className: "highlight-range",
        id: "range-1-3",
      });
    });
  });

  describe("removeInject", () => {
    it("should dispatch effect to remove by className", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.removeInject({
          type: "className",
          content: "highlight-line",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        type: "className",
        content: "highlight-line",
      });
    });

    it("should dispatch effect to remove by id", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.removeInject({
          type: "id",
          content: "line-3",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        type: "id",
        content: "line-3",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle invalid line numbers for single line", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "single",
          singleLineNumber: 0,
          className: "test-class",
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("should handle invalid line numbers for range", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "range",
          range: { from: -1, to: 100 },
          className: "test-class",
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("should handle missing range for range type", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "range",
          // range is missing
          className: "test-class",
        } as Parameters<typeof result.current.addInject>[0]);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("should handle missing singleLineNumber for single type", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      act(() => {
        result.current.addInject({
          type: "single",
          // singleLineNumber is missing
          className: "test-class",
        } as Parameters<typeof result.current.addInject>[0]);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe("view updates", () => {
    it("should update callbacks when view changes", () => {
      const { result, rerender } = renderHook(
        ({ view }) => useCmeInjectClassName(view),
        {
          initialProps: { view: mockView },
        }
      );

      const initialAddInject = result.current.addInject;
      const initialRemoveInject = result.current.removeInject;

      const newMockView = {
        state: EditorState.create({ doc: "New content" }),
        dispatch: vi.fn(),
      } as unknown as EditorView;

      rerender({ view: newMockView });

      expect(result.current.addInject).not.toBe(initialAddInject);
      expect(result.current.removeInject).not.toBe(initialRemoveInject);
    });
  });

  describe("extension integration", () => {
    it("should return a valid StateField extension", () => {
      const { result } = renderHook(() => useCmeInjectClassName(mockView));

      expect(result.current.injectFieldExtension).toBeDefined();
      expect(typeof result.current.injectFieldExtension).toBe("object");
    });

    it("should work with real EditorView when extension is applied", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      try {
        const { result } = renderHook(() => useCmeInjectClassName(null));

        const state = EditorState.create({
          doc: "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
          extensions: [result.current.injectFieldExtension],
        });

        const realView = new EditorView({
          state,
          parent: container,
        });

        const { result: realResult } = renderHook(() =>
          useCmeInjectClassName(realView)
        );

        expect(() => {
          realResult.current.addInject({
            type: "single",
            singleLineNumber: 1,
            className: "test-class",
          });
        }).not.toThrow();

        expect(() => {
          realResult.current.removeInject({
            type: "className",
            content: "test-class",
          });
        }).not.toThrow();

        realView.destroy();
      } finally {
        document.body.removeChild(container);
      }
    });
  });
});
