'use client';

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LiveChatProps } from "@/types/types";
import useLiveSession from "./hooks/useLiveSession";
import StreamingIndicator from "../ui/loading";
import { ArrowUpIcon, StopIcon } from "@heroicons/react/24/solid";

export default function LiveChat({ slug, firmName }: LiveChatProps) {

    const [clientName, setClientName] = useState<string>('');
    const [nameInput, setNameInput] = useState("");

    const { status, messages, sendMessage, cancel, error } = useLiveSession({ slug, clientName });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const latestMessageRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value && status === "user_turn") {
                sendMessage(value);
                e.currentTarget.value = "";
            }
        }
    };

    const handleSend = () => {
        const value = inputRef.current?.value.trim();
        if (value && status === "user_turn") {
            sendMessage(value);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const trimmed = nameInput.trim();
        if (!trimmed) return;
        setClientName(trimmed);
    };

    return (
        <AnimatePresence mode="wait">
            {!clientName ? (
                <motion.form
                    key="name-gate"
                    onSubmit={handleSubmit}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    <input
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Please enter your full name"
                    />
                </motion.form>
            ) : (
                <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    <div className="flex flex-col w-full max-w-2xl mx-auto h-150 rounded-2xl border border-zinc-50 dark:border-zinc-50/50 overflow-hidden shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center space-x-3 px-5 py-5 border-b border-zinc-200/30 dark:border-zinc-200/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-300" />
                            <span className="text-sm font-bold">
                                {firmName ?? slug}
                            </span>
                        </div>

                        {/* Message thread */}
                        <div className="flex-1 overflow-y-auto px-5 py-7 space-y-4 scroll-smooth">
                            <AnimatePresence initial={false}>
                                {messages.map((message, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {/* Assistant avatar */}
                                        {message.role === "assistant" && (
                                            <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-sky-800 flex items-center justify-center mr-2.5 mt-0.5 shrink-0">
                                                <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-50">H</span>
                                            </div>
                                        )}

                                        <div
                                            ref={latestMessageRef}
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === "user"
                                                ? "bg-sky-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm"
                                                : "bg-zinc-50 dark:bg-sky-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                                                }`}
                                        >
                                            {message.role === "assistant" && message.content === "" ? (
                                                <StreamingIndicator />
                                            ) : (
                                                message.content
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-center text-red-700 dark:text-red-500 py-2"
                                >
                                    Something went wrong. Please refresh and try again.
                                </motion.p>
                            )}

                            {status === "complete" && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-center text-zinc-400 dark:text-zinc-600 py-2"
                                >
                                    Thank you for the information. This chat session is now complete.
                                </motion.p>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input bar */}
                        <div className="px-4 py-3">
                            <div className="flex items-end gap-2 bg-zinc-50 dark:bg-sky-800 rounded-xl px-3 py-2 ring ring-sky-950 focus-within:ring-sky-200 dark:focus-within:ring-sky-600">
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    placeholder={
                                        status === "user_turn" ? "Reply..."
                                            : status === "complete" ? "Session complete"
                                                : status === "error" ? "Something went wrong"
                                                    : "Haven is typing..."
                                    }
                                    disabled={status !== "user_turn"}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-transparent resize-none text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-700 dark:placeholder:text-zinc-300 outline-none disabled:cursor-not-allowed min-h-6 max-h-32 leading-6"
                                />
                                {status === "streaming" ? (
                                    <button
                                        onClick={cancel}
                                        aria-label="Stop response"
                                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-80 transition-opacity duration-200"
                                    >
                                        <StopIcon className="size-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={status !== "user_turn"}
                                        aria-label="Send message"
                                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity duration-200"
                                    >
                                        <ArrowUpIcon className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}