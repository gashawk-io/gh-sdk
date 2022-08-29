This repository contains the GasHawk SDK. A TypeScript Library to interact with the GasHawk Transaction manager. It’s built on Top of the popular ethers.js library and overrides ethers’ Signer and Provider class to send transactions to GasHawk instead to the Mempool. It also offers methods to query transaction information and list all transactions.

# Installation

Install ethers.js and the GasHawk to get started

```npm install --save ethers```

```npm install --save @corpus-ventures/GasHawk-sdk```

# Set-Up
Instantiate a new ethers.Signer object that you want to sign your transaction with.

```const signer = new Wallet(PRIVATE_KEY, ethers.getDefaultProvider());```

Now you can create an instance of GasHawk using your signer. GasHawk then establishes a session for this particular address. You will receive a token that you can use to login into the GasHawk Frontend to view your transactions in the GasHawk Web App 

```const gashawk = await Gashawk.fromSigner(signer, PROVIDER_URL);```

Now you can get a signer object you can use as you are used to with ethers. Just pass it instead of the default ethers signer.

```const gashawkSigner = gashawk.getSinger();```







