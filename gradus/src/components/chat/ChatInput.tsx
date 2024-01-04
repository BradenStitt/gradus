import React, { useContext, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { ChatContext } from "./ChatContext";
import { text } from "stream/consumers";

interface ChatInputProps {
  isDisabled?: boolean;
}

function ChatInput({ isDisabled }: ChatInputProps) {
  const [isFirstMessage, setIsFirstMessage] = useState(true); //TODO: use this to show a different message for the first message

  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null); //set focus on textarea

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl: max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                ref={textareaRef}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();

                    textareaRef.current?.focus();
                  }
                }}
                placeholder="Enter your prompt..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
              />

              <Button
                disabled={isLoading || isDisabled}
                className="absolute bottom-1.5 right-[8px]"
                aria-label="send message"
                onClick={(e) => {
                  e.preventDefault();
                  addMessage();

                  textareaRef.current?.focus();
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
