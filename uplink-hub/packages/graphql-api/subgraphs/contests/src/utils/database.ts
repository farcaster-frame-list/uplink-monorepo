import { EditorOutputData, IToken, DatabaseController, schema, isERCToken } from "lib";
import { TwitterApi } from 'twitter-api-v2';
import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
dotenv.config();

const pinata = new pinataSDK({ pinataApiKey: process.env.PINATA_KEY, pinataSecretApiKey: process.env.PINATA_SECRET });

const databaseController = new DatabaseController(process.env.DATABASE_HOST, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD);
export const db = databaseController.db;
export const sqlOps = databaseController.sqlOps;


type Metadata = {
    type: string;
    category: string;
}

type Deadlines = {
    startTime: string;
    voteTime: string;
    endTime: string;
    snapshot: string;
}

type Prompt = {
    title: string;
    body: EditorOutputData;
    coverUrl?: string;
}

type AdditionalParams = {
    anonSubs: boolean;
    visibleVotes: boolean;
    selfVote: boolean;
    subLimit: number;
}

type FungiblePayout = {
    amount: string;
}

type NonFungiblePayout = {
    tokenId: number | null;
}

interface IPayout {
    rank: number;
    ETH?: FungiblePayout;
    ERC20?: FungiblePayout;
    ERC721?: NonFungiblePayout;
    ERC1155?: FungiblePayout;
}

interface SubmitterRewards {
    ETH?: IToken;
    ERC20?: IToken;
    ERC721?: IToken;
    ERC1155?: IToken;
    payouts?: IPayout[];
}

interface VoterRewards {
    ETH?: IToken;
    ERC20?: IToken;
    payouts?: IPayout[];
}

interface SubmitterRestriction {
    token: IToken;
    threshold: string;
}

type ArcadeStrategy = {
    type: "arcade";
    votingPower: string;
};

type WeightedStrategy = {
    type: "weighted";
};

interface VotingPolicy {
    token: IToken;
    strategy: ArcadeStrategy | WeightedStrategy;
}

type ContestData = {
    spaceId: string;
    metadata: Metadata;
    deadlines: Deadlines;
    //created: string;
    prompt: Prompt;
    additionalParams: AdditionalParams;
    submitterRewards: SubmitterRewards;
    voterRewards: VoterRewards;
    submitterRestrictions: SubmitterRestriction[];
    votingPolicy: VotingPolicy[];
}

// simple object hash function
function djb2Hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
}


export const prepareContestPromptUrl = async (contestPrompt: Prompt) => {
    const prompt = { ...contestPrompt, version: 'uplink-v1' }

    return pinata.pinJSONToIPFS(prompt).then((result) => {
        return `https://calabara.mypinata.cloud/ipfs/${result.IpfsHash}`;
    }).catch((err) => {
        throw new Error(err);
    })
}


const insertSubRewards = async (contestId, submitterRewards, tx) => {

    const tokenSubRewardsArr = [];
    for (const reward of submitterRewards) {
        const newReward: schema.dbNewRewardType = {
            contestId,
            rank: reward.rank,
            recipient: 'submitter',
        }
        const insertedReward = await tx.insert(schema.rewards).values(newReward);
        const newTokenReward: schema.dbNewTokenRewardType = {
            rewardId: parseInt(insertedReward.insertId),
            tokenLink: reward.tokenLink,
            amount: 'amount' in reward.value ? reward.value.amount.toString() : null,
            tokenId: 'tokenId' in reward.value ? reward.value.tokenId : null,
        }
        tokenSubRewardsArr.push(newTokenReward);
    }
    if (tokenSubRewardsArr.length > 0) await tx.insert(schema.tokenRewards).values(tokenSubRewardsArr);
}


const insertVoterRewards = async (contestId, voterRewards, tx) => {

    const tokenVoterRewardsArr = [];
    for (const reward of voterRewards) {
        const newReward: schema.dbNewRewardType = {
            contestId,
            rank: reward.rank,
            recipient: 'voter',
        }
        const insertedReward = await tx.insert(schema.rewards).values(newReward);
        const newTokenReward: schema.dbNewTokenRewardType = {
            rewardId: parseInt(insertedReward.insertId),
            tokenLink: reward.tokenLink,
            amount: 'amount' in reward.value ? reward.value.amount.toString() : null,
            tokenId: 'tokenId' in reward.value ? reward.value.tokenId : null,
        }
        tokenVoterRewardsArr.push(newTokenReward);
    }
    if (tokenVoterRewardsArr.length > 0) await tx.insert(schema.tokenRewards).values(tokenVoterRewardsArr);
}


