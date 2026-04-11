import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatMessage, ChatRole } from "./mockData";

interface MessagingPanelProps {
  messages: ChatMessage[];
  myRole: ChatRole;
  accentColor: string;
  onSend: (text: string) => void;
  placeholder?: string;
  maxHeight?: number;
}

export default function MessagingPanel({
  messages,
  myRole,
  accentColor,
  onSend,
  placeholder = "Type a message...",
  maxHeight = 260,
}: MessagingPanelProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const roleLabel: Record<ChatRole, string> = {
    customer: "Customer",
    dispatcher: "Dispatcher",
    rider: "Rider",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Bubble area */}
      <div
        style={{
          maxHeight,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "12px 0",
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.from === myRole;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
              }}
            >
              {!isMe && (
                <span style={{ fontSize: "0.65rem", color: "#9CA3AF", marginBottom: 2, paddingLeft: 4 }}>
                  {roleLabel[msg.from]}
                </span>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "8px 12px",
                  borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isMe ? accentColor : "#F3F4F6",
                  color: isMe ? "#fff" : "#1F2937",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
              <span style={{ fontSize: "0.62rem", color: "#9CA3AF", marginTop: 2, paddingRight: isMe ? 4 : 0, paddingLeft: isMe ? 0 : 4 }}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          padding: "10px 0 0",
          borderTop: "1px solid #F3F4F6",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            padding: "9px 12px",
            borderRadius: 12,
            border: "1.5px solid #E5E7EB",
            outline: "none",
            fontSize: "0.83rem",
            color: "#1F2937",
            background: "#F9FAFB",
            fontFamily: "inherit",
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            padding: "9px 14px",
            borderRadius: 12,
            background: text.trim() ? accentColor : "#E5E7EB",
            color: text.trim() ? "#fff" : "#9CA3AF",
            border: "none",
            cursor: text.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 600,
            fontSize: "0.82rem",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
}
