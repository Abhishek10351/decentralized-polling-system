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
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Decentralized Polling
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        Cast your vote securely on the blockchain.
                    </p>
                </div>

                <div className="flex justify-center">
                    {!currentAccount ? (
                        <button
                            onClick={connectWallet}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Connect MetaMask
                        </button>
                    ) : (
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-800 font-mono text-sm shadow-sm space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>{currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-8 sm:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                            {pollData.question || "Loading poll..."}
                        </h2>

                        <div className="space-y-4">
                            {pollData.options.map((option: any) => (
                                <div
                                    key={option.id}
                                    className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                                >
                                    <span className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">
                                        {option.name}
                                    </span>
                                    <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end sm:space-x-6">
                                        <div className="flex items-center text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="font-bold text-gray-900 mr-2">{option.voteCount}</span>
                                            <span className="text-sm uppercase tracking-wider">votes</span>
                                        </div>
                                        <button
                                            onClick={() => castVote(option.id)}
                                            disabled={!currentAccount}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Vote
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
