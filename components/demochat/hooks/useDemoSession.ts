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
import { useSmoothChat } from "@/components/hooks/useSmoothChat";


export default function useDemoSession({ isActive }: DemoSessionProps): DemoSessionReturn {
    const [status, setStatus] = useState<SessionStatus>("idle");
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<Error | null>(null);

 const { textRef, enqueue, reset } = useSmoothChat(() => {
        setStatus('user_turn');
    })

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

    const onChunk = useCallback((delta: string) => {
        enqueue(delta);
        appendToLastMessage(delta);
    }, [enqueue, appendToLastMessage])
    
    const onError = useCallback((error: Error) => {
        console.error('[useLiveSession] Stream error:', error);
        setError(error);
        setStatus('error');
    }, []);

    const onSessionComplete = useCallback(() => setStatus('complete'), []);

    const { startStream, cancelStream } = useStream({
        onChunk,
        onComplete: () => setStatus("user_turn"),
        onError,
        onSessionComplete
    });

    const cancel = useCallback(() => {
        cancelStream();
        if (status === "streaming") setStatus("user_turn")
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

    useEffect(() => {
        return () => {
            cancelStream();
        }
    }, [cancelStream]);

    const sendMessage = useCallback(
        (content: string) => {
            if (status !== "user_turn") return;

            const userMessage: Message = { role: "user", content };
            const updatedHistory = [...messages, userMessage];

            setMessages([...updatedHistory, { role: "assistant", content: "" }]);
            setStatus("streaming");
            reset();
            startStream(updatedHistory, { isDemo: true });
        },
        [status, messages, startStream, reset]
    );

    return { status, messages, sendMessage, textRef, cancel, error, reset };
}