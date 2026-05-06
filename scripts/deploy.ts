import { network } from "hardhat";

async function main() {
    console.log("Deploying SimplePoll contract to Sepolia...");

    // 1. Get ethers from hardhat's network
    const { ethers } = await network.create();

    // 2. Get the signer (account to deploy from)
    const [signer] = await ethers.getSigners();
    console.log(`Deploying from: ${signer.address}`);

    // 3. Get the contract factory
    const SimplePoll = await ethers.getContractFactory("SimplePoll");

    // 4. Deploy the contract
    console.log("Sending deployment transaction...");
    const poll = await SimplePoll.deploy();

    // 5. Wait for deployment to be mined
    console.log("Waiting for deployment to be mined...");
    await poll.waitForDeployment();

    // 6. Get the address
    const address = await poll.getAddress();
    console.log(`✅ SimplePoll successfully deployed to: ${address}`);
    console.log(`📋 Save this address in your frontend hook!`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
