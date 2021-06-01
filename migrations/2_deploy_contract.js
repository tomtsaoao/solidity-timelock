const Timelock = artifacts.require("Timelock");
const Token = artifacts.require("Token");

module.exports = async function (deployer, network, accounts) {
    const [admin, _] = accounts;

    if (network === 'bscTestnet' || network === 'develop') {
        await deployer.deploy(Timelock, admin);
        const contract = await Timelock.deployed();
    }

    if (network === 'bsc') {
        // Mainnet deployment logic
        await deployer.deploy(Timelock, admin);
        const contract = await Timelock.deployed();
    }
}
