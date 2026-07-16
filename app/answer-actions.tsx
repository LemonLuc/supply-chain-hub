"use client";

import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { useId, type FormEvent } from "react";

export type FeedbackRating = "helpful" | "not-helpful";

export type AnswerFeedback = {
  rating: FeedbackRating;
  comment: string;
  formOpen: boolean;
  submitted: boolean;
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

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          type="button"
          aria-label="Mark answer as helpful"
          title="Helpful"
          aria-pressed={feedback?.rating === "helpful"}
          onClick={() => onSelectFeedback("helpful")}
        >
          <ThumbsUp aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Mark answer as not helpful"
          title="Not helpful"
          aria-pressed={feedback?.rating === "not-helpful"}
          onClick={() => onSelectFeedback("not-helpful")}
        >
          <ThumbsDown aria-hidden="true" />
        </button>
      </div>

      {feedback?.formOpen && (
        <form className="answer-feedback-form" aria-label="Answer feedback" onSubmit={submitFeedback}>
          <label htmlFor={feedbackFieldId}>Optional feedback</label>
          <textarea
            id={feedbackFieldId}
            aria-label="Optional feedback"
            value={feedback.comment}
            placeholder="What worked or could be improved?"
            onChange={(event) => onCommentChange(event.target.value)}
          />
          <div>
            <button type="submit">Submit feedback</button>
            <button type="button" onClick={onCancelFeedback}>Cancel feedback</button>
          </div>
        </form>
      )}

      {feedback?.submitted && (
        <p className="answer-feedback-status" role="status">Feedback received</p>
      )}
    </div>
  );
}
