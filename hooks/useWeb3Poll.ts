"use client";
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

type PollMeta = {
    id: number;
    question: string;
    creator: string;
    isPublic: boolean;
    optionsCount: number;
};

type PollData = PollMeta & {
    options: PollOption[];
};

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

const CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_SIMPLE_POLL_SEPOLIA_ADDRESS ||
    "0xc3C8AEd7d892ce1E5C375772205E6E2CE721F268";

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
    const [publicPolls, setPublicPolls] = useState<PollMeta[]>([]);
    const [creatorPolls, setCreatorPolls] = useState<PollMeta[]>([]);
    const [pollData, setPollData] = useState<PollData | null>(null);
    const [error, setError] = useState<string>("");

    const fetchPublicPolls = async () => {
        try {
            const provider = createSepoliaReadProvider();

            const code = await provider.getCode(CONTRACT_ADDRESS);
            if (code === "0x") {
                setPublicPolls([]);
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

            const pollIds = await contract.getPublicPollIds();
            const polls: PollMeta[] = [];

            for (const pollId of pollIds as ethers.BigNumberish[]) {
                const id = Number(pollId);
                const [question, creator, isPublic, optionsCount] =
                    await contract.getPollMeta(id);
                polls.push({
                    id,
                    question,
                    creator,
                    isPublic,
                    optionsCount: Number(optionsCount),
                });
            }

            setPublicPolls(polls);
            setError("");
        } catch (err: unknown) {
            setPublicPolls([]);
            setError(err instanceof Error ? err.message : "Failed to load poll data");
        }
    };

    const fetchCreatorPolls = async (creatorAddress: string) => {
        try {
            const provider = createSepoliaReadProvider();

            const code = await provider.getCode(CONTRACT_ADDRESS);
            if (code === "0x") {
                setCreatorPolls([]);
                return;
            }

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                SimplePollABI.abi,
                provider,
            );

            const pollIds = await contract.getPollIdsByCreator(creatorAddress);
            const polls: PollMeta[] = [];

            for (const pollId of pollIds as ethers.BigNumberish[]) {
                const id = Number(pollId);
                const [question, creator, isPublic, optionsCount] =
                    await contract.getPollMeta(id);
                polls.push({
                    id,
                    question,
                    creator,
                    isPublic,
                    optionsCount: Number(optionsCount),
                });
            }

            setCreatorPolls(polls);
        } catch {
            setCreatorPolls([]);
        }
    };

    const checkWalletConnection = async () => {
        if (typeof window === "undefined" || !window.ethereum) return;
        try {
            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const connectedAccounts = accounts as string[];
            const account = connectedAccounts[0] ?? null;
            setCurrentAccount(account);
            if (account) {
                await fetchCreatorPolls(account);
            }
        } catch {
            setCurrentAccount(null);
        }
    };

    const connectWallet = async () => {
        if (typeof window === "undefined" || !window.ethereum) return window.alert?.("Please install MetaMask.");
        await ensureSepoliaNetwork();
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        const connectedAccounts = accounts as string[];
        const account = connectedAccounts[0] ?? null;
        setCurrentAccount(account);
        if (account) {
            await fetchCreatorPolls(account);
        }
    };

    const fetchPollById = async (pollId: number) => {
        try {
            const provider = createSepoliaReadProvider();

            const code = await provider.getCode(CONTRACT_ADDRESS);
            if (code === "0x") {
                setPollData(null);
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

            const [question, creator, isPublic, optionsCount] =
                await contract.getPollMeta(pollId);

            const fetchedOptions: PollOption[] = [];
            for (let i = 1; i <= Number(optionsCount); i++) {
                const option = await contract.getOption(pollId, i);
                fetchedOptions.push({
                    id: i,
                    name: option[0],
                    voteCount: Number(option[1]),
                });
            }

            setPollData({
                id: pollId,
                question,
                creator,
                isPublic,
                optionsCount: Number(optionsCount),
                options: fetchedOptions,
            });
            setError("");
        } catch (err: unknown) {
            setPollData(null);
            setError(err instanceof Error ? err.message : "Failed to load poll data");
        }
    };

    const createPoll = async (question: string, options: string[], isPublic: boolean) => {
        try {
            setError("");
            if (typeof window === "undefined" || !window.ethereum) return null;
            await ensureSepoliaNetwork();

            const sanitizedOptions = options
                .map((option) => option.trim())
                .filter((option) => option.length > 0);

            if (!question.trim()) {
                throw new Error("Please enter a poll question.");
            }

            if (sanitizedOptions.length < 2) {
                throw new Error("Please add at least two options.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const creatorAddress = await signer.getAddress();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                SimplePollABI.abi,
                signer,
            );

            const transaction = await contract.createPoll(
                question.trim(),
                sanitizedOptions,
                isPublic,
            );
            const receipt = await transaction.wait();

            const parsedLogs = receipt?.logs
                .map((log: ethers.Log) => {
                    try {
                        return contract.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);

            const pollCreated = parsedLogs?.find(
                (log: { name?: string; args?: Record<string, unknown> }) => log?.name === "PollCreated",
            );
            const pollId = pollCreated ? Number(pollCreated.args.pollId) : null;

            await fetchPublicPolls();
            await fetchCreatorPolls(creatorAddress);
            return pollId;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create poll");
            return null;
        }
    };

    const castVote = async (pollId: number, optionId: number) => {
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

            const alreadyVoted = await contract.hasVoted(pollId, voterAddress);
            if (alreadyVoted) {
                throw new Error("This wallet has already voted on Sepolia.");
            }

            const transaction = await contract.vote(pollId, optionId);
            await transaction.wait();
            fetchPollById(pollId);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Transaction failed");
        }
    };

    return {
        currentAccount,
        publicPolls,
        creatorPolls,
        pollData,
        error,
        checkWalletConnection,
        connectWallet,
        fetchPublicPolls,
        fetchCreatorPolls,
        fetchPollById,
        createPoll,
        castVote,
    };
};
