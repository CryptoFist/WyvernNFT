// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import '../ERC721A.sol';
import 'hardhat/console.sol';

contract ERC721AMock is ERC721A {
    error AlreadyOffered();
    error NotOfferedNFT();

    struct Offering {
        address owner;
        uint256 price;
        uint256 tokenId;
        bool status;
    }    

    modifier checkOwner(address sender_, uint256 tokenId_) {
        require(sender_ == ownerOf(tokenId_), "Azuki: caller is not token owner");
        _;
    }
    mapping(address => uint256) private ownerOfferedCnt;
    mapping(uint256 => Offering) private offers;
    uint256 private offeredCnt;

    constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

    function getNFTByOwner() public view returns (uint256[] memory) {
        address owner = msg.sender;
        uint256 ownerBalance = balanceOf(owner);
        require (ownerBalance > 0, "No owned NFT.");
        uint256 tokenId;
        uint256[] memory tokenIDs = new uint256[](ownerBalance);
        uint256 index = 0;
        for (tokenId = 0; tokenId < _currentIndex; tokenId ++) {
            if (ownerOf(tokenId) == owner) {
                tokenIDs[index ++] = tokenId;
            }
        }

        return tokenIDs;
    }

    function getOfferedNFT() public view returns (Offering[] memory) {
        Offering[] memory offeredTokens = new Offering[](offeredCnt);
        uint256 i;
        uint256 tokenId = 0;
        for (i = 0; i < _currentIndex; i ++) {
            if (offers[i].status == true) 
                offeredTokens[tokenId ++] = offers[i];
        }
        return offeredTokens;
    }

    function placeOffering(uint256 tokenId_, uint256 price_) public checkOwner(msg.sender, tokenId_) {
        if (offers[tokenId_].status == true)
            revert AlreadyOffered();
        offeredCnt ++;
        ownerOfferedCnt[msg.sender] ++;
        offers[tokenId_] = Offering(
            msg.sender,
            price_,
            tokenId_,
            true
        );
    }

    function closeOffering(uint256 tokenId_) public checkOwner(msg.sender, tokenId_) {
        if (offers[tokenId_].status == false)
            revert NotOfferedNFT();
        
        offeredCnt --;
        ownerOfferedCnt[msg.sender] --;
        offers[tokenId_].status = false;
    }

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function getAux(address owner) public view returns (uint64) {
        return _getAux(owner);
    }

    function setAux(address owner, uint64 aux) public {
        _setAux(owner, aux);
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function safeMint(
        address to,
        uint256 quantity,
        bytes memory _data
    ) public {
        _safeMint(to, quantity, _data);
    }

    function mint(
        address to,
        uint256 quantity,
        bytes memory _data,
        bool safe
    ) public {
        _mint(to, quantity, _data, safe);
    }
}
