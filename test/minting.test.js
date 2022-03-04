const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ERC721A', function () {
  before(async function () {
    [
       this.owner,
       this.addr1,
       this.addr2,
       this.addr3
    ] = await ethers.getSigners();

    this.erc721a = await ethers.getContractFactory('MintingMarketPlace');
    this.erc721a = await this.erc721a.deploy('Azuki', 'AZUKI');
    await this.erc721a.deployed();
  });

  context ('Test ERC721A', async function () {
      it ('Check basic features of ERC721A token.', async function () {
         const supply = await this.erc721a.totalSupply();
         expect(supply).to.equal(0);
         const name = await this.erc721a.name();
         expect(name).to.equal('Azuki');
         const symbol = await this.erc721a.symbol();
         expect(symbol).to.equal('AZUKI');
      })

      it ('Mint 6 NFT tokens.', async function() {
         await this.erc721a['safeMint(address,uint256)'](this.addr1.address, 1);
         await this.erc721a['safeMint(address,uint256)'](this.addr2.address, 2);
         await this.erc721a['safeMint(address,uint256)'](this.addr3.address, 3);
      })

      it ('Transfer NFT tokens.', async function () {
         const tokenId = 1;
         await this.erc721a.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
         await this.erc721a.connect(this.addr2).transferFrom(this.addr2.address, this.addr1.address, tokenId);

         let balance = await this.erc721a.balanceOf(this.addr1.address);
         expect(balance).to.equal(balance, 2);
         balance = await this.erc721a.balanceOf(this.addr2.address);
         expect(balance).to.equal(balance, 1);
         expect(await this.erc721a.ownerOf(tokenId)).to.equal(this.addr1.address);
      })

      it ('Set baseURI and get tokenURI.', async function () {
         const baseURI = 'https://gateway.pinata.cloud/ipfs/QmUpPQGSoydwBzpL8D6PBbANLCuCEsSSJM5nvTy22ECGot/';
         await this.erc721a.setBaseURI(baseURI);
         const tokenId = 1;
         const tokenURI = await this.erc721a.tokenURI(tokenId);
         expect(tokenURI).to.equal(baseURI.concat(tokenId.toString()));
      })

      it ('List all NFT that addr3 owned.', async function () {
         const tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
         expect(tokenIds.length).to.equal(await this.erc721a.balanceOf(this.addr3.address));
      })

      it ('Offer and Close one NFT for sale.', async function () {
         const tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
         await this.erc721a.connect(this.addr3).placeOffering(tokenIds[0].tokenId, 1000, '');
         let offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
         expect(offeredTokenIds.length).to.equal(1);

         await this.erc721a.connect(this.addr3).closeOffering(tokenIds[0].tokenId);
         offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
         expect(offeredTokenIds.length).to.equal(0);
      })

      it ('Offer and buy NFT.', async function () {
         let tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
         const sellTokenId = tokenIds[0].tokenId;
         await this.erc721a.connect(this.addr3).placeOffering(sellTokenId, 1000, '');
         let offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
         expect(offeredTokenIds.length).to.equal(1);

         await this.erc721a.connect(this.addr3).transferFrom(this.addr3.address, this.addr2.address, sellTokenId);
         tokenIds = await this.erc721a.connect(this.addr2).getNFTByOwner();
         expect(tokenIds.length).to.equal(2);
         tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
         expect(tokenIds.length).to.equal(2);

         const offeredNFT = await this.erc721a.getOfferedNFT();
         expect(offeredNFT.length).to.equal(0);
      })

      it ('Offer two NFT tokens and buy only one NFT token.', async function () {
         let tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
         const sellTokenId_1 = tokenIds[0].tokenId;
         const sellTokenId_2 = tokenIds[1].tokenId;
         await this.erc721a.connect(this.addr3).placeOffering(sellTokenId_1, 1000, '');
         await this.erc721a.connect(this.addr3).placeOffering(sellTokenId_2, 1000, '');
         let offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
         expect(offeredTokenIds.length).to.equal(2);

         await this.erc721a.connect(this.addr3).transferFrom(this.addr3.address, this.addr2.address, sellTokenId_1);
         tokenIds = await this.erc721a.connect(this.addr2).getNFTByOwner();
         expect(tokenIds.length).to.equal(3);
         tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
         expect(tokenIds.length).to.equal(1);

         const offeredNFT = await this.erc721a.getOfferedNFT();
         expect(offeredNFT.length).to.equal(1);
         expect(offeredNFT[0].tokenId).to.equal(sellTokenId_2);
      })
  })
});