const insertSubmitterRestrictions = async (contestId, submitterRestrictions, tx) => {

    // insert submitter restrictions to restrictions table
    const subRestrictionArr = []
    for (const restriction of submitterRestrictions) {
        const newRestriction: schema.dbNewSubmitterRestrictionType = {
            contestId,
            restrictionType: "token",
        }
        const insertedRestriction = await tx.insert(schema.submitterRestrictions).values(newRestriction);

        const newTokenRestriction: schema.dbNewTokenRestrictionType = {
            restrictionId: parseInt(insertedRestriction.insertId),
            tokenLink: restriction.tokenLink,
            threshold: restriction.threshold,
        }
        subRestrictionArr.push(newTokenRestriction);
    };
    if (subRestrictionArr.length > 0) await tx.insert(schema.tokenRestrictions).values(subRestrictionArr);

}

const insertVotingPolicies = async (contestId, votingPolicy, tx) => {

    // insert the voting policies

    for (const policy of votingPolicy) {
        const newVotingPolicy: schema.dbNewVotingPolicyType = {
            contestId,
            strategyType: policy.strategy.type,
        }
        const insertedVotingPolicy = await tx.insert(schema.votingPolicy).values(newVotingPolicy);

        if (policy.strategy.type === "arcade") {
            const newArcadeVotingPolicy: schema.dbNewArcadeVotingStrategyType = {
                votingPolicyId: parseInt(insertedVotingPolicy.insertId),
                votingPower: policy.strategy.votingPower,
                tokenLink: policy.tokenLink,
            }
            await tx.insert(schema.arcadeVotingStrategy).values(newArcadeVotingPolicy);
        }
        else if (policy.strategy.type === "weighted") {
            const newWeightedVotingPolicy: schema.dbNewWeightedVotingStrategyType = {
                votingPolicyId: parseInt(insertedVotingPolicy.insertId),
                tokenLink: policy.tokenLink,
            }
            await tx.insert(schema.weightedVotingStrategy).values(newWeightedVotingPolicy);
        }
    };
}

// update the many-to-many mapping of spacesToTokens
const insertSpaceToken = async (spaceId, tokenId) => {
    const existingLink = await db.select({ id: schema.spacesToTokens.id })
        .from(schema.spacesToTokens)
        .where(sqlOps.and(
            sqlOps.eq(schema.spacesToTokens.spaceId, spaceId),
            sqlOps.eq(schema.spacesToTokens.tokenLink, tokenId)
        ));

    if (!existingLink[0]) {
        // insert the new link
        const newSpaceToken: schema.dbNewSpaceToTokenType = {
            spaceId: spaceId,
            tokenLink: tokenId,
        }
        await db.insert(schema.spacesToTokens).values(newSpaceToken);
    }
}



class TwitterController {

    private client: any;

    constructor(accessToken: string) {
        this.client = new TwitterApi(accessToken);
    }

    public async validateSession() {
        try {
            const session = await this.client.v2.me();
            return session;
        } catch (e) {
            throw new Error(`failed to establish a twitter session`)
        }
    }

    public async processThread(thread: any) {
        const processedThread = thread.map((el) => {
            const { text, media } = el;
            return {
                ...(text && { text }),
                ...(media && { media: { media_ids: [media.media_id] } }),
            }
        });
        if (!processedThread || processedThread.length === 0) throw new Error('invalid thread');
        return processedThread;
    }

    public async sendTweet(thread: any) {
        try {
            await this.validateSession();
            const processedThread = await this.processThread(thread);
            const tweetResponse = await this.client.v2.tweetThread(processedThread);
            return tweetResponse[0].data.id;

        } catch (err) {
            console.log(err);
            if (err.message === 'invalid thread') {
                throw err;
            } else if (err.message === 'failed to establish a twitter session') {
                throw err;
            } else {
                throw new Error('failed to send tweet');
            }
        }
    }

}

