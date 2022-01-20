const { ethers, utils, BigNumber } = require('ethers');
const axios = require("axios")

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

async function getDAOfriends() {

    let ccQuery = await axios({
        url: ccAPI,
        method: 'post',
        data: {
            query: `
          query {
            identity(address: "0x8ddD03b89116ba89E28Ef703fe037fF77451e38E") {
              ens
              address
              followingCount
              followerCount
              followers {
                list {
                  address
                }
              }
              followings {
                list{
                  address
                }
              }
            }
          }
            `
        }
    });
    const followers = ccQuery.data['data']['identity']['followings']['list'].map((x) => { return x['address']; });

    const DAOfollowers = await filter(followers, async follower => {
        return await isMember(follower);
    })

    return DAOfollowers
}

async function main() {
    console.log(await getDAOfriends());
}

main()