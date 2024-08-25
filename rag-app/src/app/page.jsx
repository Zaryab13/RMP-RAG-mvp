"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message: ", message);
      return;
    }
    const newMessages = [...messages, { role: "user", content: message }];

    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setMessage(""); // Clear the input field

    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessages),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      const processText = async ({ done, value }) => {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        const nextResult = await reader.read();
        return processText(nextResult);
      };

      await reader.read().then(processText);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <section className="w-[100vw] h-[100vh] flex items-center flex-col justify-center">
      <div className="flex flex-col w-full max-w-[880px] h-[800px] max-h-full border border-black p-2 gap-3 ">
        <div
          className={cn(
            "flex flex-col px-8 gap-2 grow  overflow-auto max-h-[100%]"
          )}
        >
          {messages.map((message, index) => {
            console.log(message);

            return (
              <div
                key={index}
                className={cn("flex", {
                  "justify-start": message.role === "assistant",
                  "justify-end": message.role === "user",
                })}
              >
                <div
                  className={cn("rounded-[16px] p-3", {
                    "bg-slate-700 text-slate-200": message.role === "assistant",
                    "bg-slate-300 text-slatebg-slate-700":
                      message.role === "user",
                  })}
                >
                  {`${message.content}`}
                </div>
              </div>
            );
          })}
        </div>
        <div className={cn("flex gap-2")}>
          <Input
            type="message"
            value={message}
            placeholder="Send Message"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <Button variant="outline" onClick={sendMessage}>
            Send
          </Button>
        </div>
      </div>
    </section>
  );
}
