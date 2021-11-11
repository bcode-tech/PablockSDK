'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var axios = require('axios');
var ethers = require('ethers');
var lodash = require('lodash');
var web3Abi = require('web3-eth-abi');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var web3Abi__default = /*#__PURE__*/_interopDefaultLegacy(web3Abi);

const {
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack
} = require("ethers/lib/utils");
const { ecsign } = require("ethereumjs-util");
require("../config");
const DIGEST_DATA = {
  token: {
    typehash: keccak256(toUtf8Bytes("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")),
    valueTypes: [
      "bytes32",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256"
    ],
    values: ["owner", "spender", "value", "nonce", "deadline"]
  },
  nft: {
    typehash: keccak256(toUtf8Bytes("Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)")),
    valueTypes: [
      "bytes32",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256"
    ],
    values: ["owner", "spender", "tokenId", "nonce", "deadline"]
  },
  notarization: {
    typehash: keccak256(toUtf8Bytes("Notarize(bytes32 hash, string memory uri, address applicant)")),
    valueTypes: ["bytes32", "bytes32", "string", "address"],
    values: ["hash", "uri", "applicant"]
  }
};
const sign = (digest, privateKey) => {
  return ecsign(Buffer.from(digest.slice(2), "hex"), privateKey);
};
function getPermitDigest(name, address, chainId, data, contractType) {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, "0.1.0", address, chainId);
  const digestData = DIGEST_DATA[contractType];
  return keccak256(solidityPack(["bytes1", "bytes1", "bytes32", "bytes32"], [
    "0x19",
    "0x01",
    DOMAIN_SEPARATOR,
    keccak256(defaultAbiCoder.encode(digestData.valueTypes, [
      digestData.typehash,
      ...digestData.values.map((el) => data[el] || data.approve?.[el])
    ]))
  ]));
}
async function getDomainSeparator(name, version, contractAddress, chainId) {
  return keccak256(defaultAbiCoder.encode(["bytes32", "bytes32", "bytes32", "uint256", "address"], [
    keccak256(toUtf8Bytes("EIP712Domain(string name, string version, uint256 chainId, address verifyingContract)")),
    keccak256(toUtf8Bytes(name)),
    keccak256(toUtf8Bytes(version)),
    chainId,
    contractAddress
  ]));
}
async function getTransactionData(nonce, functionSignature, publicKey, privateKey, contract) {
  const digest = keccak256(solidityPack(["bytes1", "bytes1", "bytes32", "bytes32"], [
    "0x19",
    "0x01",
    await getDomainSeparator(contract.name, contract.version, contract.address, 0),
    keccak256(defaultAbiCoder.encode(["uint256", "address", "bytes32"], [
      nonce,
      publicKey,
      keccak256(Buffer.from(functionSignature.replace("0x", ""), "hex"))
    ]))
  ]));
  const signature = sign(digest, Buffer.from(privateKey.replace("0x", ""), "hex"));
  return signature;
}

const { createLogger, format, transports } = require("winston");
const logFormat = format.combine(format.timestamp(), format.printf(({ level, message, timestamp }) => {
  return `[${level}] - ${message}`;
}));
const logger = createLogger({
  level: "debug",
  format: logFormat,
  transports: [
    new transports.Console()
  ]
});

const ERROR_TYPE = {
  NOT_INITIALIZE: "SDK not initialized",
  API_KEY_NOT_AUTHENTICATED: "API Key not authenticated",
  CONTRACT_ERROR: "Smart contract error",
  UNABLE_TO_GENERATE_SUB_JWT: "Unable to generate subJWT",
  UNABLE_TO_CHECK_TOKEN: "Unable to check token"
};

