import { ethers } from 'ethers';
import EthDater from 'ethereum-block-by-date';
import Decimal from 'decimal.js';
import ERC20ABI from './abi/erc20ABI.js'
import ERC721ABI from './abi/erc721ABI.js';
import ERC1155ABI from './abi/erc1155ABI.js';
import ERC165ABI from './abi/erc165ABI.js';
import { IToken } from '../types/token.js';

const ERC721Interface = '0x80ac58cd';
const ERC1155Interface = '0xd9b67a26';
const ERC1155MetaDataURIInterface = '0xd9b67a26';


export class TokenController {
    private provider: ethers.providers.AlchemyProvider;
    private dater: EthDater;

    constructor(providerKey: string) {
        this.provider = new ethers.providers.AlchemyProvider('homestead', providerKey);
        this.dater = new EthDater(this.provider);
    }

    async validateEthAddress(address: string) {

        if (!address) return null
        address = address.trim();

        const isEns = address.match(/\.eth$/); // check if address is ens or hex
        let resolvedAddress: string | null = null;

        if (isEns) {
            resolvedAddress = await this.provider.resolveName(address);
            if (!resolvedAddress) return null;
            return resolvedAddress;
        }

        try {
            resolvedAddress = ethers.utils.getAddress(address);
            return resolvedAddress as string;
        } catch (error) {
            return null;
        }
    }

    async validateERC20(address: string) {
        try {
            const erc20Contract = new ethers.Contract(address, ERC20ABI, this.provider);
            await erc20Contract.totalSupply();
            return true;
        } catch (err) {
            return false;
        }
    };

    async validateInterface(address: string, interfaceId: '0x80ac58cd' | '0xd9b67a26') {
        try {
            const erc165Contract = new ethers.Contract(address, ERC165ABI, this.provider);
            return await erc165Contract.supportsInterface(interfaceId);
        } catch (err) {
            return false;
        }
    };

    async verifyTokenStandard({ contractAddress, expectedStandard }: { contractAddress: string; expectedStandard: "ERC20" | "ERC721" | "ERC1155" }) {
        switch (expectedStandard) {
            case "ERC20":
                try {
                    const [isERC20, isERC721] = await Promise.all([
                        this.validateERC20(contractAddress),
                        this.validateInterface(contractAddress, ERC721Interface),
                    ]);
                    return isERC20 && !isERC721;
                } catch (err) {
                    return false;
                }
            case "ERC721":
                return await this.validateInterface(contractAddress, ERC721Interface);
            case "ERC1155":
                return await this.validateInterface(contractAddress, ERC1155Interface);
            default:
                return false;
        }
    };


    async tokenGetSymbolAndDecimal({ contractAddress, tokenStandard }: { contractAddress: string, tokenStandard: "ERC20" | "ERC721" | "ERC1155" }) {

        // use the erc20 abi since we only want symbol and decimals
        const tokenContract = new ethers.Contract(contractAddress, ERC20ABI, this.provider);

        let symbol = '';
        let decimals = 0;
        try {
            symbol = await tokenContract.symbol();
        } catch (err) {
            if (tokenStandard !== 'ERC1155') {
                console.log('Failed to fetch symbol');
            }
        }

        if (tokenStandard === 'ERC20') {
            try {
                decimals = await tokenContract.decimals();
            } catch (err) {
                console.log('Failed to fetch decimals');
            }
        }

        return { symbol, decimals };
    }


    async isValidERC1155TokenId({ contractAddress, tokenId }: {
        contractAddress: string, tokenId: number
    }) {
        try {
            const tokenContract = new ethers.Contract(contractAddress, ERC1155ABI, this.provider);
            const uri = await tokenContract.uri(tokenId);

            // Check if the URI is valid
            const uriRegex = new RegExp('^(https?|ipfs):\\/\\/[^\\s/$.?#].[^\\s]*$', 'i');
            return uriRegex.test(uri);
        } catch (err) {
            return false;
        }
    }


    async isERC1155TokenFungible({ contractAddress, tokenId }: {
        contractAddress: string, tokenId: number
    }) {
        try {
            const tokenContract = new ethers.Contract(contractAddress, ERC1155ABI, this.provider);
            const isFungible = await tokenContract.supportsInterface(ERC1155MetaDataURIInterface);
            if (isFungible) return true;
            return false;
        } catch (err) {
            return false;
        }
    }

    async calculateBlockFromTimestamp(timestamp: string) {
        const result = await this.dater.getDate(timestamp, true, false);
        return result.block;
    }


    async computeUserTokenBalance({ token, snapshot, walletAddress }: {
        token: IToken,
        snapshot: string,
        walletAddress: string
    }) {

        const blockNum = this.calculateBlockFromTimestamp(snapshot);

        try {
            if (token.type === "ETH") {
                const balance = await this.provider.getBalance(walletAddress, blockNum);
                return new Decimal(balance.toString()).div(new Decimal(10).pow(token.decimals));
            }
            else if (token.type === "ERC1155") {
                const tokenContract = new ethers.Contract(token.address, ERC1155ABI, this.provider);
                const balance = await tokenContract.balanceOf(walletAddress, token.tokenId, { blockTag: blockNum });
                return new Decimal(balance.toString()).div(new Decimal(10).pow(token.decimals));
            }
            else { // ERC20 / ERC721
                const tokenContract = new ethers.Contract(token.address, ERC20ABI, this.provider);
                const balance = await tokenContract.balanceOf(walletAddress, { blockTag: blockNum });
                return new Decimal(balance.toString()).div(new Decimal(10).pow(token.decimals));
            }
        } catch (err) {
            console.error(`Failed to fetch user balance for token with err: ${err}`);
            return new Decimal(0);
        }

    }

}