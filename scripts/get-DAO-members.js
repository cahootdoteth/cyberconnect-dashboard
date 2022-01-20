const { ethers, utils, BigNumber } = require('ethers');

const DAOaddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // USDC mainnet address for now
const userAddress = '0x0';
const ccAPI = 'https://api.cybertino.io/connect/';
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/2d6f7c98fc494010b47f4c6d403f0a23");

async function filter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
}

async function isMember(address) {
    const abi = ['function balanceOf(address) public view returns (uint256)'];
    const dao = new ethers.Contract(DAOaddress, abi, provider);

    const governanceBalance = await dao.balanceOf(address);

    if (governanceBalance.toString() > 0) { return true; }
    return false;
}

async function main() {

    // add GraphQL query
    let ccQuery = {
        "followings": {
            "list": [
                {
                    "address": "0x01eacadf51ff60916157e32a58f640fe854e530f"
                },
                {
                    "address": "0x03027d7312e7fb96447067ab5590de0ca1c4bf62"
                },
                {
                    "address": "0x04048239f7c525989022e0dc7f988565dedcd1e4"
                },
                {
                    "address": "0x0724b23bf45d7cb81c128681ec17d2e98eb9b0f2"
                },
                {
                    "address": "0x0aa5973f2614dccfbe53c8273da22502d7e4fbd5"
                },
                {
                    "address": "0x85367ad4388db08Ed6cCa3471eFc9d99ba9BBB41"
                }]
        }
    };

    const followers = ccQuery['followings']['list'].map((x) => { return x['address']; });

    const DAOfollowers = await filter(ccQuery['followings']['list'], async follower => {
        return await isMember(follower['address']);
    })


    console.log("Followings in the DAO: ", DAOfollowers)
}

main()