// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimplePoll {
    struct Option {
        string name;
        uint voteCount;
    }

    struct Poll {
        string question;
        address creator;
        bool isPublic;
        Option[] options;
        mapping(address => bool) hasVoted;
    }

    mapping(uint => Poll) private polls;
    uint public pollCount;
    uint[] private publicPollIds;
    mapping(address => uint[]) private pollIdsByCreator;

    event PollCreated(uint indexed pollId, address indexed creator, bool isPublic, string question);
    event VoteCast(uint indexed pollId, uint indexed optionId, address indexed voter);

    function createPoll(
        string memory _question,
        string[] memory _optionNames,
        bool _isPublic
    ) public returns (uint) {
        require(bytes(_question).length > 0, "Question cannot be empty!");
        require(_optionNames.length >= 2, "At least two options are required!");

        pollCount++;
        uint pollId = pollCount;
        Poll storage poll = polls[pollId];
        poll.question = _question;
        poll.creator = msg.sender;
        poll.isPublic = _isPublic;

        for (uint i = 0; i < _optionNames.length; i++) {
            require(bytes(_optionNames[i]).length > 0, "Option cannot be empty!");
            poll.options.push(Option({name: _optionNames[i], voteCount: 0}));
        }

        if (_isPublic) {
            publicPollIds.push(pollId);
        }

        pollIdsByCreator[msg.sender].push(pollId);

        emit PollCreated(pollId, msg.sender, _isPublic, _question);
        return pollId;
    }

    function getPublicPollIds() public view returns (uint[] memory) {
        return publicPollIds;
    }

    function getPollIdsByCreator(address creator) public view returns (uint[] memory) {
        return pollIdsByCreator[creator];
    }

    function getPollMeta(uint pollId)
        public
        view
        returns (string memory question, address creator, bool isPublic, uint optionsCount)
    {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist!");
        Poll storage poll = polls[pollId];
        return (poll.question, poll.creator, poll.isPublic, poll.options.length);
    }

    function getOption(uint pollId, uint optionId) public view returns (string memory name, uint voteCount) {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist!");
        Poll storage poll = polls[pollId];
        require(optionId > 0 && optionId <= poll.options.length, "Invalid option!");
        Option storage option = poll.options[optionId - 1];
        return (option.name, option.voteCount);
    }

    function hasVoted(uint pollId, address voter) public view returns (bool) {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist!");
        return polls[pollId].hasVoted[voter];
    }

    function vote(uint pollId, uint optionId) public {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist!");
        Poll storage poll = polls[pollId];
        require(!poll.hasVoted[msg.sender], "Your wallet has already voted!");
        require(optionId > 0 && optionId <= poll.options.length, "Invalid option!");

        poll.hasVoted[msg.sender] = true;
        poll.options[optionId - 1].voteCount++;

        emit VoteCast(pollId, optionId, msg.sender);
    }
}