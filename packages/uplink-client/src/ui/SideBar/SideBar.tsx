import Image from "next/image";
import uplinkLogo from "../../../public/uplink-logo.svg";

export default function Sidebar() {
  return (
    <div className="text-3xl text-green-600 p-2 place-self bg-purple-500">
      <div className="">
        <Image src={uplinkLogo} alt="uplink logo" width={50} height={50} />
      </div>
      <hr className="bg-gray-200 border border-gray-200 rounded-full mx-2" />

      <div
        className="flex items-center justify-center 
                        h-12 w-12 mt-2 mb-2 mx-auto  
                        bg-gray-400 hover:bg-green-600 dark:bg-gray-800 
                        text-green-500 hover:text-white
                        hover:rounded-xl rounded-3xl
                        transition-all duration-300 ease-linear
                        cursor-pointer shadow-lg
                        tooltip"
        data-tip="New Org"
      >
        <p>+</p>
      </div>
      <hr className="bg-gray-200 border border-gray-200 rounded-full mx-2" />
      <div className="avatar">
        <div
          className="relative flex items-center justify-center 
                        h-12 w-12 mt-2 mb-2 mx-auto  
                    bg-gray-400 hover:bg-green-600 dark:bg-gray-800 
                    text-green-500 hover:text-white
                        hover:rounded-xl rounded-3xl
                        transition-all duration-300 ease-linear
                        cursor-pointer shadow-lg"
        >
          <Image
            src={"/noun-47.png"}
            alt={"org avatar"}
            height={50}
            width={50}
          />
        </div>
      </div>
    </div>
  );
}