var CustomERC20 = {
  abi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "_name",
          type: "string"
        },
        {
          internalType: "string",
          name: "_symbol",
          type: "string"
        },
        {
          internalType: "address",
          name: "_owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "_delegate",
          type: "address"
        },
        {
          internalType: "address",
          name: "_pablockTokenAddress",
          type: "address"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256"
        }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    },
    {
      inputs: [],
      name: "DOMAIN_SEPARATOR",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "PERMIT_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "TRANSFER_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "spender",
          type: "address"
        }
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "subtractedValue",
          type: "uint256"
        }
      ],
      name: "decreaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "addedValue",
          type: "uint256"
        }
      ],
      name: "increaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "contractAddr",
          type: "address"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "mintQuantity",
          type: "uint256"
        }
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_addr",
          type: "address"
        }
      ],
      name: "addDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_addr",
          type: "address"
        }
      ],
      name: "removeDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_newOwner",
          type: "address"
        }
      ],
      name: "changeOwner",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32"
        }
      ],
      name: "transferToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_addr",
          type: "address"
        }
      ],
      name: "getDelegateStatus",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getVersion",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "pure",
      type: "function"
    },
    {
      inputs: [],
      name: "getChainId",
      outputs: [
        {
          internalType: "uint256",
          name: "chain",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256"
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32"
        }
      ],
      name: "requestPermit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "hash",
          type: "bytes32"
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32"
        }
      ],
      name: "verifySignature",
      outputs: [
        {
          internalType: "address",
          name: "signer",
          type: "address"
        }
      ],
      stateMutability: "pure",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address"
        }
      ],
      name: "getNonces",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ]
};

var PablockToken = {
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_maxSupply",
          type: "uint256"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256"
        }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    },
    {
      inputs: [],
      name: "DOMAIN_SEPARATOR",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "PERMIT_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "spender",
          type: "address"
        }
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "subtractedValue",
          type: "uint256"
        }
      ],
      name: "decreaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "addedValue",
          type: "uint256"
        }
      ],
      name: "increaseAllowance",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address"
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        }
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "mintQuantity",
          type: "uint256"
        }
      ],
      name: "requestToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_contract",
          type: "address"
        }
      ],
      name: "addContractToWhitelist",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_contract",
          type: "address"
        }
      ],
      name: "removeContractFromWhitelist",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_newOwner",
          type: "address"
        }
      ],
      name: "changeOwner",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_maxSupply",
          type: "uint256"
        }
      ],
      name: "changeMaxSupply",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "unlimitedApprove",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          internalType: "address",
          name: "addr",
          type: "address"
        }
      ],
      name: "receiveAndBurn",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_contract",
          type: "address"
        }
      ],
      name: "getContractStatus",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256"
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32"
        }
      ],
      name: "requestPermit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address"
        }
      ],
      name: "getNonces",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getVersion",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ]
};

var PablockNFT = {
  abi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "_tokenName",
          type: "string"
        },
        {
          internalType: "string",
          name: "_tokenSymbol",
          type: "string"
        },
        {
          internalType: "address",
          name: "_contractAddr",
          type: "address"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool"
        }
      ],
      name: "ApprovalForAll",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          internalType: "string",
          name: "uri",
          type: "string"
        },
        {
          indexed: false,
          internalType: "uint256[]",
          name: "indexes",
          type: "uint256[]"
        }
      ],
      name: "TokenGeneration",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    },
    {
      inputs: [],
      name: "DOMAIN_SEPARATOR",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "PERMIT_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "TRANSFER_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "baseURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "operator",
          type: "address"
        }
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "_data",
          type: "bytes"
        }
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address"
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool"
        }
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4"
        }
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256"
        }
      ],
      name: "tokenByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256"
        }
      ],
      name: "tokenOfOwnerByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "contractAddr",
          type: "address"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "quantity",
          type: "uint256"
        },
        {
          internalType: "string",
          name: "_uri",
          type: "string"
        }
      ],
      name: "generateToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address"
        },
        {
          internalType: "address",
          name: "to",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        }
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          internalType: "address",
          name: "spender",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256"
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32"
        }
      ],
      name: "requestPermit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getVersion",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "getPablockTokenAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address"
        }
      ],
      name: "getNonces",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [],
      name: "getChainId",
      outputs: [
        {
          internalType: "uint256",
          name: "chain",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    }
  ]
};

var PablockNotarization = {
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_pablockToken",
          type: "address"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes32",
          name: "hash",
          type: "bytes32"
        },
        {
          indexed: false,
          internalType: "string",
          name: "uri",
          type: "string"
        },
        {
          indexed: false,
          internalType: "address",
          name: "applicant",
          type: "address"
        }
      ],
      name: "Notarize",
      type: "event"
    },
    {
      inputs: [],
      name: "NOTARIZE_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32"
        }
      ],
      stateMutability: "view",
      type: "function",
      constant: true
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "contractAddr",
          type: "address"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "hash",
          type: "bytes32"
        },
        {
          internalType: "string",
          name: "uri",
          type: "string"
        },
        {
          internalType: "address",
          name: "applicant",
          type: "address"
        },
        {
          internalType: "uint8",
          name: "v",
          type: "uint8"
        },
        {
          internalType: "bytes32",
          name: "r",
          type: "bytes32"
        },
        {
          internalType: "bytes32",
          name: "s",
          type: "bytes32"
        }
      ],
      name: "notarize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ]
};

