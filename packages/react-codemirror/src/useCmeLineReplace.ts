import { useCallback } from "react";
import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { StateField, StateEffect, Range, ChangeSpec } from "@codemirror/state";

/**
 * Range information in the editor
 */
export interface RangeInterface {
  /** Starting position (character offset) */
  from: number;
  /** Ending position (character offset) */
  to: number;
  /** Starting line number (1-indexed) */
  fromLine: number;
  /** Ending line number (1-indexed) */
  toLine: number;
}

/**
 * Review/diff information
 */
export interface ReviewInterface {
  /** Range to highlight (original code) */
  range: RangeInterface;
  /** Improved text to insert below the range */
  improvedText: string;
  /** CSS class name for the range highlight */
  rangeClassName?: string;
  /** CSS class name for the improved text highlight */
  improvedClassName?: string;
  /** Optional unique identifier */
  id?: string;
}

/**
 * Internal metadata for tracking inserted text
 */
interface ReviewMetadata {
  id: string;
  rangeFrom: number;
  rangeTo: number;
  originalText: string;
  insertedFrom: number;
  insertedTo: number;
  rangeClassName?: string;
  improvedClassName?: string;
}

const addReviewMetadataEffect = StateEffect.define<ReviewMetadata>();
const removeReviewEffect = StateEffect.define<string>();
const clearReviewsEffect = StateEffect.define<void>();

/**
 * Widget to display original code as a block (without line numbers)
 */
class OriginalCodeWidget extends WidgetType {
  public id: string;

  constructor(
    private code: string,
    private className: string | undefined,
    id: string
  ) {
    super();
    this.id = id;
  }

  toDOM() {
    const container = document.createElement("div");
    if (this.className) {
      container.className = this.className;
    }
    container.setAttribute("data-review-id", this.id);
    container.style.whiteSpace = "pre-wrap";

    // Split by lines and render each line
    const lines = this.code.split("\n");
    lines.forEach((line) => {
      const lineDiv = document.createElement("div");
      lineDiv.textContent = line || " "; // Preserve empty lines
      container.appendChild(lineDiv);
    });

    return container;
  }

  eq(other: OriginalCodeWidget) {
    return (
      this.code === other.code &&
      this.className === other.className &&
      this.id === other.id
    );
  }

  ignoreEvent() {
    return false;
  }
}

/**
 * StateField to manage review metadata and decorations
 */
const reviewField = StateField.define<{
  decorations: DecorationSet;
  metadata: ReviewMetadata[];
}>({
  create() {
    return {
      decorations: Decoration.none,
      metadata: [],
    };
  },

  update(state, tr) {
    let decorations = state.decorations.map(tr.changes);
    let metadata = [...state.metadata];

    // Update metadata positions based on document changes
    if (tr.docChanged) {
      metadata = metadata.map((meta) => ({
        ...meta,
        rangeFrom: tr.changes.mapPos(meta.rangeFrom),
        rangeTo: tr.changes.mapPos(meta.rangeTo),
        insertedFrom: tr.changes.mapPos(meta.insertedFrom),
        insertedTo: tr.changes.mapPos(meta.insertedTo),
      }));
    }

    for (const effect of tr.effects) {
      // Add review metadata and decorations
      if (effect.is(addReviewMetadataEffect)) {
        const meta = effect.value;
        metadata.push(meta);

        const newDecorations: Range<Decoration>[] = [];

        // 1. Replace decoration for the original range (creates a block without line numbers)
        if (meta.rangeClassName) {
          const widget = new OriginalCodeWidget(
            meta.originalText,
            meta.rangeClassName,
            meta.id
          );
          const replaceDecoration = Decoration.replace({
            widget,
            block: true,
          });
          newDecorations.push(
            replaceDecoration.range(meta.rangeFrom, meta.rangeTo)
          );
        }

        // 2. Decoration for the improved text
        if (meta.improvedClassName) {
          const improvedDecoration = Decoration.mark({
            class: meta.improvedClassName,
            attributes: { "data-review-id": meta.id },
          });
          newDecorations.push(
            improvedDecoration.range(meta.insertedFrom, meta.insertedTo)
          );
        }

        decorations = decorations.update({
          add: newDecorations,
        });
      }

      // Remove specific review
      if (effect.is(removeReviewEffect)) {
        const id = effect.value;
        const meta = metadata.find((m) => m.id === id);

        if (meta) {
          // Remove decorations
          decorations = decorations.update({
            filter: (_from, _to, decoration) => {
              // Check widget decoration
              const widget = decoration.spec.widget as OriginalCodeWidget;
              if (widget?.id === id) {
                return false;
              }
              // Check mark decoration
              if (decoration.spec.attributes?.["data-review-id"] === id) {
                return false;
              }
              return true;
            },
          });

          // Remove metadata
          metadata = metadata.filter((m) => m.id !== id);
        }
      }

      // Clear all reviews
      if (effect.is(clearReviewsEffect)) {
        decorations = Decoration.none;
        metadata = [];
      }
    }

    return {
      decorations,
      metadata,
    };
  },

  provide: (f) => EditorView.decorations.from(f, (state) => state.decorations),
});

