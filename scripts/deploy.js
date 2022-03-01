const { parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

//   this.ERC721A = await ethers.getContractFactory('ERC721AMock');
//   this.erc721a = await this.ERC721A.deploy('Azuki', 'AZUKI');
//   await this.erc721a.deployed();

//   console.log("AZUKI token address: ",this.erc721a.address);

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

   this.WyvernExchange = await this.WyvernExchange.deploy(50, [this.WyvernRegistry.address], '0x');
   await this.WyvernExchange.deployed();
   console.log("WyvernExchange address: ", this.WyvernExchange.address);

   await this.WyvernRegistry.grantInitialAuthentication(this.WyvernExchange.address);

   this.StaticMarket = await this.StaticMarket.deploy();
   await this.StaticMarket.deployed();
   console.log("StaticMarket address: ", this.StaticMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });