import {
    useCallback,
    useEffect,
    useState,
    useRef
} from "react";
import {
    Message,
    SessionStatus,
    DemoSessionProps,
    DemoSessionReturn
} from "@/types/types";
import { useStream } from "../../hooks/useStream";


export default function useDemoSession({ isActive }: DemoSessionProps): DemoSessionReturn {
    const [status, setStatus] = useState<SessionStatus>("idle");
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<Error | null>(null);

    const appendToLastMessage = useCallback((text: string) => {
        setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
                ...last,
                content: last.content + text,
            };
            return updated;
        });
    }, []);

    const { startStream, cancelStream } = useStream({
        onChunk: appendToLastMessage,
        onComplete: () => setStatus("user_turn"),
        onError: (error) => {
            console.error("[useDemoSession] Stream error:", error);
            setError(error);
            setStatus("error");
        },
    });

    const cancel = useCallback(() => {
        if (status !== "streaming") return;
        cancelStream();
        setStatus("user_turn");
    }, [status, cancelStream]);

    const start = useCallback(() => {
        if (status !== "idle") return;
        setStatus("streaming");
        setMessages([{ role: "assistant", content: "" }]);
        startStream([], { isDemo: true });
    }, [status, startStream]);

    const hasStarted = useRef(false);

    useEffect(() => {
        if (!isActive || hasStarted.current) return;
        hasStarted.current = true;
        Promise.resolve().then(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]); // start intentionally omitted since ref guards reinvocation

    const sendMessage = useCallback(
        (content: string) => {
            if (status !== "user_turn") return;

            const userMessage: Message = { role: "user", content };
            const updatedHistory = [...messages, userMessage];

            setMessages([...updatedHistory, { role: "assistant", content: "" }]);
            setStatus("streaming");
            startStream(updatedHistory, { isDemo: true });
        },
        [status, messages, startStream]
    );

    const reset = useCallback(() => {
        cancelStream();
        setStatus("idle");
        setMessages([]);
        setError(null);
        hasStarted.current = false;
    }, [cancelStream]);

    return { status, messages, sendMessage, cancel, error, reset };
}