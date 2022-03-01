const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ethers } = require('hardhat');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';
const GAS_MAGIC_VALUE = 20000;

describe('ERC721A', function () {
  before(async function () {

    [
       this.owner,
       this.addr1,
       this.addr2,
       this.addr3
    ] = await ethers.getSigners();

    this.ERC721A = await ethers.getContractFactory('ERC721AMock');
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
    this.erc721a = await this.ERC721A.deploy('Azuki', 'AZUKI');
    await this.erc721a.deployed();
  });

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
});

