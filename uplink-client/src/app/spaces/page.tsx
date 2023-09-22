import Link from "next/link";
import Image from "next/image";
import { HiPlus } from "react-icons/hi2";
import { Metadata } from "next";
import { baseMetadata } from "../base-metadata";
import fetchSpaces from "@/lib/fetch/fetchSpaces";
import SwrProvider from "@/providers/SwrProvider";
import ListSpaces from "./ListSpaces";

export const metadata: Metadata = {
  ...baseMetadata,
  description: "Spaces",
  openGraph: {
    ...baseMetadata.openGraph,
    title: "Spaces",
    description: "Explore spaces on Uplink",
  },
};

export default async function Page() {
  const spaces = await fetchSpaces();

  const fallback = {
    ["spaces"]: spaces,
  };

  return (
    <div className="flex flex-col w-11/12 lg:w-9/12 m-auto justify-center py-12 gap-4">
      <div className="flex items-center gap-4 justify-end font-bold">
        <Link
          className="btn btn-primary btn-outline normal-case"
          href="/spacebuilder/create"
          draggable={false}
        >
          <HiPlus className="w-6 h-6" />
          <p className="pl-2">New Space</p>
        </Link>
      </div>
      {/* <AllSpaces spaces={spaces} /> */}
      <SwrProvider fallback={fallback}>
        <ListSpaces />
      </SwrProvider>
    </div>
  );
}
