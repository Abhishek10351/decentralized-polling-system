"use client";
import "dotenv/config";
import { useState } from "react";
import { ethers } from "ethers";
import SimplePollABI from "../artifacts/contracts/SimplePoll.sol/SimplePoll.json";

type EthereumProvider = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type PollOption = {
    id: number;
    name: string;
    voteCount: number;
};

type PollData = {
    question: string;
    options: PollOption[];
};

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

const CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_SIMPLE_POLL_SEPOLIA_ADDRESS ||
    "0x9Ba895911e0D7500941F4959Bd91393429D840f3";

const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "";

const SEPOLIA_CHAIN_HEX = "0xaa36a7";

const createSepoliaReadProvider = () => {
    if (!SEPOLIA_RPC_URL) {
        throw new Error("Missing NEXT_PUBLIC_SEPOLIA_RPC_URL.");
    }

    return new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
};

const ensureSepoliaNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Please install MetaMask.");
    }

    const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
    });

    if (currentChainId === SEPOLIA_CHAIN_HEX) {
        return;
    }

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_HEX }],
        });
    } catch (switchError: unknown) {
        const error = switchError as { code?: number };

        if (error.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: SEPOLIA_CHAIN_HEX,
                        chainName: "Sepolia",
                        nativeCurrency: {
                            name: "Sepolia ETH",
                            symbol: "SEP",
                            decimals: 18,
                        },
                        rpcUrls: [SEPOLIA_RPC_URL],
                        blockExplorerUrls: ["https://sepolia.etherscan.io"],
                    },
                ],
            });
            return;
        }

        throw switchError;
    }
};

export const useWeb3Poll = () => {
    const [currentAccount, setCurrentAccount] = useState<string | null>(null);
    const [pollData, setPollData] = useState<PollData>({ question: "", options: [] });
    const [error, setError] = useState<string>("");

    const connectWallet = async () => {
        if (typeof window === "undefined" || !window.ethereum) return window.alert?.("Please install MetaMask.");
        await ensureSepoliaNetwork();
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        const connectedAccounts = accounts as string[];
        setCurrentAccount(connectedAccounts[0]);
    };

    const fetchPollData = async () => {
        try {
            const provider = createSepoliaReadProvider();

            const code = await provider.getCode(CONTRACT_ADDRESS);
            if (code === "0x") {
                setPollData({ question: "", options: [] });
                setError(
                    `No contract is deployed at ${CONTRACT_ADDRESS} on Sepolia.`,
                );
                return;
            }

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                SimplePollABI.abi,
                provider,
            );

            const questionText = await contract.question();
            const count = await contract.optionsCount();

            const fetchedOptions: PollOption[] = [];
            for (let i = 1; i <= Number(count); i++) {
                const option = await contract.options(i);
                fetchedOptions.push({
                    id: Number(option.id),
                    name: option.name,
                    voteCount: Number(option.voteCount),
                });
            }
            setPollData({ question: questionText, options: fetchedOptions });
            setError("");
        } catch (err: unknown) {
            setPollData({ question: "", options: [] });
            setError(err instanceof Error ? err.message : "Failed to load poll data");
        }
    };

    const castVote = async (optionId: number) => {
        try {
            setError("");
            if (typeof window === "undefined" || !window.ethereum) return;
            await ensureSepoliaNetwork();
            const provider = new ethers.BrowserProvider(window.ethereum);

            const code = await provider.getCode(CONTRACT_ADDRESS);
            if (code === "0x") {
                throw new Error(
                    `No SimplePoll contract is deployed at ${CONTRACT_ADDRESS} on Sepolia.`,
                );
            }

            const signer = await provider.getSigner();
            const voterAddress = await signer.getAddress();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                SimplePollABI.abi,
                signer,
            );

            const alreadyVoted = await contract.hasVoted(voterAddress);
            if (alreadyVoted) {
                throw new Error("This wallet has already voted on Sepolia.");
            }

            const transaction = await contract.vote(optionId);
            await transaction.wait();
            fetchPollData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Transaction failed");
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
