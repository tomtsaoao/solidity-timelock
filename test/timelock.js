const { expectRevert, time, constants } = require('@openzeppelin/test-helpers');

const Timelock = artifacts.require('Timelock.sol');
const MockToken = artifacts.require('MockToken.sol');

contract('Timelock', async accounts => {
    let timelock, token;
    const [deployer, owner, otherAddress, _] = accounts; 

    before(async () => {
        timelock = await Timelock.new(owner);
        token = await MockToken.new();
    });

    it('Should perform timelock and release on MockToken and ETther', async () => {
        let contractEtherBalance, contractTokenBalance, ownerTokenBalance;
        const etherTotal = web3.utils.toWei('1');
        const tokenTotal = web3.utils.toWei('1');

        await web3.eth.sendTransaction({
            from: owner,
            to: timelock.address,
            value: etherTotal
        });

        await token.approve(timelock.address, tokenTotal);
        await timelock.deposit(token.address, tokenTotal);

        contractEtherBalance = await web3.eth.getBalance(timelock.address);
        contractTokenBalance = await token.balanceOf(timelock.address);
        assert(contractEtherBalance.toString() === etherTotal);
        assert(contractTokenBalance.toString() === tokenTotal);

        await expectRevert(
            timelock.withdraw(token.address, tokenTotal, { from: otherAddress }),
            'only owner'
        );
        await expectRevert(
            timelock.withdraw(token.address, tokenTotal, { from: owner }),
            'too early '
        );

        await time.increase(time.duration.years(1));
        await timelock.withdraw(constants.ZERO_ADDRESS, etherTotal, { from: owner });
        await timelock.withdraw(token.address, tokenTotal, { from: owner });

        contractEtherBalance = await web3.eth.getBalance(timelock.address);
        contractTokenBalance = await token.balanceOf(timelock.address);
        ownerEtherBalance = await web3.eth.getBalance(owner);
        ownerTokenBalance = await token.balanceOf(owner);
        assert(contractEtherBalance.toString() === '0');
        assert(contractTokenBalance.toString() === '0');
        assert(ownerTokenBalance.toString() === tokenTotal);
        assert(ownerEtherBalance.toString().length === 20);
    });
});