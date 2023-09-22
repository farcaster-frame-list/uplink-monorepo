const fetchSingleSpace = async (name: string) => {
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
              name
              displayName
              logoUrl
              twitter
              website
              admins{
                  address
              }
            }
        }`,
      variables: {
        name,
      },
    }),
    next: { tags: [`space/${name}`], revalidate: 60 },
  })
    .then((res) => res.json())
    .then((res) => res.data.space);
  return data;
};

export default fetchSingleSpace;