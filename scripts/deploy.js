const { parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  const deployERC20 = false;
  const deployERC721 = false;
  const deployWyvern = true;
  const chainID_ropsten = 3;
  const chainID_rinkeby = 4;
  const chainID_mumbai = 80001;

  console.log("Deploying contracts with the account:", deployer.address);

  if (deployERC20 == true) {
    this.MockERC20 = await ethers.getContractFactory('MockERC20');
    this.MockERC20 = await this.MockERC20.deploy("TEST", "TST", BigInt(10**6 * 10**18));
    await this.MockERC20.deployed();

    console.log("ERC20 token address is ", this.MockERC20.address);
  } 

  if (deployERC721 == true) {
    this.ERC721A = await ethers.getContractFactory('MintingMarketPlace');
    this.erc721a = await this.ERC721A.deploy('Azuki', 'AZUKI');
    await this.erc721a.deployed();

    await this.erc721a.setBaseURI("https://gateway.pinata.cloud/ipfs/QmYejVD4kmpv74JoieBedEX5Ba9Nj91DWy2635Q8zg4z9f/");
  
    console.log("AZUKI token address: ",this.erc721a.address);
  }

  if (deployWyvern == true) {
    this.WyvernAtomicizer = await ethers.getContractFactory('WyvernAtomicizer');
    this.WyvernExchange = await ethers.getContractFactory('WyvernExchange');
    this.StaticMarket = await ethers.getContractFactory('StaticMarket');
    this.WyvernRegistry = await ethers.getContractFactory('WyvernRegistry');
 
    this.WyvernAtomicizer = await this.WyvernAtomicizer.deploy();
    await this.WyvernAtomicizer.deployed();
    console.log("WyvernAtomicizer address: ", this.WyvernAtomicizer.address);
 
    this.WyvernRegistry = await this.WyvernRegistry.deploy();
    await this.WyvernRegistry.deployed();
    console.log("WyvernRegistry address: ", this.WyvernRegistry.address);
 
    this.WyvernExchange = await this.WyvernExchange.deploy(chainID_ropsten, [this.WyvernRegistry.address], '0x');
    await this.WyvernExchange.deployed();
    console.log("WyvernExchange address: ", this.WyvernExchange.address);
 
    await this.WyvernRegistry.grantInitialAuthentication(this.WyvernExchange.address);
 
    this.StaticMarket = await this.StaticMarket.deploy();
    await this.StaticMarket.deployed();
    console.log("StaticMarket address: ", this.StaticMarket.address);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });