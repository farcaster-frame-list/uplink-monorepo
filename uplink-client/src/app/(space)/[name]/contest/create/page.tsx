import ContestForm from "@/ui/ContestForm/Entrypoint";

const getSpace = async (name: string) => {
  const data = await fetch(`${process.env.NEXT_PUBLIC_HUB_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query space($name: String!){
          space(name: $name) {
            id
            spaceTokens {
              token {
                type
                address
                decimals
                symbol
                tokenId
              }
            }
          }
      }`,
      variables: {
        name,
      },
    }),
    cache: "no-store",
    next: { tags: [`space/${name}`] /*revalidate: 60 */ },
  })
    .then((res) => res.json())
    .then((res) => res.data.space);
  return data;
};

export default async function Page({ params }: { params: { name: string } }) {
  const { id, spaceTokens } = await getSpace(params.name);
  return (
    <div className="w-full h-full lg:w-9/12 m-auto">
      <ContestForm
        spaceName={params.name}
        spaceId={id}
        spaceTokens={spaceTokens.map((t) => t.token)}
      />
    </div>
  );
}