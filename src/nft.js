import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useEffect, useState } from 'react'
import axios from 'axios';
import VAULTABI from './VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, moralisapi, nftpng } from './config';
import Web3Modal from "web3modal";
import Web3 from "web3";

var web3 = null;
var account = null;
var vaultcontract = null;
var provider = null;
const gasOptions = { gasPrice: 75000000000, gasLimit: 500000 };

const moralisapikey = "JwcyI3kFcZIx9M9Psom0b0d2ahdb9VxmSs80MnYU43bbwX803Jufh0XzqYKbXzyg";
const providerOptions = {
};

const web3Modal = new Web3Modal({
    network: "mainnet",
    theme: "dark",
    cacheProvider: false,
    providerOptions
});

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export default function NFT() {
    const [apicall, getNfts] = useState([])
    const [nftstk, getStk] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [stakeLoading, setStakeLoading] = useState({});
    const [unstakeLoading, setUnstakeLoading] = useState({});

    useEffect(() => {callApi()}, []);

    const switchNetwork = async (chainId) => {
        if (![137, '0x89', '137'].includes(chainId)) {
            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x89' }],
                });
                await callApi();
                return { msg: 'Change Network Successfull' };
            } catch (e) {
                console.log('error switchNetwork', e);
            }
        }
    }

    async function getNextNftPage(cursor) {
        let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
        return await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=polygon&format=decimal&limit=100&cursor=${cursor}`), { headers: config });
    }

    async function callApi() {
        provider = await web3Modal.connect();
        provider.on('chainChanged', switchNetwork);
        web3 = new Web3(provider);
        await provider.request({ method: 'eth_requestAccounts' });
        var accounts = await web3.eth.requestAccounts();
        account = accounts[0];
        switchNetwork(provider.chainId);
        vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT)
        let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
        const nftsRes = await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=polygon&format=decimal&limit=100`), { headers: config });

        const nfts = nftsRes.data.result;
        console.log("nfts res: ", nfts);

        let cursor = nftsRes.data.cursor;
        const numLoop = Math.floor(nftsRes.data.total / nftsRes.data.page_size);
        console.log("num loop: ", numLoop);
        for (let x = 0; x < numLoop - 1; x++) {
            await sleep(75);
            const nextPageRes = await getNextNftPage(cursor);
            await sleep(75);
            console.log(`Page[${x}]: `,);
            await sleep(75);
            cursor = nextPageRes.data.cursor;
            await sleep(75);
            // nfts.concat(nextPageRes.data.result);
            nextPageRes.data.result.forEach((e) => {
                nfts.push(e);
            });
        }

        console.log("all 10000, nft: ", nfts.length);

        const apicall = await Promise.all(nfts.map(async i => {
            let item = {
                tokenId: i.token_id,
                holder: i.owner_of,
                wallet: account,
            }
            return item
        }))
        const stakednfts = await vaultcontract.methods.tokensOfOwner(account).call()
            .then(id => {
                return id;
            })
        const nftstk = await Promise.all(stakednfts.map(async i => {
            let stkid = {
                tokenId: i,
            }
            return stkid
        }))
        getNfts(apicall)
        getStk(nftstk)
        console.log(apicall);
        console.log(nftstk)
        setLoadingState('loaded')
    }
    console.log('check', { loadingState, apicall, nftstk });
    if (loadingState === 'loaded' && !apicall.length) {
        return (<h1 className="text-3xl">Wallet Not Connected</h1>)
    }

    console.log({ stakeLoading, unstakeLoading })

    return (
        <div className='container mb-4 bg-black'>
            <div className="container nftportal bg-black">
                    <div className="mb-3 mt-3 bg-black">
                        <div className="row items px-5 pt-1">
                            <h3 className="center progress-title">Manifesting...</h3>
                            <div className="progress progress-striped">
                                <div className="nftportal progress-bar"></div>
                            </div>
                        </div>
                    </div>
                    <div className="row items px-5 pt-1">
                    <div className="ml-3 mr-3 bg-black" style={{ display: "inline-grid", gridColumnEnd: "auto", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", columnGap: "10px" }}>
                        {apicall.map((nft, i) => {
                            const owner = nft.wallet.toLowerCase();
                            const holder = nft.holder.toLowerCase();
                            if (owner.indexOf(holder) !== -1) {
                                async function stakeit() {
                                    setStakeLoading({ [i]: true });
                                    await vaultcontract.methods.stake([nft.tokenId]).send({ from: account, ...gasOptions });
                                    setTimeout(async () => {
                                        await callApi();
                                        setStakeLoading({ [i]: false });
                                    }, 22000);
                                }
                                return (
                                    <div className="card nft-card mt-3 mb-3" key={i} >
                                        <div className="image-over">
                                            <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="" />
                                        </div>
                                        <div className="card-caption col-12 p-0">
                                            <div className="card-body">
                                                <h5 className="mb-0">OSIS MetaBadges<br></br> #{nft.tokenId}</h5>
                                                <h5 className="mb-0 mt-2">Status<p style={{ color: "#6db647", fontWeight: "bold", textShadow: "1px 1px 2px #000000" }}>Ready to Stake</p></h5>
                                                <div className="card-bottom d-flex justify-content-between">
                                                    <input key={i} type="hidden" id='stakeid' value={nft.tokenId} />
                                                    <Button style={{ marginLeft: '2px', backgroundColor: "#ffffff10" }} onClick={stakeit}>{stakeLoading[i] ? 'Staking...' : 'Stake it'}</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                        {nftstk.map((nft, i) => {
                            async function unstakeit() {
                                setUnstakeLoading({ [i]: true });
                                vaultcontract.methods.unstake([nft.tokenId]).send({ from: account, ...gasOptions });
                                setTimeout(async () => {
                                    await callApi();
                                    setUnstakeLoading({ [i]: false });
                                }, 22000);
                            }
                            return (
                                <div key={i}>
                                    <div className="card stakedcard mt-3 mb-3" >
                                        <div className="image-over">
                                            <img style={{ position: 'absolute', top: '0.05rem', width: '50px' }} src='metabadges.png' width="" height="" alt="" ></img>
                                            <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="" />
                                        </div>
                                        <div className="card-caption col-12 p-0">
                                            <div className="card-body">
                                                <h5 className="mb-0">OSIS MetaBadges<br></br> #{nft.tokenId}</h5>
                                                <h5 className="mb-0 mt-2">Status<p style={{ color: "#15F4EE", fontWeight: "bold", textShadow: "1px 1px 2px #000000" }}>Currently Staked</p></h5>
                                                <div className="card-bottom d-flex justify-content-between">
                                                    <input type="hidden" id='stakeid' value={nft.tokenId} />
                                                    <Button style={{ marginLeft: '2px', backgroundColor: "#ffffff10" }} onClick={unstakeit}>{unstakeLoading[i] ? 'Unstaking...' : 'Unstake it'}</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}