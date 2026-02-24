import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { Wrench, User } from 'lucide-react';

export default function ChatMessage({ message }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Wrench className="w-4 h-4 text-black" />
                </div>
            )}
            <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                isUser
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm"
                    : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
            )}>
                {isUser ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                ) : (
                    <ReactMarkdown
                        className="text-sm prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700"
                        components={{
                            p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-700">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                            h3: ({ children }) => <h3 className="font-bold text-slate-900 mt-3 mb-1">{children}</h3>,
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
            {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-600" />
                </div>
            )}
        </div>
    );
}