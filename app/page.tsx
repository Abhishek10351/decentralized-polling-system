"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3Poll } from "../hooks/useWeb3Poll";
// import useWeb3Poll from "@/hooks/useWeb3Poll";

export default function Home() {
    const router = useRouter();
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [isPublic, setIsPublic] = useState(true);
    const [createdLink, setCreatedLink] = useState<string | null>(null);
    const [createdIsPublic, setCreatedIsPublic] = useState<boolean | null>(null);
    const {
        currentAccount,
        publicPolls,
        creatorPolls,
        error,
        checkWalletConnection,
        connectWallet,
        fetchPublicPolls,
        fetchCreatorPolls,
        createPoll,
    } = useWeb3Poll();

    useEffect(() => {
        checkWalletConnection();
        fetchPublicPolls();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (currentAccount) {
            fetchCreatorPolls(currentAccount);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAccount]);

    const updateOption = (index: number, value: string) => {
        const next = [...options];
        next[index] = value;
        setOptions(next);
    };

    const addOptionField = () => {
        setOptions([...options, ""]);
    };

    const removeOptionField = (index: number) => {
        if (options.length <= 2) return;
        const next = options.filter((_, i) => i !== index);
        setOptions(next);
    };

    const handleCreatePoll = async () => {
        if (!currentAccount) {
            await connectWallet();
            return;
        }

        const pollId = await createPoll(question, options, isPublic);
        if (!pollId) return;

        const link = `${window.location.origin}/poll/${pollId}`;
        setCreatedLink(link);
        setCreatedIsPublic(isPublic);
        setQuestion("");
        setOptions(["", ""]);
        setIsPublic(true);

        if (isPublic) {
            router.push(`/poll/${pollId}`);
        }
    };

    const copyLink = async () => {
        if (!createdLink) return;
        await navigator.clipboard.writeText(createdLink);
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc_55%,_#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-12">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl"></div>
                <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-5xl space-y-10">
                <header className="text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">
                        Sepolia Poll Studio
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold text-gray-900 sm:text-5xl">
                        Build a poll, share it, and let the chain decide.
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Create a public poll for everyone or keep it unlisted and share a private link.
                    </p>
                </header>

                <div className="flex justify-center">
                    {!currentAccount ? (
                        <button
                            onClick={connectWallet}
                            className="inline-flex items-center gap-3 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg shadow-gray-300/40 transition hover:-translate-y-0.5 hover:bg-black"
                        >
                            Connect MetaMask
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                            {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm">
                        {error}
                    </div>
                )}

                <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-xl shadow-indigo-100/60 sm:p-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-900">Create a poll</h2>
                            <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${isPublic ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {isPublic ? "Public" : "Private"}
                            </span>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Question</label>
                                <input
                                    value={question}
                                    onChange={(event) => setQuestion(event.currentTarget.value)}
                                    placeholder="What should we build next?"
                                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Options</label>
                                    <button
                                        type="button"
                                        onClick={addOptionField}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        + Add option
                                    </button>
                                </div>
                                {options.map((option, index) => (
                                    <div key={`option-${index}`} className="flex items-center gap-3">
                                        <input
                                            value={option}
                                            onChange={(event) => updateOption(index, event.currentTarget.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeOptionField(index)}
                                            className="rounded-full border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:border-gray-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Visibility</p>
                                    <p className="text-xs text-gray-500">
                                        Public polls appear on the home feed. Private polls are accessible by link only.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 self-start sm:self-auto">
                                    <span className={`text-xs font-semibold ${isPublic ? "text-gray-400" : "text-amber-700"}`}>
                                        Private
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPublic((value) => !value)}
                                        className={`relative h-8 w-14 rounded-full transition-[background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isPublic ? "bg-emerald-500" : "bg-amber-500"}`}
                                    >
                                        <span
                                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isPublic ? "translate-x-6" : "translate-x-0"} left-1`}
                                        ></span>
                                    </button>
                                    <span className={`text-xs font-semibold ${isPublic ? "text-emerald-700" : "text-gray-400"}`}>
                                        Public
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCreatePoll}
                                className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                            >
                                Create poll
                            </button>
                        </div>

                        {createdLink && createdIsPublic === false && (
                            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-sm font-semibold text-amber-800">Private poll link</p>
                                <p className="mt-2 break-all text-xs text-amber-700">{createdLink}</p>
                                <button
                                    onClick={copyLink}
                                    className="mt-3 rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-800 hover:border-amber-400"
                                >
                                    Copy link
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {currentAccount && creatorPolls.some((poll) => !poll.isPublic) && (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-amber-900">Your private polls</h2>
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                        {creatorPolls.filter((poll) => !poll.isPublic).length}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {creatorPolls
                                        .filter((poll) => !poll.isPublic)
                                        .map((poll) => (
                                            <div
                                                key={`private-${poll.id}`}
                                                className="rounded-2xl border border-amber-200 bg-white/80 p-4 shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-500">Private</p>
                                                    <span className="text-xs text-amber-400">#{poll.id}</span>
                                                </div>
                                                <h3 className="mt-2 text-base font-semibold text-amber-900">
                                                    {poll.question}
                                                </h3>
                                                <p className="mt-1 text-xs text-amber-700">
                                                    {poll.optionsCount} options
                                                </p>
                                                <div className="mt-3 flex items-center gap-3">
                                                    <Link
                                                        href={`/poll/${poll.id}`}
                                                        className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
                                                    >
                                                        Open poll
                                                    </Link>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.id}`)}
                                                        className="rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 hover:border-amber-300"
                                                    >
                                                        Copy link
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Public polls</h2>
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                {publicPolls.length} live
                            </span>
                        </div>

                        {publicPolls.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-6 text-sm text-gray-500">
                                No public polls yet. Create the first one and share it.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {publicPolls.map((poll) => (
                                    <div
                                        key={poll.id}
                                        className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Public</p>
                                            <span className="text-xs text-gray-400">#{poll.id}</span>
                                        </div>
                                        <h3 className="mt-3 text-lg font-semibold text-gray-900">
                                            {poll.question}
                                        </h3>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {poll.optionsCount} options - {poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}
                                        </p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <Link
                                                href={`/poll/${poll.id}`}
                                                className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black"
                                            >
                                                Open poll
                                            </Link>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.id}`)}
                                                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300"
                                            >
                                                Copy link
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
