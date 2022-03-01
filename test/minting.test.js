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

    this.ERC721A = await ethers.getContractFactory('ERC721AMock');
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
    this.erc721a = await this.ERC721A.deploy('Azuki', 'AZUKI');
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
         await this.erc721a.connect(this.addr3).placeOffering(tokenIds[0], 1000);
         let offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
         expect(offeredTokenIds.length).to.equal(1);

         await this.erc721a.connect(this.addr3).closeOffering(tokenIds[0]);
         offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
         expect(offeredTokenIds.length).to.equal(0);
      })
  })

  
/*
  context ('Test WyvernToken', async function () {
     before(async function () {
        this.WyvernAtomicizer = await ethers.getContractFactory('WyvernAtomicizer');
        this.WyvernExchange = await ethers.getContractFactory('WyvernExchange');
        this.StaticMarket = await ethers.getContractFactory('StaticMarket');
        this.WyvernRegistry = await ethers.getContractFactory('WyvernRegistry');
        this.TestERC20 = await ethers.getContractFactory('TestERC20');
        this.TestERC721 = await ethers.getContractFactory('TestERC721');
        this.TestERC1155 = await ethers.getContractFactory('TestERC1155');

        this.WyvernAtomicizer = await this.WyvernAtomicizer.deploy();
        await this.WyvernAtomicizer.deployed();

        this.WyvernRegistry = await this.WyvernRegistry.deploy();
        await this.WyvernRegistry.deployed();

        this.WyvernExchange = await this.WyvernExchange.deploy(50, [this.WyvernRegistry.address], '0x');
        await this.WyvernExchange.deployed();

        await this.WyvernRegistry.grantInitialAuthentication(this.WyvernExchange.address);

        this.StaticMarket = await this.StaticMarket.deploy();
        await this.StaticMarket.deployed();

        this.TestERC20 = await this.TestERC20.deploy();
        await this.TestERC20.deployed();

        this.TestERC721 = await this.TestERC721.deploy();
        await this.TestERC721.deployed();

        this.TestERC1155 = await this.TestERC1155.deploy();
        await this.TestERC1155.deployed();
     })

     it ('Test erc1155 for erc20.', async function () {
        const from = this.addr1;
        const to = this.addr2;
        const erc20MintAmount = 10;
        const buyTokenId = 1;

        await this.WyvernRegistry.connect(from).registerProxy();
        const proxy1 = await this.WyvernRegistry.proxies(from.address);
        console.log(`proxy1 is ${proxy1.address}`);
        
        await this.WyvernRegistry.connect(to).registerProxy();
        const proxy2 = await this.WyvernRegistry.proxies(to.address);
        console.log(`proxy2 is ${proxy2.address}`);

        await this.erc721a.connect(from).setApprovalForAll(proxy1.address, true);
        await this.TestERC20.connect(to).approve(proxy2,erc20MintAmount);

        
     })
  })*/
});

