"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {FaUser , FaRobot} from 'react-icons/fa'

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
      alert("Please enter a message");
      return;
    }
    const newMessages = [...messages, { role: "user", content: message }];

    setMessages(newMessages);
    setMessage(""); // Clear the input field

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

      setMessages([...newMessages, { role: "assistant", content: "" }]);

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
    <section className="w-full min-h-screen bg-gradient-to-br from-[#FFB84C] to-[#A459D1] p-4 flex items-center justify-center">
    <div className="w-full max-w-4xl h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn("flex items-end", {
              "justify-start": message.role === "assistant",
              "justify-end": message.role === "user",
            })}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full border border-[#A459D1]  flex items-center justify-center mr-2">
                <FaRobot className="text-[#A459D1] text-2xl " />
              </div>
            )}
            <div
              className={cn("max-w-[70%] rounded-xl px-4 py-3", {
                "bg-[#A459D1] text-white": message.role === "assistant",
                "bg-[#F266AB] text-white": message.role === "user",
              })}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full border border-[#F266AB] flex items-center justify-center ml-2">
                <FaUser className="text-[#F266AB] text-1xl" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 focus:ring-[#FFB84C] focus:border-[#FFB84C]"
          />
          <Button
            onClick={sendMessage}
            className="bg-[#FFB84C] hover:bg-[#F266AB] text-white font-bold py-2 px-4 rounded-xl transition duration-300"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  </section>
  );
}
