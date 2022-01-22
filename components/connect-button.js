import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    DAOaddress
} from '../config'

import Head from 'next/head'
import Link from 'next/link'

const ConnectButton = () => {

    const [address, setAddress] = useState()

    useEffect(() => {
        getAddress()
    }, [])

    async function getAddress() {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        let signerAddress = await signer.getAddress()

        signerAddress = signerAddress.slice(0, 5) + '...' + signerAddress.slice(-4)
        setAddress(signerAddress)
    }

    return (
        <button className="bg-transparent hover:bg-blue-700 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
            Connected as {address}
        </button>
    )
}

export default ConnectButton;