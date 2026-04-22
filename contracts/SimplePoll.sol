// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimplePoll {
    string public question = "What is the best programming language?";
    
    struct Option {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Option) public options;
    mapping(address => bool) public hasVoted;
    uint public optionsCount;

    constructor() {
        addOption("Solidity");
        addOption("Node");
        addOption("Python");
    }

    function addOption(string memory _name) private {
        optionsCount++;
        options[optionsCount] = Option(optionsCount, _name, 0);
    }

    function vote(uint _optionId) public {
        require(!hasVoted[msg.sender], "Your wallet has already voted!");
        require(_optionId > 0 && _optionId <= optionsCount, "Invalid option!");
        hasVoted[msg.sender] = true;
        options[_optionId].voteCount++;
    }
}