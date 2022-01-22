import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    DAOaddress
} from '../config'

import Head from 'next/head'
import Link from 'next/link'
import { withRouter } from 'next/router';


export default function Members() {
    const [name, setName] = useState([])
    const [members, setMembers] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        getMembers()
    }, [])

    async function filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
    }

    async function getMembers() {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const ccAPI = 'https://api.cybertino.io/connect/';

        const memberQuery = await axios.get(`https://api.ethplorer.io/getTopTokenHolders/${DAOaddress}?apiKey=freekey&limit=20`);

        let memberList = memberQuery.data['holders'].map((x) => { return x['address']; });

        memberList = await Promise.all(memberList.map(async (x) => {
            let memberQuery = await axios({
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
            let member = {
                'address': x,
                'followingCount': memberQuery.data['data']['identity']['followingCount'],
                'followerCount': memberQuery.data['data']['identity']['followerCount']
            }

            if (memberQuery.data['data']['identity']['ens'].length != 0) {
                member['name'] = memberQuery.data['data']['identity']['ens']
            } else {
                member['name'] = x.slice(0, 5) + '...' + x.slice(-4)
            }

            return member
        }))

        setMembers(memberList)
        setLoadingState('loaded')
    }


    if (loadingState == 'loaded' && !members.length) return (
        <h1 className="px-20 py-10 text-3xl">You are not following anyone yet!</h1>
    )

    return (
        <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: '1600px' }}>
                <br />
                <div className="grid grid-cols-5 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        members.map((friend, i) => (
                            <Link href='user' as={`user/${friend.name}`} address={friend.name}>
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
        </div>
    )
}
