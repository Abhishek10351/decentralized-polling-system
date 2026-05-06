"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWeb3Poll } from "../../../hooks/useWeb3Poll";

export default function PollDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pollId = Number(params?.id);
    const {
        currentAccount,
        pollData,
        error,
        checkWalletConnection,
        connectWallet,
        fetchPollById,
        castVote,
    } = useWeb3Poll();

    useEffect(() => {
        checkWalletConnection();
        if (!Number.isNaN(pollId)) {
            fetchPollById(pollId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pollId]);

    const handleVote = async (optionId: number) => {
        if (!currentAccount) {
            await connectWallet();
            return;
        }
        await castVote(pollId, optionId);
    };

    if (Number.isNaN(pollId)) {
        return (
            <main className="min-h-screen bg-white px-6 py-16">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">Poll not found</p>
                    <h1 className="mt-4 text-3xl font-semibold text-gray-900">Invalid poll link</h1>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
                    >
                        Back to home
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#ffffff_55%)] px-4 py-12 sm:px-6 lg:px-12">
            <div className="mx-auto max-w-3xl space-y-8">
                <Link href="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                    Back to home
                </Link>

                <div className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-xl shadow-indigo-100/40 sm:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Poll #{pollId}</p>
                            <h1 className="mt-3 text-3xl font-semibold text-gray-900">
                                {pollData?.question || "Loading poll..."}
                            </h1>
                        </div>
                        <div className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
                            {pollData?.isPublic ? "Public" : "Private"}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 space-y-4">
                        {pollData?.options?.map((option) => (
                            <div
                                key={option.id}
                                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{option.name}</p>
                                    <p className="text-sm text-gray-500">{option.voteCount} votes</p>
                                </div>
                                <button
                                    onClick={() => handleVote(option.id)}
                                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                                    disabled={!currentAccount}
                                >
                                    Vote
                                </button>
                            </div>
                        ))}
                    </div>

                    {!pollData && !error && (
                        <p className="mt-6 text-sm text-gray-500">Loading poll details...</p>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">Share link:</span>
                        <span className="break-all">{typeof window !== "undefined" ? window.location.href : ""}</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
