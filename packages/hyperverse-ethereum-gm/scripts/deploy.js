const hre = require('hardhat');
const main = async () => {
  const hyperverseAdmin = '0xD847C7408c48b6b6720CCa75eB30a93acbF5163D';
  // const GM = await hre.ethers.getContractFactory('GoodMorning');
  // const gm = await GM.deploy(hyperverseAdmin);
  // await gm.deployed();
  // console.log(`GM deployed to: ${gm.address}`);

  const Factory = await hre.ethers.getContractFactory('GoodMorningFactory');
  const gmFactory = await Factory.deploy('0x7E092A6CEd10DDc6bcae3e82D84374ee79715493', hyperverseAdmin);
  await gmFactory.deployed();
  console.log('Good Mornign Factory deployed to: ', gmFactory.address);

//0x7E092A6CEd10DDc6bcae3e82D84374ee79715493
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();