var config = {
  ENDPOINT_LOCAL: "http://127.0.0.1:8082",
  ENDPOINT_MUMBAI: "http://127.0.0.1:5010",
  ENDPOINT_POLYGON: "http://127.0.0.1:5010",
  CHAIN_ID_LOCAL: 1,
  CHAIN_ID_MUMBAI: 80001,
  CHAIN_ID_POLYGON: 137,
  RPC_PROVIDER_LOCAL: "http://127.0.0.1:7545",
  RPC_PROVIDER_MUMBAI: "https://polygon-mumbai.infura.io/v3/98084ec8ac4d49e181f0ffc83562f6f6",
  PABLOCK_TOKEN_ADDRESS_LOCAL: "0x2F73D51b8813775D8CFB2a7147b516CB01EEb4C2",
  PABLOCK_NFT_ADDRESS_LOCAL: "0x383254cBDF631C6611A56502864c3f5D6f56f2A5",
  PABLOCK_NOTARIZATION_ADDRESS_LOCAL: "0x8Dc4E4CBd83e5939EF82f6e2347b7476206610f3",
  CUSTOM_TOKEN_ADDRESS_LOCAL: "0x2f5C8a986f4b1136b50b0F0D7F3fe2cD5046a6c3",
  PABLOCK_TOKEN_ADDRESS_MUMBAI: "0xa723fc1E105923a98a7FbdB8040296C8f118d883",
  PABLOCK_META_TRANSACTION_MUMBAI: "0x32245dd760151576419743aB4b0Bf07cea22C785",
  PABLOCK_NOTARIZATION_MUMBAI: "0x914E1139208f1fA125568eAB5ac052b2e1Ec5fF8",
  PABLOCK_NFT_MUMBAI: "0xfF8014328c7a9d699BCE98b2Ff9ACB94818046A5",
  PABLOCK_MULTISIGN_FACTORY_MUMBAI: "0x8Ee7308787DfbE30C777F21bcAB9b47e5D16dE68",
  TEST_META_TX_MUMBAI: "0x50D3A7B998C90EF96e0021e90027d093A529c67D",
  PABLOCK_ADDRESS_LOCAL: "0xfc8CFa30350f7B195f2b5c6F350f76720bfD89f4"
};

