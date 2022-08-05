import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import 'sf-font';
import axios from 'axios';
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, polygonscanapi, moralisapi } from './config';
import Web3Modal from "web3modal";
import Web3 from "web3";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

var account = null;
var contract = null;
var vaultcontract = null;
var web3 = null;
const gasOptions = { gasPrice: 150000000000, gasLimit: 500000 };

const Web3Alc = createAlchemyWeb3("https://eth-mainnet.g.alchemy.com/v2/W3CAcUSVv-z7zxqoiF3coq_6wUAXcsl8");

const moralisapikey = "JwcyI3kFcZIx9M9Psom0b0d2ahdb9VxmSs80MnYU43bbwX803Jufh0XzqYKbXzyg";
const polygonscanapikey = "JAR6HQQDTVZ3UQIHCUFHJ7MV2M5E6V2FFE";

const providerOptions = {
};

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

const web3Modal = new Web3Modal({
    network: "mainnet",
    theme: "dark",
    cacheProvider: false,
    providerOptions
});

class App extends Component {
    constructor() {
        super();
        this.state = {
            balance: [],
            rawearn: [],
        };
    }

    handleModal() {
        this.setState({ show: !this.state.show })
    }

    handleNFT(nftamount) {
        this.setState({ outvalue: nftamount.target.value });
    }

