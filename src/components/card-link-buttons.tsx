import { FileText, GitPullRequest } from "lucide-react";
import type { Card, CardLinkKind } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type CardLinkButtonsProps = {
  card: Card;
  onEditLink: (card: Card, kind: CardLinkKind) => void;
  onOpenDetails: (card: Card) => void;
};

export function CardLinkButtons({
  card,
  onEditLink,
  onOpenDetails,
}: CardLinkButtonsProps) {
  const hasDetails = Boolean(card.details.trim()) || Object.keys(card.images).length > 0;

  return (
    <div onPointerDown={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpenDetails(card);
        }}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label={`Details for ${card.title}`}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-1.5 border-t border-border text-xs font-semibold tracking-wide transition-[background-color,color] duration-150",
          hasDetails
            ? "bg-bg text-fg hover:bg-surface-hover"
            : "text-muted hover:bg-bg hover:text-fg",
        )}
      >
        <FileText className="size-3.5" />
        Details
        {hasDetails ? (
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        ) : null}
      </button>
      <div className="grid grid-cols-2 border-t border-border">
        <LinkButton
          kind="jira"
          href={card.jiraUrl}
          label="Jira"
          onAdd={() => onEditLink(card, "jira")}
        />
        <LinkButton
          kind="pr"
          href={card.prUrl}
          label="PR"
          icon={<GitPullRequest className="size-3.5" />}
          onAdd={() => onEditLink(card, "pr")}
          divided
        />
      </div>
    </div>
  );
}

function LinkButton({
  kind,
  href,
  label,
  icon,
  onAdd,
  divided,
}: {
  kind: CardLinkKind;
  href: string;
  label: string;
  icon?: React.ReactNode;
  onAdd: () => void;
  divided?: boolean;
}) {
  const linked = Boolean(href);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!linked) {
      onAdd();
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
      aria-label={linked ? `Open ${label}` : `Add ${label} link`}
      title={linked ? href : `Add ${label} link`}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1.5 text-xs font-semibold tracking-wide transition-[background-color,color] duration-150",
        divided && "border-l border-border",
        kind === "jira" &&
          (linked
            ? "bg-jira text-jira-fg hover:bg-jira/90"
            : "bg-transparent text-jira hover:bg-jira/15"),
        kind === "pr" &&
          (linked
            ? "bg-surface-hover text-fg"
            : "bg-transparent text-subtle hover:bg-bg hover:text-fg"),
      )}
    >
      {icon}
      {label}
    </button>
  );
}
