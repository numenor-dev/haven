import Link from "next/link";

interface ChatUnavailableProps {
    firmPhone?: string;
    firmEmail?: string;
    isOwner: boolean;
    slug: string;
}

export default function ChatUnavailable({ isOwner, slug }: ChatUnavailableProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200 text-center h-full min-h-100">
            <h2 className="text-xl font-semibold mb-2">Live Chat is Offline</h2>
            <p className="text-gray-600 mb-6">
                Our assistant is currently unavailable, but we are still here to help you.
            </p>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {/* {firmPhone && (
                    <a href={`tel:${firmPhone}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                        Call us at {firmPhone}
                    </a>
                )}
                {firmEmail && (
                    <a href={`mailto:${firmEmail}`} className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                        Email our team
                    </a>
                )} */}
            </div>

            {/* Admin-only Upgrade Prompt */}
            {isOwner && (
                <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg w-full text-left">
                    <h3 className="text-amber-800 font-semibold text-sm uppercase tracking-wider mb-1">
                        Admin Notice
                    </h3>
                    <p className="text-amber-900 text-sm mb-4">
                        Your free trial has ended. Clients currently see the &quot;Offline&quot; message above. 
                        Upgrade your account to re-activate the live chat for your clients.
                    </p>
                    <Link 
                        href={`/subscribe`}
                        className="inline-block px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded hover:bg-amber-700 transition"
                    >
                        Upgrade Now
                    </Link>
                </div>
            )}
        </div>
    );
}