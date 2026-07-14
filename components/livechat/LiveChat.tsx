'use client';

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LiveChatProps } from "@/types/types";
import useLiveSession from "./hooks/useLiveSession";
import StreamingIndicator from "../ui/loading";
import { ArrowUpIcon, StopIcon } from "@heroicons/react/24/solid";

export default function LiveChat({ slug, firmName }: LiveChatProps) {
    const [gateFields, setGateFields] = useState({ name: '', phone: '', email: '' });
    const [clientInfo, setClientInfo] = useState<{ name: string; phone: string; email: string } | null>(null);

    const {
        status,
        messages,
        sendMessage,
        manualEndSession,
        textRef,
        cancel,
        error
    } = useLiveSession({ slug, firmName, clientInfo });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!gateFields.name.trim()) return;

        setClientInfo({
            name: gateFields.name.trim(),
            phone: gateFields.phone.trim(),
            email: gateFields.email.trim(),
        });
    };

    return (
        <AnimatePresence mode="wait">
            {!clientInfo ? (
                <motion.form
                    key="name-gate"
                    onSubmit={handleSubmit}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="min-h-96 space-y-2 flex flex-col bg-sky-100 dark:bg-sky-900 p-16 rounded-2xl"
                >
                    <label
                        htmlFor="client-name"
                        className="ml-3 mb-1 text-sm md:text-base text-zinc-700 dark:text-zinc-200 font-semibold"
                    >
                        Please enter your full name
                    </label>
                    <input
                        id="client-name"
                        value={gateFields.name}
                        onChange={(e) => setGateFields(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-10 pl-5 outline-1 outline-zinc-700 focus:outline-sky-600
                        dark:outline-zinc-300 dark:focus:outline-blue-300 text-zinc-700 dark:text-zinc-200 rounded-lg"
                    />

                    <label
                        htmlFor="client-phone"
                        className="ml-3 mt-5 mb-1 text-sm md:text-base text-zinc-700 dark:text-zinc-200 font-semibold"
                    >
                        Phone number
                        <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                            optional
                        </span>
                    </label>
                    <input
                        id="client-phone"
                        type="tel"
                        value={gateFields.phone}
                        onChange={(e) => setGateFields(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full h-10 pl-5 outline-1 outline-zinc-700 focus:outline-sky-600
                        dark:outline-zinc-300 dark:focus:outline-blue-300 text-zinc-700 dark:text-zinc-200 rounded-lg"
                    />

                    <label
                        htmlFor="client-email"
                        className="ml-3 mt-5 mb-1 text-sm md:text-base text-zinc-700 dark:text-zinc-200 font-semibold"
                    >
                        Email address
                        <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                            optional
                        </span>
                    </label>
                    <input
                        id="client-email"
                        type="email"
                        value={gateFields.email}
                        onChange={(e) => setGateFields(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full h-10 pl-5 outline-1 outline-zinc-700 focus:outline-sky-600
                        dark:outline-zinc-300 dark:focus:outline-blue-300 text-zinc-700 dark:text-zinc-200 rounded-lg"
                    />

                    <button
                        type="submit"
                        className="mx-auto py-2 w-1/2 bg-sky-700 dark:bg-zinc-300 text-sky-100 dark:text-zinc-700
                        hover:bg-sky-600 dark:hover:bg-zinc-100/90 transition duration-300 mt-10 cursor-pointer rounded-2xl"
                    >
                        Continue
                    </button>
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
                        <div className="flex items-center space-x-3 px-5 py-5 border-b border-zinc-200/40 dark:border-zinc-200/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-300" />
                            <span className="text-sm font-bold">
                                {firmName ?? slug}
                            </span>
                            <button
                                disabled={status === "complete"}
                                onClick={manualEndSession}
                                aria-label="End chat"
                                className="px-5 py-1 ml-auto text-xs rounded-3xl bg-red-700/70 dark:bg-red-800 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                                End Chat
                            </button>
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
                                                <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-50">{firmName[0]}</span>
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === "user"
                                                ? "bg-sky-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm"
                                                : "bg-zinc-50 dark:bg-sky-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                                                }`}
                                        >
                                            {/* Show streaming indicator on empty assistant message */}
                                            {message.role === "assistant" ? (
                                                status === "streaming" && i === messages.length - 1 ? (
                                                    message.content === "" ? (
                                                        <StreamingIndicator />
                                                    ) : (
                                                        <span ref={textRef} />
                                                    )
                                                ) : (
                                                    <span>{message.content}</span>
                                                )
                                            ) : (
                                                <span>{message.content}</span>
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
                                <div className="flex mx-auto space-x-1">
                                    {status === "streaming" &&
                                        <button
                                            onClick={cancel}
                                            aria-label="Stop response"
                                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-80 transition-opacity duration-200"
                                        >
                                            <StopIcon className="size-4" />
                                        </button>
                                    }
                                    <button
                                        onClick={handleSend}
                                        disabled={status !== "user_turn"}
                                        aria-label="Send message"
                                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity duration-200"
                                    >
                                        <ArrowUpIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}