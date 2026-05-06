import { expect } from "chai";
import { network } from "hardhat";
import "chai-as-promised";

const { ethers } = await network.create();

describe("SimplePoll", function () {
  it("has correct initial question and options", async function () {
    const simplePoll = (await ethers.deployContract("SimplePoll")) as any;

    const question = await simplePoll.question();
    expect(question).to.equal("What is the best programming language?");

    const count = await simplePoll.optionsCount();
    expect(count).to.equal(3n);

    const opt1 = await simplePoll.options(1);
    const opt2 = await simplePoll.options(2);
    const opt3 = await simplePoll.options(3);

    expect(opt1.name).to.equal("Solidity");
    expect(opt2.name).to.equal("Node");
    expect(opt3.name).to.equal("Python");
  });

  it("allows voting and prevents double voting", async function () {
    const simplePoll = (await ethers.deployContract("SimplePoll")) as any;
    const signers = await ethers.getSigners();
    const voter = signers[1];

    await simplePoll.connect(voter).vote(1n);

    const opt1 = await simplePoll.options(1);
    expect(opt1.voteCount).to.equal(1n);

    await expect(simplePoll.connect(voter).vote(1n)).to.be.revertedWith(
      "Your wallet has already voted!",
    );
  });

  it("reverts on invalid option", async function () {
    const simplePoll = (await ethers.deployContract("SimplePoll")) as any;

    await expect(simplePoll.vote(999n)).to.be.revertedWith("Invalid option!");
  });
});
