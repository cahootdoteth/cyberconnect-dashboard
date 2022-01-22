import '../styles/globals.css'
import Link from "next/link"
import Head from 'next/head'
import ConnectButton from '../components/connect-button'

import {
  DAOaddress
} from '../config'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <div className="flex justify-between">
          <p className="text-4xl font-bold">Cyberscan</p>
          <ConnectButton />
        </div>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-pink-500">
              Home
            </a>
          </Link>
          <Link href="/members">
            <a className="mr-6 text-pink-500">
              Top members
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">
              View Digital Assets
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">
              Creator Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp