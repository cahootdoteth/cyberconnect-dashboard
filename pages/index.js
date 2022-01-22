import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  DAOaddress
} from '../config'

import Head from 'next/head'
import Link from 'next/link'


export default function Home() {
  const [name, setName] = useState([])
  const [friends, setFriends] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    getFriends()
  }, [])

  async function filter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
  }

  async function isMember(address, dao) {
    const governanceBalance = await dao.balanceOf(address);

    if (governanceBalance.toString() > 0) { return true; }
    return false;
  }

  async function getFriends() {

    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const ccAPI = 'https://api.cybertino.io/connect/';
    const signerAddress = '0x7C04786F04c522ca664Bb8b6804E0d182eec505F';
    //const signerAddress = await signer.getAddress();

    let ccQuery = await axios({
      url: ccAPI,
      method: 'post',
      data: {
        query: `
          query {
            identity(address: "${signerAddress}") {
              ens
              address
              followingCount
              followerCount
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

    if (ccQuery.data['data']['identity']['ens'].length != 0) {
      setName(ccQuery.data['data']['identity']['ens'])
    } else {
      setName(signerAddress.slice(0, 5) + '...' + signerAddress.slice(-4))
    }

    let followers = ccQuery.data['data']['identity']['followings']['list'].map((x) => { return x['address']; });

    followers = await Promise.all(followers.map(async (x) => {
      let friendQuery = await axios({
        url: ccAPI,
        method: 'post',
        data: {
          query: `
            query {
              identity(address: "${x}") {
                ens
                followingCount
                followerCount
               }
              }
          `}
      })
      let friend = {
        'address': x,
        'followingCount': friendQuery.data['data']['identity']['followingCount'],
        'followerCount': friendQuery.data['data']['identity']['followerCount']
      }

      if (friendQuery.data['data']['identity']['ens'].length != 0) {
        friend['name'] = friendQuery.data['data']['identity']['ens']
      } else {
        friend['name'] = x.slice(0, 5) + '...' + x.slice(-4)
      }

      return friend
    }))

    setFriends(followers)
    setLoadingState('loaded')
  }

  async function getDAOfriends() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const ccAPI = 'https://api.cybertino.io/connect/';

    const abi = ['function balanceOf(address) public view returns (uint256)'];
    const dao = new ethers.Contract(DAOaddress, abi, provider);

    const signerAddress = '0x7C04786F04c522ca664Bb8b6804E0d182eec505F';
    //const signerAddress = await signer.getAddress();

    let ccQuery = await axios({
      url: ccAPI,
      method: 'post',
      data: {
        query: `
          query {
            identity(address: "${signerAddress}") {
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

    if (ccQuery.data['data']['identity']['ens'].length != 0) {
      setName(ccQuery.data['data']['identity']['ens'])
    } else {
      setName(signerAddress.slice(0, 5) + '...' + signerAddress.slice(-4))
    }

    const followers = ccQuery.data['data']['identity']['followings']['list'].map((x) => { return x['address']; });

    let DAOfollowers = await filter(followers, async follower => {
      return await isMember(follower, dao);
    })

    DAOfollowers = await Promise.all(DAOfollowers.map(async (x) => {
      let friendQuery = await axios({
        url: ccAPI,
        method: 'post',
        data: {
          query: `
            query {
              identity(address: "${x}") {
                ens
                followingCount
                followerCount
               }
              }
          `}
      })
      let friend = {
        'address': x,
        'followingCount': friendQuery.data['data']['identity']['followingCount'],
        'followerCount': friendQuery.data['data']['identity']['followerCount']
      }

      console.log(x)

      if (friendQuery.data['data']['identity']['ens'].length != 0) {
        friend['name'] = friendQuery.data['data']['identity']['ens']
      } else {
        friend['name'] = x.slice(0, 5) + '...' + x.slice(-4)
      }

      return friend
    }))

    setFriends(DAOfollowers)
    setLoadingState('loaded')
  }

  if (loadingState == 'loaded' && !friends.length) return (
    <h1 className="px-20 py-10 text-3xl">None of your friends are in this DAO</h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <h3>Your followings</h3>
        <br />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            friends.map((friend, i) => (
              <Link href={{ pathname: '/user/[address]', query: { address: friend.address } }} as={`user/${friend.address}`}>
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <div className="p-4">
                    <p style={{ height: '64px' }} className="text-2xl font-semibold">{friend.name}</p>
                    <div style={{ height: '70px', overflow: 'hidden' }}>
                      <p className="text-gray-400">Followers: {friend.followerCount}</p>
                      <p className="text-gray-400">Following: {friend.followingCount}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div >
  )
}