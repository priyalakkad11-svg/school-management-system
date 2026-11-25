"use client";

import React from "react";
import { Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import type { PortalRole } from "@/lib/routes";
import type { MessageThread } from "@/types/domain";
import { cn } from "@/lib/utils";

export function InboxView({
  role,
  title,
  subtitle,
  initialThreads,
}: {
  role: PortalRole;
  title: string;
  subtitle?: string;
  initialThreads: MessageThread[];
}) {
  const { showToast } = useToast();
  const [threads, setThreads] = React.useState(initialThreads);
  const [selectedId, setSelectedId] = React.useState(initialThreads[0]?.id ?? "");
  const [replyText, setReplyText] = React.useState("");

  const activeThread = threads.find((t) => t.id === selectedId) ?? threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = replyText.trim();
    if (!clean || !activeThread) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              preview: clean,
              time: "Just now",
              unread: false,
              messages: [...t.messages, { sender: "You", text: clean, time: "Just now", self: true }],
            }
          : t,
      ),
    );
    setReplyText("");
    showToast(`Reply sent to ${activeThread.participant}`);
  };

  return (
    <AppShell role={role} title={title} subtitle={subtitle}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 flex flex-col gap-2">
          <h2 className="text-sm font-bold text-ink px-2 pb-2 border-b border-line">
            Active Threads ({threads.length})
          </h2>
          <div className="flex flex-col gap-1.5">
            {threads.map((t) => {
              const isSelected = t.id === activeThread?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-md flex items-start gap-3 transition-colors cursor-pointer",
                    isSelected ? "bg-brand-soft" : "hover:bg-subtle",
                  )}
                >
                  <Avatar initials={t.participant.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink truncate">
                        {t.participant}
                      </span>
                      <span className="text-[11px] text-ink-muted shrink-0">{t.time}</span>
                    </div>
                    <div className="text-xs text-brand font-medium">{t.roleLabel}</div>
                    <p className="text-xs text-ink-secondary truncate pt-0.5">{t.preview}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 flex flex-col justify-between gap-4 min-h-[420px]">
          {activeThread ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={activeThread.participant.slice(0, 2).toUpperCase()} />
                  <div>
                    <h2 className="text-base font-bold text-ink">{activeThread.participant}</h2>
                    <p className="text-xs text-ink-secondary">{activeThread.roleLabel}</p>
                  </div>
                </div>
                <StatusBadge tone={activeThread.unread ? "primary" : "success"}>
                  {activeThread.unread ? "Unread" : "Active Thread"}
                </StatusBadge>
              </div>

              <div className="flex-1 flex flex-col gap-3 py-2 overflow-y-auto">
                {activeThread.messages.map((m, idx) => {
                  const mine = m.self;
                  return (
                    <div
                      key={`${activeThread.id}-${idx}`}
                      className={cn(
                        "max-w-[85%] rounded-lg px-4 py-3 text-sm",
                        mine
                          ? "self-end bg-brand text-ink-on-dark"
                          : "self-start bg-subtle text-ink",
                      )}
                    >
                      <div className="text-[11px] opacity-80 pb-1">
                        {m.sender} • {m.time}
                      </div>
                      <p>{m.text}</p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="pt-3 border-t border-line flex items-center gap-2">
                <label htmlFor="inbox-reply" className="sr-only">
                  Write a reply
                </label>
                <input
                  id="inbox-reply"
                  type="text"
                  placeholder="Write a message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-11 flex-1 rounded-md bg-subtle border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-0 focus:outline-line-focus"
                />
                <Button type="submit" variant="primary">
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