export const createDbContest = async (contest: ContestData, user: any) => {
    const spaceId = parseInt(contest.spaceId);
    const promptUrl = await prepareContestPromptUrl(contest.prompt);



    const uniqueTokens = new Map();

    const insertUniqueToken = async (token) => {
        const tokenHash = djb2Hash(JSON.stringify(token)).toString(16);

        if (!uniqueTokens.has(tokenHash)) {
            const existingToken = await db
                .select({ id: schema.tokens.id })
                .from(schema.tokens)
                .where(sqlOps.eq(schema.tokens.tokenHash, tokenHash));

            if (!existingToken[0]) {
                const newToken: schema.dbNewTokenType = {
                    tokenHash: tokenHash,
                    type: token.type,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    address: isERCToken(token) ? token.address : null,
                    tokenId: isERCToken(token) ? token.tokenId : null,
                };

                const insertedToken = await db.insert(schema.tokens).values(newToken);
                const insertId = parseInt(insertedToken.insertId);
                uniqueTokens.set(tokenHash, { dbTokenId: insertId });
                await insertSpaceToken(spaceId, insertId);
                return insertId;
            } else {
                const existingId = existingToken[0].id;
                uniqueTokens.set(tokenHash, { dbTokenId: existingId });
                await insertSpaceToken(spaceId, existingId);
                return existingId;
            }
        } else {
            const existingId = uniqueTokens.get(tokenHash).dbTokenId;
            await insertSpaceToken(spaceId, existingId);
            return existingId;
        }
    }



    const prepareContestRewards = async (contestRewards: SubmitterRewards | VoterRewards) => {
        const flattenedRewards = [];

        if (contestRewards.payouts) {
            for (const payout of contestRewards.payouts) {
                const { rank, ...payoutData } = payout;

                for (const [tokenType, value] of Object.entries(payoutData)) {
                    const reward = {
                        rank: payout.rank,
                        tokenLink: await insertUniqueToken(contestRewards[tokenType]),
                        value
                    };
                    flattenedRewards.push(reward);
                }
            }
        }

        return flattenedRewards;
    };


    const prepareRestrictionsAndPolicies = async (arr) => {
        const returnArr = [];
        for (const arrElement of arr) {
            const { token, ...rest } = arrElement;
            const dbTokenId = await insertUniqueToken(token);
            returnArr.push({ tokenLink: dbTokenId, ...rest });
        };
        return returnArr;
    };


    const adjustedSubmitterRewards = await prepareContestRewards(contest.submitterRewards);
    const adjustedVoterRewards = await prepareContestRewards(contest.submitterRewards);
    const adjustedVotingPolicy = await prepareRestrictionsAndPolicies(contest.votingPolicy);
    const adjustedSubmitterRestrictions = await prepareRestrictionsAndPolicies(contest.submitterRestrictions);

    const newContest: schema.dbNewContestType = {
        spaceId: spaceId,
        type: contest.metadata.type,
        category: contest.metadata.category,
        promptUrl: promptUrl,
        startTime: new Date(contest.deadlines.startTime).toISOString(),
        voteTime: new Date(contest.deadlines.voteTime).toISOString(),
        endTime: new Date(contest.deadlines.endTime).toISOString(),
        snapshot: new Date(contest.deadlines.snapshot).toISOString(),
        anonSubs: contest.additionalParams.anonSubs,
        visibleVotes: contest.additionalParams.visibleVotes,
        selfVote: contest.additionalParams.selfVote,
        subLimit: contest.additionalParams.subLimit,
        created: new Date().toISOString(),
    }


    const sendAnnouncementTweet = async (contestId, user, thread) => {

        const now = new Date().toISOString();
        const isTwitterAuth = (user?.twitter?.accessToken ?? null) && (user?.twitter?.expiresAt ?? now > now);
        if (!isTwitterAuth) throw new Error('twitter is expired');

        const twitterController = new TwitterController(user.twitter.accessToken);
        const tweet_id = await twitterController.sendTweet(thread);
        console.log('TWEET ID IS', tweet_id)


        // 1. check user is still auth'd

        // 2. process the thread
    }



    try {
        return await db.transaction(async (tx) => {
            const contest = await tx.insert(schema.contests).values(newContest)
            const contestId = parseInt(contest.insertId);
            await insertSubRewards(contestId, adjustedSubmitterRewards, tx);
            await insertVoterRewards(contestId, adjustedVoterRewards, tx);
            await insertSubmitterRestrictions(contestId, adjustedSubmitterRestrictions, tx);
            await insertVotingPolicies(contestId, adjustedVotingPolicy, tx);

            if (newContest.type === "twitter") {
                await sendAnnouncementTweet(contestId, user, [{ text: "this is another test tweet" }])
                    .catch(err => {
                        console.log(err);
                        tx.rollback();
                        throw err;
                    })
            }
            return contestId;
        });
    } catch (err) {
        throw new Error("database error: " + err.message)
    }
};