import { network } from "hardhat";

async function main() {
    console.log("Deploying SimplePoll contract...");

    // 1. Pull the modified ethers object directly from Hardhat
    const { ethers } = await network.create();
    const SimplePoll = await ethers.getContractFactory("SimplePoll");

    // 2. Trigger the deployment
    const poll = await SimplePoll.deploy();

    // 3. Wait for it to be mined (Ethers v6 syntax)
    await poll.waitForDeployment();

    // 4. Get the address
    const address = await poll.getAddress();
    console.log(`✅ SimplePoll successfully deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