/**
 * Hook to manage diff/review with actual text insertion in CodeMirror editor
 *
 * @param view - CodeMirror EditorView instance
 * @returns Object containing review management functions
 *
 * @example
 * ```tsx
 * const { addReview, removeReview, clearReviews, reviewExtension } = useCmeLineReplace(editorView);
 *
 * // Add a review with actual text insertion
 * addReview({
 *   range: { from: 0, to: 10, fromLine: 1, toLine: 1 },
 *   improvedText: "const x = 10;",
 *   rangeClassName: "review-delete",
 *   improvedClassName: "review-add",
 *   id: "review-1"
 * });
 *
 * // Remove a specific review (decorations only, text remains)
 * removeReview("review-1");
 *
 * // Clear all reviews (decorations only, text remains)
 * clearReviews();
 * ```
 */
export const useCmeLineReplace = (view: EditorView | null) => {
  /**
   * Add a review with actual text insertion
   */
  const addReview = useCallback(
    (review: ReviewInterface) => {
      if (!view) return;

      const {
        range,
        improvedText,
        rangeClassName,
        improvedClassName,
        id = `review-${Date.now()}`,
      } = review;

      // Get the line object for toLine
      const doc = view.state.doc;
      const toLineObj = doc.line(range.toLine);
      const insertPos = toLineObj.to;

      // Extract original text for the widget
      const originalText = doc.sliceString(range.from, range.to);

      // Prepare the text to insert (newline + improved text)
      const textToInsert = "\n" + improvedText;

      // Calculate positions for metadata
      const insertedFrom = insertPos + 1; // +1 for the newline
      const insertedTo = insertPos + textToInsert.length;

      // Create change spec
      const changes: ChangeSpec = {
        from: insertPos,
        insert: textToInsert,
      };

      // Create metadata
      const metadata: ReviewMetadata = {
        id,
        rangeFrom: range.from,
        rangeTo: range.to,
        originalText,
        insertedFrom,
        insertedTo,
        rangeClassName,
        improvedClassName,
      };

      // Dispatch with both changes and effects
      view.dispatch({
        changes,
        effects: addReviewMetadataEffect.of(metadata),
      });
    },
    [view]
  );

  /**
   * Add multiple reviews at once
   */
  const addReviews = useCallback(
    (reviews: ReviewInterface[]) => {
      if (!view) return;

      const doc = view.state.doc;
      const changes: ChangeSpec[] = [];
      const effects: StateEffect<ReviewMetadata>[] = [];

      let accumulatedOffset = 0;

      reviews.forEach((review) => {
        const {
          range,
          improvedText,
          rangeClassName,
          improvedClassName,
          id = `review-${Date.now()}-${Math.random()}`,
        } = review;

        const toLineObj = doc.line(range.toLine);
        const insertPos = toLineObj.to + accumulatedOffset;

        // Extract original text for the widget
        const originalText = doc.sliceString(range.from, range.to);

        const textToInsert = "\n" + improvedText;

        const insertedFrom = insertPos + 1;
        const insertedTo = insertPos + textToInsert.length;

        changes.push({
          from: insertPos,
          insert: textToInsert,
        });

        const metadata: ReviewMetadata = {
          id,
          rangeFrom: range.from + accumulatedOffset,
          rangeTo: range.to + accumulatedOffset,
          originalText,
          insertedFrom,
          insertedTo,
          rangeClassName,
          improvedClassName,
        };

        effects.push(addReviewMetadataEffect.of(metadata));

        accumulatedOffset += textToInsert.length;
      });

      view.dispatch({
        changes,
        effects,
      });
    },
    [view]
  );

  /**
   * Remove a specific review by ID (decorations only, inserted text remains)
   */
  const removeReview = useCallback(
    (id: string) => {
      if (!view) return;

      view.dispatch({
        effects: removeReviewEffect.of(id),
      });
    },
    [view]
  );

  /**
   * Clear all reviews (decorations only, inserted text remains)
   */
  const clearReviews = useCallback(() => {
    if (!view) return;

    view.dispatch({
      effects: clearReviewsEffect.of(),
    });
  }, [view]);

  /**
   * Get review metadata by ID
   */
  const getReviewMetadata = useCallback(
    (id: string): ReviewMetadata | undefined => {
      if (!view) return undefined;

      const state = view.state.field(reviewField);
      return state.metadata.find((m) => m.id === id);
    },
    [view]
  );

  /**
   * Accept a review: keep the improved text (green), remove the original text (red widget)
   * This deletes the original text range and removes all decorations
   */
  const acceptReview = useCallback(
    (id: string) => {
      if (!view) return;

      const meta = getReviewMetadata(id);
      if (!meta) return;

      // Delete the original text range (rangeFrom ~ rangeTo + newline after)
      // The improved text remains in the document
      view.dispatch({
        changes: { from: meta.rangeFrom, to: meta.rangeTo + 1, insert: "" },
        effects: removeReviewEffect.of(id),
      });
    },
    [view, getReviewMetadata]
  );

  /**
   * Reject a review: remove the improved text (green), restore the original text (red)
   * This deletes the inserted text range and removes decorations (original text is restored automatically)
   */
  const rejectReview = useCallback(
    (id: string) => {
      if (!view) return;

      const meta = getReviewMetadata(id);
      if (!meta) return;

      // Delete the inserted text range including the leading newline
      // The original text is automatically restored when the widget decoration is removed
      view.dispatch({
        changes: { from: meta.insertedFrom - 1, to: meta.insertedTo, insert: "" },
        effects: removeReviewEffect.of(id),
      });
    },
    [view, getReviewMetadata]
  );

  return {
    addReview,
    addReviews,
    removeReview,
    clearReviews,
    acceptReview,
    rejectReview,
    getReviewMetadata,
    reviewExtension: reviewField,
  };
};
