import Link from "next/link";
import Image from "next/image";
import { AllSpacesDocument } from "@/lib/graphql/spaces.gql";
import graphqlClient from "@/lib/graphql/initUrql";
import { AllSpaces} from "./data";
import { SearchBar } from "@/ui/SearchBar/SearchBar";
import { HomeIcon, PlusIcon } from "@heroicons/react/24/solid";

//console.log('revalidating')

//export const revalidate = 10;
//export const dynamic = "force-static";
//export const revalidate = 10;

const getSpaces = async () => {
  const results = await graphqlClient.query(AllSpacesDocument, {}).toPromise();
  if (results.error) {
    throw new Error(results.error.message);
  }
  return results;
};

export default async function Page() {
  const spaces = await getSpaces();
  console.log(spaces.data.spaces);
  return (
    <div className="flex flex-col m-auto py-6 w-4/5 gap-4">
      <div className="flex flex-col md:flex-row items-center p-1 gap-4 py-8">
        <Link className="btn" href="/">
          <HomeIcon className="h-6 w-6" />
          <p className="pl-2">home</p>
        </Link>
        <Link className="btn btn-primary" href="/spacebuilder/create">
          <PlusIcon className="w-6 h-6" />
          <p className="pl-2">new space</p>
        </Link>
        <Link className="btn btn-ghost" href={"/space/sharkdao/contests/1"}>
          <p className="pl-2">contest 1</p>
        </Link>
        <Link className="btn btn-ghost" href={"/space/sharkdao/createcontest"}>
          <p className="pl-2">create contest</p>
        </Link>
        <SearchBar />
      </div>
      <AllSpaces spaces={spaces} />
    </div>
  );
}
