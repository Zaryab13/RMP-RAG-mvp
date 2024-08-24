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
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
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
        return reader.read().then(processText);
      });
    });
  };

  return (
    <section className="w-[100vw] h-[100vh] flex items-center flex-col justify-center">
      <div className="flex flex-col w-[500px] h-[700px] border-[1px_solid_black] p-2 gap-3">
        <div
          className={cn("flex flex-col gap-2 grow  overflow-auto max-h-[100%]")}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex", {
                "items-start": message.role === "assistant",
                "items-end": message.role === "user",
              })}
            >
              <div
                className={cn("text-white rounded-[16px] p-3", {
                  "bg-primary": message.role === "assistant",
                  "bg-secondary": message.role === "user",
                })}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <div className={cn("flex gap-2")}>
          <Input type="message" placeholder="Send Message" onChange={(e)=>{
            
          }} />
          <Button variant="outline">Send</Button>
        </div>
      </div>
    </section>
  );
}
