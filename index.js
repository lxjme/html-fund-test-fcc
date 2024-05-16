import { ethers } from "./ethers-5.6.esm.min.js";
// import { ethers } from "./ethers-6.12.1.min.js";
import { contractAddress, abi } from "./contants.js";

// import detectEthereumProvider from "./detect-provider.min.js";
// let provider = await detectEthereumProvider();

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const ethAmountInput = document.getElementById("ethAmount");

connectButton.onclick = _connect;
balanceButton.onclick = _getBalance;
fundButton.onclick = _fundV5;

let account = "";
let signer = null;
let provider = null;

// if (window.ethereum == null) {
//     // If MetaMask is not installed, we use the default provider,
//     // which is backed by a variety of third-party services (such
//     // as INFURA). They do not have private keys installed,
//     // so they only have read-only access
//     console.log("MetaMask not installed; using read-only defaults");
//     provider = ethers.getDefaultProvider();
// } else {
//     // Connect to the MetaMask EIP-1193 object. This is a standard
//     // protocol that allows Ethers access to make all read-only
//     // requests through MetaMask.
//     provider = new ethers.BrowserProvider(window.ethereum);

//     // Look up the current block number
//     const blockNumber = await provider.getBlockNumber();
//     console.log("blockNumber == ", blockNumber); // blockNumber ==  5906502

//     const balance = ethers.formatEther(await provider.getBalance(account));
//     console.log("balance == ", balance); // *(eth)

//     // Get the next nonce required to send a transaction
//     const tx = await provider.getTransactionCount(account);
//     console.log("tx: ", tx);

//     // It also provides an opportunity to request access to write
//     // operations, which will be performed by the private key
//     // that MetaMask manages for the user.
//     signer = await provider.getSigner();
// }

// console.log("typeof window.ethereum", typeof window.ethereum);

async function _connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            // provider = new ethers.BrowserProvider(window.ethereum);
            // console.log("provider", provider);
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        console.log("_connect-accounts:", accounts);
        if (accounts.length > 0) {
            account = accounts[0];
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }

    // This returns the provider, or null if it wasn't detected.
}
const MMSDK = new MetaMaskSDK.MetaMaskSDK(
    {
        name: "localhostHtml",
        url: window.location.host,
    },
    // sdkOptins,
);

async function _connectV6() {
    const sdkOptins = {
        // readonlyRPCMap: {
        //     "0x7A67": "http://localhost:8545",
        // },
    };

    MMSDK.connect()
        .then((res) => {
            console.log("res", res);
            provider = MMSDK.getProvider();

            console.log("provider", provider);

            provider
                .request({ method: "eth_requestAccounts", params: [] })
                .then((res) => {
                    console.log("provider res", res);
                    if (res.length > 0) {
                        account = res[0];
                    }
                    connectButton.innerHTML = "Connected";
                })
                .catch((reject) => {
                    console.log("provider reject", reject);
                });

            // provider
            //     .request({
            //         method: "eth_accounts",
            //     })
            //     .then((res) => {
            //         console.log("_connect-accounts:", accounts);
            //         if (accounts.length > 0) {
            //             account = accounts[0];
            //         }
            //     })
            //     .catch((reject) => {
            //         console.log("provider reject", reject);
            //     });
        })
        .catch((e) => console.log("request accounts ERR", e));

    // Other options
    console.log("MMSDK", MMSDK);

    // You can also access via window.ethereum
    // const ethereum = MMSDK.getProvider();
    // console.log("ethereum", ethereum);

    // ethereum
    //     .request({ method: "eth_requestAccounts", params: [] })
    //     .then((res) => {
    //         console.log("res", res);
    //     })
    //     .catch((reject) => {
    //         console.log("reject", reject);
    //     });

    // This returns the provider, or null if it wasn't detected.
}

async function _getBalance() {
    if (typeof window.ethereum !== "undefined") {
        if (account == "") {
            balanceButton.innerHTML = "Account is empty";
            return;
        }
        console.log("ethers.providers", ethers);
        provider = new ethers.BrowserProvider(window.ethereum);
        try {
            const balance = await provider.getBalance(account);
            console.log(
                `_getBalance ${account}'s balance is ${ethers.formatEther(balance)} ETH`,
            );
            ethAmountInput.value = ethers.formatEther(balance);
        } catch (error) {
            console.log(error);
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask";
    }
}

async function _fundV5() {
    const ethAmount = document.getElementById("ethAmount").value;
    if (ethAmount === "") {
        console.log("Please type ETH Amount...");
        return false;
    }
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function _fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    if (ethAmount === "") {
        console.log("Please type ETH Amount...");
        return false;
    }
    if (typeof window.ethereum !== "undefined") {
        // provider = new ethers.BrowserProvider(window.ethereum);

        // const signer = await provider.getSigner();
        // console.log("signer", signer);

        // let walletInstance = new ethers.Wallet(
        //     "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        //     provider,
        // );
        // console.log("walletInstance", walletInstance);
        // const signer = walletInstance.connect(provider);

        const contract = new ethers.Contract(contractAddress, abi, provider);

        console.log("contract", contract);

        try {
            console.log(ethers.parseEther(ethAmount));
            const tx = await contract.fund({
                value: ethers.parseEther(ethAmount),
            });
            // await listenForTransactionMine(transactionResponse, provider);
            // wait for tx
            await tx.wait();
            // let tx = await signer.sendTransaction({
            //     from: account,
            //     to: contractAddress,
            //     value: ethers.parseEther(ethAmount),
            // });
            // await tx.wait(2);
        } catch (error) {
            console.log("_fund error", error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `,
                );
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
