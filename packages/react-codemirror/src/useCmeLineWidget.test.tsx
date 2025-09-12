import React from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { act, renderHook } from "@testing-library/react";
import { describe } from "node:test";
import { beforeEach, expect, it, vi } from "vitest";
import { useCmeLineWidget } from "./useCmeLineWidget";

describe("useCmeLineWidget", () => {
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
    it("addLineWidget, removeLineWidget and lineWidgetExtension should be defined", () => {
      const { result } = renderHook(() => useCmeLineWidget(mockView));

      expect(result.current.addLineWidget).toBeInstanceOf(Function);
      expect(result.current.removeLineWidget).toBeInstanceOf(Function);
      expect(result.current.lineWidgetExtension).toBeDefined();
    });

    it("should handle null view gracefully", () => {
      const { result } = renderHook(() => useCmeLineWidget(null));
      const MockComponent = <div>Test Widget</div>;

      expect(() => {
        act(() => {
          result.current.addLineWidget({
            lineNumber: 1,
            component: MockComponent,
            id: "test-id-1",
          });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.removeLineWidget("test-id");
        });
      }).not.toThrow();
    });
  });

  describe("addLineWidget", () => {
    it("should dispatch effect when user called", () => {
      const { result } = renderHook(() => useCmeLineWidget(mockView));
      const MockComponent = <div>Test</div>;

      act(() => {
        result.current.addLineWidget({
          lineNumber: 1,
          component: MockComponent,
          id: "test-id-1",
        });
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual({
        lineNumber: 1,
        component: MockComponent,
        id: "test-id-1",
      });
    });

    it("should dispatch even with invalid line numbers (validation handled by CodeMirror", () => {
      const { result } = renderHook(() => useCmeLineWidget(mockView));
      const MockComponent = <div>Test</div>;

      act(() => {
        result.current.addLineWidget({
          lineNumber: 0,
          component: MockComponent,
          id: "test-id-1",
        });
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe("removeLineWidget", () => {
    it("should dispatch effect when user called", () => {
      const { result } = renderHook(() => useCmeLineWidget(mockView));

      act(() => {
        result.current.removeLineWidget("test-id-1");
      });

      const call = mockDispatch.mock.calls[0][0];
      expect(call).toHaveProperty("effects");
      expect(call.effects.value).toEqual("test-id-1");
    });
  });
});
