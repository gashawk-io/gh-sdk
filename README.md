This repository contains the GasHawk SDK. A TypeScript Library to interact with the GasHawk Transaction manager. It’s built on Top of the popular ethers.js library and overrides ethers’ Signer and Provider class to send transactions to GasHawk instead to the Mempool. It also offers methods to query transaction information and list all transactions.

# Installation

Install ethers.js and the GasHawk to get started

```bash
npm install --save ethers
```

```bash
npm install --save gashawk-sdk
```

# Set-Up

Instantiate a new ethers.Signer object that you want to sign your transaction with.

```ts
const signer = new Wallet(PRIVATE_KEY, ethers.getDefaultProvider());
```

Now you can create an instance of GasHawk using your signer. GasHawk then establishes a session for this particular address. You will receive a token that you can use to login into the GasHawk Frontend to view your transactions in the GasHawk Web App

```ts
const gashawk = await Gashawk.fromSigner(signer, PROVIDER_URL);
```

Now you can get a signer object you can use as you are used to with ethers. Just pass it instead of the default ethers signer.

```ts
const gashawkSigner = gashawk.getSigner();
```

# Track your transactions

There are multiple ways to keep track of your transaction while they are handled by GasHawk.

## GasHawk Web App

After you've created a new Gashawk instance, you can find a link in your terminal proving you a link to the GasHawk. Open this link in your browser to see your transactions.

## Using the wait function

The GasHawk instance has a method called wait attached. It can be used to await the process until the transaction is mined. This method is similar to ethers wait method.

## Query GasHawk

You can either Query all transactions or a transaction with a certain ID

```ts
const allTransactions = await gashawk.getAllTransactions();
```

```ts
const transaction = await gashawk.getTransaction(transactionId);
```

# Examples

## Smart contract deployment

You can use Gashawk to save Gas during your smart contract deployments. This section gives you an example of how to use the ethers contract factory with the GasHawk signer

```ts
const helloGashawkFactory = await hre.ethers.getContractFactory("HelloGashawk");

//Use the gashawk signer to send the deploy transaction to gashawk
const tx = await gashawkSigner.sendTransaction({
    ...helloGashawkFactory.getDeployTransaction(),
    gasLimit: BigNumber.from(21000000),
    customData: {
        //Instead of submitting your transaction gashawk can just simulate it for testing purposes
        simulate: true,
    },
});
```

## Simple ETH transfer

The following snippets use Gashawk to send Ether from your account to another.

```ts
await gashawkSigner.sendTransaction({
    to: "0x09c3d8547020a044c4879cD0546D448D362124Ae",
    value: ethers.utils.parseEther("1.23"),
    gasLimit: BigNumber.from(21000),
    customData: {
        simulate: true,
    },
});
```

## Contract Interaction

To use GasHawk for interacting with other smart contracts create a Contract instance with the GasHawk signer as the signer.

```ts
//Create an instance of the contract using ethers
const usdcContract = new Contract(
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    CONTRACT_ABI,
    gashawkSigner
);
//Call the according method
await usdcContract.transfer(
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    ethers.utils.parseUnits("1", 6)
);
```