    async componentDidMount() {

        await axios.get((polygonscanapi + `?module=stats&action=tokensupply&contractaddress=${NFTCONTRACT}&apikey=${polygonscanapikey}`))
            .then(outputa => {
                this.setState({
                    balance: outputa.data
                })
                console.log(outputa.data)
            })
        let config = { 'X-API-Key': moralisapikey, 'accept': 'application/json' };
        await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=polygon&format=decimal`), { headers: config })
            .then(outputb => {
                const { result } = outputb.data
                this.setState({
                    nftdata: result
                })
                console.log(outputb.data)
            })
    }

    render() {
        async function connectwallet() {
            var provider = await web3Modal.connect();
            web3 = new Web3(provider);
            await provider.request({ method: 'eth_requestAccounts' });
            var accounts = await web3.eth.requestAccounts();
            account = accounts[0];
            document.getElementById('wallet-address').textContent = account;
            contract = new web3.eth.Contract(ABI, NFTCONTRACT);
            vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
            var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
            document.getElementById('yournfts').textContent = getstakednfts;
            var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
            document.getElementById('stakedbalance').textContent = getbalance;
            const arraynft = Array.from(getstakednfts.map(Number));
            const tokenid = arraynft.filter(Number);
            var rwdArray = [];
            tokenid.forEach(async (id) => {
                var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
                var array = Array.from(rawearn.map(Number));
                console.log(array);
                array.forEach(async (item) => {
                    var earned = item.toPrecision(22).split('.')[0]
                    var earnedrwd = Web3.utils.fromWei(earned);
                    var rewardx = Number(earnedrwd).toFixed(2);
                    var numrwd = Number(rewardx);
                    console.log(numrwd);
                    rwdArray.push(numrwd);
                });
            });
            function delay() {
                return new Promise(resolve => setTimeout(resolve, 300));
            }
            async function delayedLog(item) {
                await delay();
                var sum = item.reduce((a, b) => a + b, 0);
                var formatsum = Number(sum).toFixed(2);
                document.getElementById('earned').textContent = formatsum;
            }
            async function processArray(rwdArray) {
                for (const item of rwdArray) {
                    await delayedLog(item);
                }
            }
            return processArray([rwdArray]);
        }

        async function enable() {
            contract.methods.setApprovalForAll(STAKINGCONTRACT, true).send({ from: account, ...gasOptions });
        }
        async function rewardinfo() {
            var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
            const arraynft = Array.from(rawnfts.map(Number));
            const tokenid = arraynft.filter(Number);
            var rwdArray = [];
            tokenid.forEach(async (id) => {
                var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
                var array = Array.from(rawearn.map(Number));
                array.forEach(async (item) => {
                    var earned = item.toPrecision(22).split('.')[0];
                    var earnedrwd = Web3.utils.fromWei(earned);
                    var rewardx = Number(earnedrwd).toFixed(2);
                    var numrwd = Number(rewardx);
                    rwdArray.push(numrwd)
                    await sleep(100);
                });
            });
            function delay() {
                return new Promise(resolve => setTimeout(resolve, 300));
            }
            async function delayedLog(item) {
                await delay();
                var sum = item.reduce((a, b) => a + b, 0);
                var formatsum = Number(sum).toFixed(2);
                document.getElementById('earned').textContent = formatsum;
            }
            async function processArray(rwdArray) {
                for (const item of rwdArray) {
                    await delayedLog(item);
                }
            }
            return processArray([rwdArray]);
        }
        async function claimit() {
            var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
            const arraynft = Array.from(rawnfts.map(Number));
            const tokenid = arraynft.filter(Number);
            await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
                Web3Alc.eth.getBlock('pending').then((block) => {
                    tokenid.forEach(async (id) => {
                        await vaultcontract.methods.claim([id])
                            .send({
                                from: account,
                            })
                    })
                });
            })
        }
        async function unstakeall() {
            var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
            const arraynft = Array.from(rawnfts.map(Number));
            const tokenid = arraynft.filter(Number);
            await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
                Web3Alc.eth.getBlock('pending').then((block) => {
                    tokenid.forEach(async (id) => {
                        await vaultcontract.methods.unstake([id])
                            .send({
                                from: account,
                            })
                    })
                });
            })
        }
        return (
            <div className="container py-2 bg-black">
                <div className="App nftapp bg-black">
                    <div className="container">
                        <input id="connectbtn" type="button" className="connectbutton" onClick={connectwallet} style={{ backgroundColor: "#26A7DF", className: "nav-item d-flex align-content-center flex-wrap" }} value="Connect Your Wallet" />
                    </div>
                    <div className='container, bg-black'>
                        <div className='col, py-4'>
                            <div className=''>
                                <div>
                                    <div className="row">
                                        <div>
                                            <h1 className="pt-3" style={{ fontWeight: "30", color: "#ffffff", fontFamily: "Avenir LT Std" }}>MetaBadge Staking Platform</h1>
                                        </div>
                                        <h6 style={{ fontWeight: "300", color: "#ffffff", fontFamily: "Avenir LT Std" }}>Your Wallet Address</h6>
                                        <div className="pb-1" id='wallet-address' style={{
                                            color: "#4ac0e7",
                                            fontWeight: "600",
                                            textShadow: "1px 1px 1px black",
                                        }}>
                                            <label type="button" onClick={connectwallet} htmlFor="floatingInput">Please Connect Your Wallet</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col bg-black'>
                        <div className='nftstaker border-0 bg-black'>
                            <div style={{ fontFamily: "Avenir LT Std" }} >
                                <h2 className="pt-2" style={{ fontFamily: "Avenir LT Std", borderRadius: '14px', fontWeight: "400", color: "#ffffff", fontSize: "25px" }} id="Vault">MetaBadge Staking Vault </h2>
                                <h6 style={{ fontWeight: "300", color: "#ffffff", fontFamily: "Avenir LT Std" }}>First time staking?</h6>
                                <button className="btn" onClick={enable}
                                style={{ backgroundColor: "#26A7DF", boxShadow: "1px 1px 5px #4ac0e7", color: "#ffffff", fontFamily: "Avenir LT Std" }}
                                >Authorize Your Wallet</button>
                                <div className="row mt-2 px-3 pt-1">
                                    <div className="col-sm-4 col-center-block">
                                        <div className="stakingrewards" style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #4ac0e7" }}>
                                            <h5 style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: '300', paddingTop: 15 }}>Vault Activity</h5>
                                            <table className='table mb-5 px-3 table-dark wrap-nft'>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ fontSize: "0px", border: "transparent", background: 'transparent', paddingTop: 1, paddingBottom: 1 }}>
                                                            <span style={{ backgroundColor: "#ffffff00", fontSize: "0px", color: "#D53790", fontWeight: "0", textShadow: "1px 1px 2px #000000" }} id='yournfts'></span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontSize: "19px", border: "transparent", background: 'transparent', paddingTop: 1, paddingBottom: 1 }}>Total Staked NFTs:<br></br>
                                                            <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#D53790", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='stakedbalance'>Total Staked</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontSize: "19px", background: 'transparent' }}>
                                                            <button onClick={unstakeall}
                                                            style={{ backgroundColor: "#D53790", boxShadow: "1px 1px 5px #4ac0e7", color: "#ffffff", fontFamily: "Avenir LT Std"  }}className='btn mb-4'
                                                            >Unstake All</button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <img className="img-fluid col-sm-3 col-center-block" src="metabadges.png" width="" height="" alt="Responsive" />
                                    <div className="col-sm-4 col-center-block">
                                        <div className='stakingrewards' style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #4ac0e7", fontFamily: "Avenir LT Std" }}>
                                            <h5 style={{ color: "#FFFFFF", fontSize: "15px", fontWeight: '300', paddingTop: 15 }}>Rewards Activity</h5>
                                            <div style={{ border: "transparent", background: "transparent" }} >Refresh OSIS Rewards
                                                <button style={{ border: "none", background: "transparent" }} >
                                                    <img src="refresh.png" width="" height="15" background="transparent" border="transparent" alt="" onClick={rewardinfo} />
                                                </button>
                                            </div>
                                            <div id='earned' style={{ color: "#D53790", fontSize: '21px', fontWeight: '500', textShadow: "1px 1px 2px #000000" }}><p >Earned Tokens</p>
                                            </div>
                                            <div>
                                                <button onClick={claimit}
                                                style={{ backgroundColor: "#D53790", boxShadow: "1px 1px 5px #4ac0e7", color: "#ffffff", fontFamily: "Avenir LT Std" }} className="btn mb-4 mt-1"
                                                >Claim Rewards</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row px-4 pt-2">
                                    <div className="header">
                                        <div className='col bg-black'></div>
                                        <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "300" }}>Staking Pool Active Rewards</div>
                                        <h1>
                                        </h1>
                                        <table style={{ boxShadow: "1px 1px 15px #4ac0e7" }} className='table px-3 table-bordered table-dark' >
                                            <thead className='thead-light'>
                                                <tr>
                                                    <th scope="col">Collection</th>
                                                    <th scope="col">Rewards Per Day</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Standard MetaBadge</td>
                                                    <td className="amount" data-test-id="rewards-summary-ads">
                                                        <span className="amount">1</span>&nbsp;<span className="currency">OSIS</span>
                                                    </td>
                                                </tr>
                                                <tr className='stakegoldeffect'>
                                                    <td>Rare / Super Rare MetaBadge</td>
                                                    <td className="amount " data-test-id="rewards-summary-ac">
                                                        <span className="amount">2</span>&nbsp;<span className="currency">OSIS</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <a href="/OSIS_Rewards.pdf" target="_blank" rel="noreferrer"
                                            className="'mb-3 mt-3 bg-black'"
                                            style={{ backgroundColor: "#000000", boxShadow: "0px 0px 0px #4ac0e7", fontWeight: "300", fontSize: '20px', color: "#ffffff", fontFamily: "Avenir LT Std" }}>
                                            OSIS Rewards List
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col mt-3 bg-black' id="NFT">
                        <div className='col bg-black'>
                            <h1 className=' mb-3 mt-5 bg-black'>MetaBadge Portal</h1>
                            <div className='col mt-3 ml-3 bg-black'>
                                <img src="polygon.png" width={'15%'} height="" alt="" ></img>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default App;