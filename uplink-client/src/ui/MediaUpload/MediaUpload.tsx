'use client';
import { useRef, useEffect } from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import Image from "next/image";
import { HiCamera, HiOutlineTrash } from 'react-icons/hi2';
import { RenderStandardVideoWithLoader } from '@/ui/VideoPlayer';
import toast from 'react-hot-toast';
import { BiSolidCircle } from 'react-icons/bi';


const FileInput = ({
    acceptedFormats,
    upload,
    children,
}: {
    acceptedFormats: Array<string>;
    upload: (event) => Promise<void>;
    children: React.ReactNode;
}) => {

    const fileUploader = useRef<HTMLInputElement>(null);

    return (
        <div className="w-full h-full">
            <input
                placeholder="asset"
                type="file"
                accept={acceptedFormats.join(",")}
                className="hidden"
                onChange={async (event) =>
                    await upload(event)
                }
                ref={fileUploader}
            />
            {children}
        </div>
    )
}


export const MediaUpload = ({ 
    acceptedFormats, 
    uploadStatusCallback, 
    ipfsImageCallback, 
    ipfsAnimationCallback, 
    maxVideoDuration 
}: { 
    acceptedFormats: Array<string>, 
    uploadStatusCallback: (status: boolean) => void, 
    ipfsImageCallback: (url: string) => void,
    ipfsAnimationCallback: (url: string) => void,
    maxVideoDuration?: number 
}) => {
    const imageUploader = useRef<HTMLInputElement>(null);
    const { 
        upload, 
        removeMedia, 
        isUploading, 
        imageObjectURL, 
        animationObjectURL, 
        isVideo, 
        thumbnailBlobIndex,
        thumbnailOptions,
        handleThumbnailChoice,
        imageURI,
        animationURI
    } = useMediaUpload(acceptedFormats, maxVideoDuration);

    useEffect(() => {
        uploadStatusCallback(isUploading)
    }, [isUploading])

    useEffect(() => {
        ipfsImageCallback(imageURI)
    },[imageURI])

    useEffect(() => {
        ipfsAnimationCallback(animationURI)
    },[animationURI])

    if (isVideo) {
        return (
            <div className="relative w-full m-auto">
                <label className="label">
                    <span className="label-text text-t2">Media</span>
                </label>
                <button
                    className="absolute top-5 -right-3 btn btn-error btn-sm btn-circle z-10 shadow-lg"
                    onClick={removeMedia}
                >
                    <HiOutlineTrash className="w-5 h-5" />
                </button>
                <RenderStandardVideoWithLoader
                    videoUrl={animationObjectURL || ""}
                    posterUrl={
                        thumbnailBlobIndex !== null
                            ? thumbnailOptions[thumbnailBlobIndex]
                            : ""
                    }
                />
                {thumbnailOptions?.length > 0 && (
                    <>
                        <label className="label">
                            <span className="label-text text-t2">Thumbnail</span>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center bg-base-100 border border-border p-2 w-full m-auto rounded">
                            <div className="flex flex-wrap w-full gap-2">
                                {thumbnailOptions.map((thumbOp, thumbIdx) => {
                                    return (
                                        <div
                                            key={thumbIdx}
                                            className="relative cursor-pointer h-[50px] w-[50px]"
                                            onClick={() => handleThumbnailChoice(thumbIdx)}
                                        >
                                            <Image
                                                src={thumbOp}
                                                alt="Media"
                                                fill
                                                className={`hover:opacity-50 rounded aspect-square h-full w-full object-cover ${thumbnailBlobIndex === thumbIdx
                                                    ? "border border-primary"
                                                    : ""
                                                    }`}
                                            />

                                            {thumbnailBlobIndex === thumbIdx && (
                                                <BiSolidCircle className="absolute text-primary w-5 h-5 top-[-10px] right-[-10px]" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    else if (imageObjectURL) {
        return (
            <div className="flex flex-col items-center">
                <label className="label self-start">
                    <span className="label-text text-t2">Media</span>
                </label>
                <div className="relative">
                    <button
                        className="absolute top-0 right-0 mt-[-10px] mr-[-10px] btn btn-error btn-sm btn-circle z-10 shadow-lg"
                        onClick={removeMedia}
                    >
                        <HiOutlineTrash className="w-5 h-5" />
                    </button>
                    <Image
                        src={imageObjectURL}
                        alt="Media"
                        width={300}
                        height={300}
                        className="rounded-lg object-contain"
                    />
                </div>
            </div>
        )
    } else {
        return (
            <div className="w-full h-full">
                <input
                    placeholder="asset"
                    type="file"
                    accept={acceptedFormats.join(",")}
                    className="hidden"
                    onChange={async (event) =>
                        await upload(event)
                    }
                    ref={imageUploader}
                />
                <label className="label">
                    <span className="label-text text-t2">Media</span>
                </label>
                <div
                    className="w-full h-56 cursor-pointer flex justify-center items-center hover:bg-base-100 transition-all rounded-xl border-2 border-border border-dashed"
                    onClick={() => imageUploader.current?.click()}
                >
                    <div className="flex justify-center items-center w-full h-full">
                        <HiCamera className="w-8 h-8" />
                    </div>
                </div>
            </div>
        );
    }

}