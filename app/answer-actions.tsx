"use client";

import { Check, Copy, ThumbsDown, ThumbsUp, X } from "lucide-react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";

export type FeedbackRating = "helpful" | "not-helpful";

export type AnswerFeedback = {
  rating: FeedbackRating;
  comment: string;
  formOpen: boolean;
  submitted: boolean;
  saved?: {
    rating: FeedbackRating;
    comment: string;
  };
};

type AnswerActionsProps = {
  copied: boolean;
  feedback: AnswerFeedback | undefined;
  onCopy: () => void;
  onSelectFeedback: (rating: FeedbackRating) => void;
  onCommentChange: (comment: string) => void;
  onSubmitFeedback: () => void;
  onCancelFeedback: () => void;
};

export function AnswerActions({
  copied,
  feedback,
  onCopy,
  onSelectFeedback,
  onCommentChange,
  onSubmitFeedback,
  onCancelFeedback,
}: AnswerActionsProps) {
  const feedbackFieldId = useId();
  const feedbackDialogId = useId();
  const helpfulButtonRef = useRef<HTMLButtonElement | null>(null);
  const notHelpfulButtonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [position, setPosition] = useState({ left: 12, top: 12, placement: "below" });

  const activeButton = useCallback(
    () => feedback?.rating === "not-helpful" ? notHelpfulButtonRef.current : helpfulButtonRef.current,
    [feedback?.rating],
  );

  const updatePosition = useCallback(() => {
    const anchor = activeButton();
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const margin = 12;
    const gap = 8;
    const width = popoverRect.width || Math.min(420, window.innerWidth - margin * 2);
    const height = popoverRect.height || 190;
    const fitsAbove = anchorRect.top - height - gap >= margin;
    const top = fitsAbove
      ? anchorRect.top - height - gap
      : Math.min(window.innerHeight - height - margin, anchorRect.bottom + gap);
    const left = Math.min(
      window.innerWidth - width - margin,
      Math.max(margin, anchorRect.left),
    );

    setPosition({ left, top: Math.max(margin, top), placement: fitsAbove ? "above" : "below" });
  }, [activeButton]);

  const dismissFeedback = useCallback(() => {
    const anchor = activeButton();
    anchor?.focus();
    onCancelFeedback();
  }, [activeButton, onCancelFeedback]);

  useLayoutEffect(() => {
    if (!feedback?.formOpen) return;

    updatePosition();
    textareaRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popoverRef.current?.contains(target)) return;
      if (helpfulButtonRef.current?.contains(target)) return;
      if (notHelpfulButtonRef.current?.contains(target)) return;
      dismissFeedback();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      dismissFeedback();
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [dismissFeedback, feedback?.formOpen, updatePosition]);

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    activeButton()?.focus();
    onSubmitFeedback();
  }

  return (
    <div className="answer-action-region">
      <div className="answer-actions" aria-label="Answer actions">
        <button
          type="button"
          aria-label={copied ? "Answer copied" : "Copy answer"}
          title={copied ? "Answer copied" : "Copy answer"}
          onClick={onCopy}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
        <button
          ref={helpfulButtonRef}
          type="button"
          aria-label="Mark answer as helpful"
          title="Helpful"
          aria-pressed={feedback?.rating === "helpful"}
          aria-expanded={feedback?.formOpen && feedback.rating === "helpful"}
          aria-controls={feedback?.formOpen ? feedbackDialogId : undefined}
          aria-haspopup="dialog"
          onClick={() => onSelectFeedback("helpful")}
        >
          <ThumbsUp aria-hidden="true" />
        </button>
        <button
          ref={notHelpfulButtonRef}
          type="button"
          aria-label="Mark answer as not helpful"
          title="Not helpful"
          aria-pressed={feedback?.rating === "not-helpful"}
          aria-expanded={feedback?.formOpen && feedback.rating === "not-helpful"}
          aria-controls={feedback?.formOpen ? feedbackDialogId : undefined}
          aria-haspopup="dialog"
          onClick={() => onSelectFeedback("not-helpful")}
        >
          <ThumbsDown aria-hidden="true" />
        </button>
      </div>

      {feedback?.formOpen && typeof document !== "undefined" && createPortal(
        <form
          ref={popoverRef}
          id={feedbackDialogId}
          className="answer-feedback-form"
          role="dialog"
          aria-label="Answer feedback"
          data-placement={position.placement}
          style={{ left: position.left, top: position.top }}
          onSubmit={submitFeedback}
        >
          <div className="answer-feedback-heading">
            <strong>{feedback.rating === "helpful" ? "Helpful answer" : "Answer needs work"}</strong>
            <button
              className="answer-feedback-close"
              type="button"
              aria-label="Close feedback"
              onClick={dismissFeedback}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <label htmlFor={feedbackFieldId}>Optional feedback</label>
          <textarea
            ref={textareaRef}
            id={feedbackFieldId}
            aria-label="Optional feedback"
            value={feedback.comment}
            placeholder="What worked or could be improved?"
            onChange={(event) => onCommentChange(event.target.value)}
          />
          <div className="answer-feedback-footer">
            <button type="submit">Submit feedback</button>
            <button type="button" onClick={dismissFeedback}>Cancel feedback</button>
          </div>
        </form>,
        document.querySelector(".app-shell") ?? document.body,
      )}

      {feedback?.submitted && (
        <p className="answer-feedback-status" role="status">Feedback received</p>
      )}
    </div>
  );
}