class PablockSDK {
  constructor(sdkOptions) {
    if (!sdkOptions.config?.debugMode) {
      logger.transports[0].silent = true;
    }
    this.env = sdkOptions.config?.env || "MUMBAI";
    logger.info(`Working environment: ${this.env}`);
    if (sdkOptions.apiKey) {
      this.apiKey = sdkOptions.apiKey;
    } else if (sdkOptions.authToken) {
      this.authToken = sdkOptions.authToken;
    } else {
      console.error("[Error] API key or auth token are required, please insert one!");
      process.exit(1);
    }
    this.provider = new ethers.ethers.providers.JsonRpcProvider(config[`RPC_PROVIDER_${this.env}`]);
    if (sdkOptions.privateKey) {
      this.wallet = new ethers.ethers.Wallet(sdkOptions.privateKey);
    } else {
      this.wallet = ethers.ethers.Wallet.createRandom();
    }
    logger.info("Finished initialization");
  }
  async init() {
    try {
      if (this.apiKey) {
        let { status, data } = await axios__default['default'].get(`${config[`ENDPOINT_${this.env}`]}/generateJWT/${this.apiKey}/${this.wallet.address}`);
        if (status === 200) {
          this.authToken = data.authToken;
        } else {
          throw ERROR_TYPE.API_KEY_NOT_AUTHENTICATED;
        }
      } else if (this.authToken) {
        this.checkJWTValidity();
      }
    } catch (error) {
      logger.info("[Error] ", error);
      throw ERROR_TYPE.API_KEY_NOT_AUTHENTICATED;
    }
  }
  getAuthToken() {
    logger.info(`Your auth token is: ${this.authToken}`);
    if (this.authToken) {
      return this.authToken;
    } else {
      console.error("[Error] run sdk.init() if you don't already do that, otherwise check if your API key is correct");
      return null;
    }
  }
  getApiKey() {
    logger.info(`Your API key is: ${this.apiKey}`);
    return this.apiKey;
  }
  getWalletAddress() {
    return this.wallet.address;
  }
  async getPablockTokenBalance(address = this.wallet.address) {
    const pablockToken = new ethers.ethers.Contract(config[`PABLOCK_TOKEN_ADDRESS_${this.env}`], PablockToken.abi, this.provider);
    const balance = parseInt(ethers.ethers.utils.formatEther(await pablockToken.balanceOf(address)));
    logger.info(`User has ${balance} PTK`);
    return balance;
  }
  async getTokenBalance(contractAddress = config[`CUSTOM_TOKEN_ADDRESS_${this.env}`], address = this.wallet.address) {
    try {
      const customToken = new ethers.ethers.Contract(contractAddress, CustomERC20.abi, this.provider);
      const balance = parseInt(ethers.ethers.utils.formatEther(await customToken.balanceOf(address)));
      logger.info(`User has ${balance} ${await customToken.name()}`);
      return balance;
    } catch (err) {
      logger.error("[Pablock API] Custom token balance: ", err);
      throw ERROR_TYPE.CONTRACT_ERROR;
    }
  }
  async getMaticBalance(address = this.wallet.address) {
    const balance = parseInt((await this.provider.getBalance(address)).toString());
    logger.info(`User has ${balance} MATIC`);
    return balance;
  }
  async sendPermit(contractAddress, spender, value, deadline, abi = CustomERC20.abi) {
    try {
      const contract = new ethers.ethers.Contract(contractAddress, abi, this.provider);
      console.log(await contract.getVersion());
      const approve = {
        owner: this.wallet.address,
        spender,
        value
      };
      const nonce = parseInt((await contract.getNonces(approve.owner)).toString());
      const digest = getPermitDigest(await contract.name(), contract.address, config[`CHAIN_ID_${this.env}`], {
        approve,
        nonce,
        deadline
      }, "token");
      const { v, r, s } = sign(digest, Buffer.from(this.wallet.privateKey.substring(2), "hex"));
      const tx = await contract.populateTransaction.requestPermit(approve.owner, approve.spender, approve.value, deadline, v, r, s);
      let { status, data } = await axios__default['default'].post(`${config[`ENDPOINT_${this.env}`]}/sendPermit`, { tx, contractAddress, address: this.wallet?.address }, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });
      return data;
    } catch (error) {
      logger.info("[Send Permit] ", error);
    }
  }
  async requestToken(amount, contractAddress) {
    logger.info(`Request ${amount} token from ${this.wallet.address}`);
    let { status, data } = await axios__default['default'].post(`${config[`ENDPOINT_${this.env}`]}/mintToken`, { contractAddress, to: this.wallet.address, amount }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    });
    logger.info(`Request token status: ${status}`);
    return data;
  }
  async mintNFT(amount, uri, contractAddress = config[`PABLOCK_NFT_ADDRESS_${this.env}`], webhookUrl) {
    let { status, data } = await axios__default['default'].post(`${config[`ENDPOINT_${this.env}`]}/mintNFT`, { to: this.wallet.address, amount, uri, contractAddress, webhookUrl }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    });
    logger.info(status, data);
    return data;
  }
  async sendNFT(to, tokenId, deadline, contractAddress = config[`PABLOCK_NFT_ADDRESS_${this.env}`]) {
    try {
      const customERC721 = new ethers.ethers.Contract(contractAddress, PablockNFT.abi, this.provider);
      const approve = {
        owner: this.wallet.address,
        spender: config[`PABLOCK_ADDRESS_${this.env}`],
        tokenId
      };
      const nonce = parseInt((await customERC721.getNonces(approve.owner)).toString());
      const digest = getPermitDigest(await customERC721.name(), customERC721.address, config[`CHAIN_ID_${this.env}`], {
        approve,
        nonce,
        deadline
      }, "nft");
      const { v, r, s } = sign(digest, Buffer.from(this.wallet.privateKey.substring(2), "hex"));
      const tx = await customERC721.populateTransaction.requestPermit(approve.owner, approve.spender, approve.tokenId, deadline, v, r, s);
      let { status, data } = await axios__default['default'].post(`${config[`ENDPOINT_${this.env}`]}/transferNFT`, { tx, to, tokenId, contractAddress }, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });
      return data;
    } catch (err) {
      logger.error(`NFTTransfer error: ${err} `);
      return null;
    }
  }
  async executeNotarization(hash, uri, deadline = 1657121546e3, metadata, webhookUrl, secret) {
    try {
      const pablockNotarization = new ethers.ethers.Contract(config[`PABLOCK_NOTARIZATION_ADDRESS_${this.env}`], PablockNotarization.abi, this.provider);
      const permit = await this.sendPermit(config[`PABLOCK_TOKEN_ADDRESS_${this.env}`], config[`PABLOCK_ADDRESS_${this.env}`], 1, deadline, PablockToken.abi);
      const digest = getPermitDigest("notarization", pablockNotarization.address, config[`CHAIN_ID_${this.env}`], { hash, uri, applicant: this.wallet.address }, "notarization");
      console.log("DIGEST ==>", digest);
      const { v, r, s } = sign(digest, Buffer.from(this.wallet.privateKey.substring(2), "hex"));
      const tx = await pablockNotarization.populateTransaction.notarize(hash, uri, this.wallet.address, v, r, s);
      let { status, data } = await axios__default['default'].post(`${config[`ENDPOINT_${this.env}`]}/sendTransaction`, { tx, from: this.wallet.address }, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });
      return data;
    } catch (err) {
      logger.error(`Notarization error: ${err} `);
      return null;
    }
  }
  async prepareTransaction(contractObj, functionName, params = []) {
    new ethers.ethers.Contract(contractObj.address, contractObj.abi, this.wallet);
    let functionSignature = web3Abi__default['default'].encodeFunctionCall(contractObj.abi.find((el) => el.type === "function" && el.name === functionName), params);
    const { data } = await axios__default['default'].get(`${config[`ENDPOINT_${this.env}`]}/getNonce/${this.wallet.address}`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    let { r, s, v } = await getTransactionData(data.nonce, functionSignature, this.wallet.address, this.wallet.privateKey, {
      name: contractObj.name,
      version: contractObj.version,
      address: contractObj.address
    });
    return {
      contractAddress: contractObj.address,
      userAddress: this.wallet.address,
      functionSignature,
      r: `0x${r.toString("hex")}`,
      s: `0x${s.toString("hex")}`,
      v
    };
  }
  async executeTransaction(tx) {
    const res = await axios__default['default'].post(`${config[`ENDPOINT_${this.env}`]}/sendRawTransaction`, {
      tx
    }, { headers: { Authorization: `Bearer ${this.authToken}` } });
    console.log("RESULT ==>", res);
    return res;
  }
  async getOwnedNFT(contractAddresses, ownerAddress = this.wallet.address) {
    let tokenOfOwner = {};
    for (const addr of contractAddresses) {
      let contract = new ethers.ethers.Contract(addr, PablockNFT.abi, this.wallet.connect(this.provider));
      let balance = await contract.balanceOf(ownerAddress);
      logger.info(`User has ${balance} NFTs in ${addr} contract`);
      let tokenIds = [];
      for (const i of lodash.range(balance)) {
        const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
        tokenIds.push({
          tokenId: tokenId.toString(),
          tokenURI: await contract.tokenURI(tokenId.toString())
        });
      }
      tokenOfOwner[addr] = tokenIds;
    }
    return tokenOfOwner;
  }
  async checkJWTValidity() {
    try {
      let { status, data } = await axios__default['default'].get(`${config[`ENDPOINT_${this.env}`]}/checkJWT`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });
      logger.info(status, data);
      return data;
    } catch (error) {
      throw ERROR_TYPE.UNABLE_TO_CHECK_TOKEN;
    }
  }
  async generateSubJWT(address) {
    try {
      let { status, data } = await axios__default['default'].get(`${config[`ENDPOINT_${this.env}`]}/generateSubJWT/${address}`, {
        headers: {
          Authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiJhcGlfdGVzdCIsImFkZHJlc3MiOiJ1bmRlZmluZWQiLCJzdWJUb2tlbiI6dHJ1ZSwiaWF0IjoxNjMzNjg0NTk4fQ.UQEZ-IHNXNKwYO6Q7xRs_MrUGA37T-fG4QD3nTQwPJuA5emPNuE52X-RVJdSOcRiQWnTrgqm9q2EDZoM4ukuoQ"
        }
      });
      console.log(data);
      logger.info(`SubJWT: ${data.authToken}`);
      return data.authToken;
    } catch (error) {
      throw ERROR_TYPE.UNABLE_TO_GENERATE_SUB_JWT;
    }
  }
  async getAPIVersion() {
    let { data } = await axios__default['default'].get(`/getVersion`);
    return data;
  }
}

exports.PablockSDK = PablockSDK;
//# sourceMappingURL=index.js.map
