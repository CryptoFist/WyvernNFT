// SPDX-License-Identifier: MIT
// Creators: Chiru Labs

pragma solidity ^0.8.4;

import "./ERC721A.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import 'hardhat/console.sol';

contract MintingMarketPlace is ERC721A, ReentrancyGuard {
   error AlreadyOffered();
   error NotOfferedNFT();

   struct Offering {
      address owner;
      uint256 price;
      uint256 tokenId;
      string sign;
      bool forSale;
   }

   struct NFTInfo {
      uint256 tokenId;
      bool forSale;
   }

   modifier checkOwner(address sender_, uint256 tokenId_) {
      require(sender_ == ownerOf(tokenId_), "Azuki: caller is not token owner");
      _;
   }

   mapping(address => uint256) private ownerOfferedCnt;
   mapping(uint256 => Offering) private offers;
   uint256 private offeredCnt;

   constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

   /**
   @dev get NFT tokens owned by user
   */
   function getNFTByOwner() public view returns (NFTInfo[] memory) {
      address owner = msg.sender;
      uint256 ownerBalance = balanceOf(owner);
      NFTInfo[] memory ownedNFTs = new NFTInfo[](ownerBalance);

      if (ownerBalance == 0) {
         return ownedNFTs;
      }

      uint256 tokenId;
      uint256 index = 0;

      for (tokenId = 0; tokenId < _currentIndex; tokenId ++) {
         if (ownerOf(tokenId) == owner) {
            ownedNFTs[index].forSale = offers[tokenId].forSale;
            ownedNFTs[index ++].tokenId = tokenId;
         }
      }
      return ownedNFTs;
   }

   /**
   @dev get offered NFT by tokenID
    */
   function getOfferedNFTByTokenID(uint256 tokenId_) external view returns (Offering memory) {
      Offering memory offeredNFT = offers[tokenId_];
      require (offeredNFT.forSale == true, "Not offered token.");

      return offeredNFT;
   }

   /**
   @dev get all offered for sale NFT tokens.
    */
   function getOfferedNFT() public view returns (Offering[] memory) {
      Offering[] memory offeredTokens = new Offering[](offeredCnt);
      uint256 i;
      uint256 tokenId = 0;
      for (i = 0; i < _currentIndex; i ++) {
         if (offers[i].forSale == true) {
            offeredTokens[tokenId ++] = offers[i];
         }
      }
      return offeredTokens;
   }

   /**
   @dev offer for sale with tokenId and price that user wants.
    */
   function placeOffering(uint256 tokenId_, uint256 price_, string memory sign_) public nonReentrant checkOwner(msg.sender, tokenId_) {
      if (offers[tokenId_].forSale == true) {
         revert AlreadyOffered();
      }

      offeredCnt ++;
      ownerOfferedCnt[msg.sender] ++;

      offers[tokenId_] = Offering(
         msg.sender,
         price_,
         tokenId_,
         sign_,
         true
      );
   }

   /**
   @dev close offer for sale.
    */
   function closeOffering(uint256 tokenId_) public nonReentrant checkOwner(msg.sender, tokenId_) {
      if (offers[tokenId_].forSale == false) {
         revert NotOfferedNFT();
      }
        
      offeredCnt --;
      ownerOfferedCnt[msg.sender] --;

      offers[tokenId_].forSale = false;
   }

   /**
   @dev change forSale status when token transfers.
    */
   function _beforeTokenTransfers(
      address from_,
      address to_,
      uint256 startTokenId_,
      uint256 quantity_
   ) internal virtual override {
      require (from_ != to_, "Can't transfer to same owner.");

      // check only this function is called from _transfer
      if (quantity_ == 1) {
         if (offers[startTokenId_].forSale == true) {
            offers[startTokenId_].owner = to_;
            offers[startTokenId_].forSale = false;
            offeredCnt --;
         }
      }
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
