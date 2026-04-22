"use client";

import { useEffect } from "react";
import { useWeb3Poll } from "../hooks/useWeb3Poll";
// import useWeb3Poll from "@/hooks/useWeb3Poll";

export default function Home() {
    const {
        currentAccount,
        pollData,
        error,
        connectWallet,
        fetchPollData,
        castVote,
    } = useWeb3Poll();

    useEffect(() => {
        fetchPollData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="p-10 max-w-2xl mx-auto font-sans">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">
                Decentralized Polling
            </h1>

            {!currentAccount ? (
                <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg mb-6 transition-colors shadow-sm"
                >
                    Connect MetaMask
                </button>
            ) : (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 font-mono text-sm break-all shadow-sm">
                    Connected: {currentAccount}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
                    {error}
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    {pollData.question || "Loading contract data..."}
                </h2>

                <div className="space-y-4">
                    {pollData.options.map((option: any) => (
                        <div
                            key={option.id}
                            className="flex justify-between items-center bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                            <span className="text-lg font-medium text-gray-700">
                                {option.name}
                            </span>
                            <div className="flex items-center gap-6">
                                <span className="text-gray-500 font-semibold bg-gray-200 px-3 py-1 rounded-full text-sm">
                                    {option.voteCount} votes
                                </span>
                                <button
                                    onClick={() => castVote(option.id)}
                                    disabled={!currentAccount}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    Vote
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
