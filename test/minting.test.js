const { expect } = require('chai');
const { ethers } = require('hardhat');

const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const nftABI = require('../artifacts/contracts/marketPlace.sol/MintingMarketPlace.json');
const erc20ABI = require('../artifacts/contracts/Wyvern/TestERC20.sol/TestERC20.json');

const {wrap,ZERO_BYTES32,CHAIN_ID,assertIsRejected} = require('./util')

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

      // it ('Offer and Close one NFT for sale.', async function () {
      //    const tokenIds = await this.erc721a.connect(this.addr3).getNFTByOwner();
      //    await this.erc721a.connect(this.addr3).placeOffering(tokenIds[0], 1000);
      //    let offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
      //    expect(offeredTokenIds.length).to.equal(1);

      //    await this.erc721a.connect(this.addr3).closeOffering(tokenIds[0]);
      //    offeredTokenIds = await this.erc721a.connect(this.addr3).getOfferedNFT();
      //    expect(offeredTokenIds.length).to.equal(0);
      // })
  })

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

        this.WyvernExchange = await this.WyvernExchange.deploy(CHAIN_ID, [this.WyvernRegistry.address], '0x');
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

     it ('Test erc721 for erc20.', async function () {
        const seller = this.addr1;
        const buyer = this.addr2;
        const sellPrice = 1500;
        const buyPrice = 1500;
        const buyTokenId = 1;

        await this.WyvernRegistry.connect(seller).registerProxy();
        const proxy1 = await this.WyvernRegistry.proxies(seller.address);
        console.log("proxy1 is ", proxy1);

        await this.WyvernRegistry.connect(buyer).registerProxy();
        const proxy2 = await this.WyvernRegistry.proxies(buyer.address);
        console.log("proxy2 is ", proxy2);

        await this.erc721a.connect(seller).approve(proxy1, buyTokenId);
        await this.TestERC20.connect(buyer).approve(proxy2, buyPrice);
        
        const selectorOne = web3.eth.abi.encodeFunctionSignature('ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)')
		  const selectorTwo = web3.eth.abi.encodeFunctionSignature('ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)')

        const paramsOne = web3.eth.abi.encodeParameters(
			['address[2]', 'uint256[2]'],
			[[this.erc721a.address, this.TestERC20.address], [buyTokenId, sellPrice]]
			) 
	
		  const paramsTwo = web3.eth.abi.encodeParameters(
			['address[2]', 'uint256[2]'],
			[[this.TestERC20.address, this.erc721a.address], [buyTokenId , buyPrice]]
			)

         const one = {
            registry: this.WyvernRegistry.address, 
            maker: buyer.address, 
            staticTarget: this.StaticMarket.address, 
            staticSelector: selectorOne, 
            staticExtradata: paramsOne, 
            maximumFill: 1, 
            listingTime: '0', 
            expirationTime: '10000000000', 
            salt: '11'
         }

         const two = {
            registry: this.WyvernRegistry.address, 
            maker: seller.address, 
            staticTarget: this.StaticMarket.address, 
            staticSelector: selectorTwo, 
            staticExtradata: paramsTwo, 
            maximumFill: 1, 
            listingTime: '0', 
            expirationTime: '10000000000', 
            salt: '12'
         }

         const web3ERC721a = new web3.eth.Contract(nftABI.abi, this.erc721a.address);
		   const web3TestERC20 = new web3.eth.Contract(erc20ABI.abi, this.TestERC20.address);

         const firstData = web3ERC721a.methods.transferFrom(seller.address, buyer.address, buyTokenId).encodeABI();
         const secondData = web3TestERC20.methods.transferFrom(buyer.address, seller.address, buyPrice).encodeABI();

         const firstCall = {
            target: this.erc721a.address, 
            howToCall: 0, 
            data: firstData
         }
		   const secondCall = {
            target: this.TestERC20.address, 
            howToCall: 0, 
            data: secondData
         }

         const exchange = wrap(this.WyvernExchange);

         try {
            let sigOne = await exchange.sign(one, seller.address);
         } catch(e) {
            console.log(e);
         }
		   // let sigTwo = await exchange.sign(two, to.address)

         // await exchange.atomicMatchWith(one, sigOne, firstCall, two, sigTwo, secondCall, ZERO_BYTES32,{from: from.address})
     })
  })
});

