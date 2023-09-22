// iterate a list of contests and return the prompts for each

const fetchSpaceContests = async (spaceName: string) => {

    const data = await fetch(`${process.env.NEXT_PUBLIC_HUB_URL}/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: `
                query space($name: String!){
                  space(name: $name) {
                    contests {
                        deadlines {
                          endTime
                          snapshot
                          startTime
                          voteTime
                        }
                        id
                        tweetId
                        metadata {
                          category
                          type
                        }
                        promptUrl
                    }
                  }
              }`,
            variables: {
                name: spaceName,
            },
        }),
        next: { tags: [`space/${spaceName}/contests`], revalidate: 60 },
    })
        .then((res) => res.json())
        .then((res) => res.data.space.contests)
        .then(async contests => {
            return await Promise.all(
                contests.map(async (contest) => {
                    // fetch prompt url
                    const promptData = await fetch(contest.promptUrl).then((res) =>
                        res.json()
                    );
                    return {
                        ...contest,
                        promptData,
                    };
                })
            );
        })
    return data;
}

export default fetchSpaceContests;