"use client";
import { useState } from "react";
import { ethers } from "ethers";
import SimplePollABI from "../artifacts/contracts/SimplePoll.sol/SimplePoll.json";

declare global {
    var window: any;
    interface Window {
        ethereum?: any;
    }
}

// Paste your deployed address here:
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const useWeb3Poll = () => {
    const [currentAccount, setCurrentAccount] = useState<string | null>(null);
    const [pollData, setPollData] = useState<{ question: string, options: any[] }>({ question: "", options: [] });
    const [error, setError] = useState<string | any>("");

    const connectWallet = async () => {
        if (typeof window === "undefined" || !window.ethereum) return window.alert?.("Please install MetaMask.");
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
    };

    const fetchPollData = async () => {
        if (typeof window === "undefined" || !window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            SimplePollABI.abi,
            provider,
        );

        const questionText = await contract.question();
        const count = await contract.optionsCount();

        let fetchedOptions = [];
        for (let i = 1; i <= count; i++) {
            const option = await contract.options(i);
            fetchedOptions.push({
                id: Number(option.id),
                name: option.name,
                voteCount: Number(option.voteCount),
            });
        }
        setPollData({ question: questionText, options: fetchedOptions });
    };

    const castVote = async (optionId: number) => {
        try {
            setError("");
            if (typeof window === "undefined" || !window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                SimplePollABI.abi,
                signer,
            );

            const transaction = await contract.vote(optionId);
            await transaction.wait();
            fetchPollData();
        } catch (err: any) {
            setError(err.reason || "Transaction failed");
        }
    };

    return {
        currentAccount,
        pollData,
        error,
        connectWallet,
        fetchPollData,
        castVote,
    };
};
