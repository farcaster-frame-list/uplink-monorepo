// Render the submission in a large format. This is used for modals and the submission page.
import { Submission } from "@/providers/ContestInteractionProvider";
import Image from "next/image";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaPosterImage,
  MediaLoadingIndicator,
} from "media-chrome/dist/react";
import { ParseBlocks } from "@/lib/blockParser";
import { HiOutlineVolumeOff, HiOutlineVolumeUp } from "react-icons/hi";
import { ImageWrapper, VideoWrapper } from "./MediaWrapper";
import { AddressOrEns, UserAvatar } from "../AddressDisplay/AddressDisplay";

const RenderSubmissionBody = ({ submission }: { submission: Submission }) => {
  return (
    <div className="">
      <section className="break-word">
        {submission.type === "twitter" ? (
          <p className="">{submission.data.thread[0].text}</p>
        ) : (
          <section>{ParseBlocks({ data: submission.data.body })}</section>
        )}
      </section>
    </div>
  );
};

const RenderImageSubmission = ({ submission }: { submission: Submission }) => {
  return (
    <ImageWrapper>
      <Image
        src={
          submission.type === "standard"
            ? submission.data.previewAsset
            : submission.data.thread[0].previewAsset
        }
        alt="submission image"
        fill
        className="object-contain rounded-xl w-full h-full overflow-hidden"
        sizes="80vw"
      />
    </ImageWrapper>
  );
};

const RenderVideoSubmission = ({ submission }: { submission: Submission }) => {
  return (
    <VideoWrapper>
      <MediaController className="w-full h-fit aspect-video bg-transparent">
        <video
          autoPlay={false}
          playsInline
          slot="media"
          src={
            submission.type === "twitter"
              ? submission.data.thread[0].videoAsset
              : submission.data.videoAsset
          }
          preload="auto"
          crossOrigin=""
          className="w-full aspect-video object-cover rounded-xl"
          poster={
            submission.type === "twitter"
              ? submission.data.thread[0].previewAsset
              : submission.data.previewAsset
          }
        />
        <MediaLoadingIndicator slot="centered-chrome" />

        <div className="flex flex-col items-end justify-end w-full m-auto bg-gradient-to-t from-black rounded-b-xl">
          <div className="flex w-full h-8 cursor-pointer">
            <MediaTimeRange className="bg-transparent w-full"></MediaTimeRange>
          </div>
          <div className="flex w-full">
            <MediaPlayButton className="bg-transparent"></MediaPlayButton>
            <MediaMuteButton className="bg-transparent">
              <span slot="high">
                <HiOutlineVolumeUp className="h-6 w-6 text-t1" />
              </span>
              <span slot="off">
                <HiOutlineVolumeOff className="h-6 w-6 text-t1" />
              </span>
            </MediaMuteButton>
            <MediaTimeDisplay
              showDuration
              noToggle
              className="bg-transparent"
            />
            <MediaFullscreenButton className="bg-transparent ml-auto" />
          </div>
        </div>
      </MediaController>
    </VideoWrapper>
  );
};

const ExpandedSubmission = ({
  submission,
  headerChildren,
}: {
  submission: Submission;
  headerChildren?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl text-t1 font-[500]">{submission.data.title}</h2>
        <div className="flex flex-row items-center justify-center">
          <div className="flex gap-2 items-center">
            <UserAvatar address={submission.author} size={28} />
            <h3 className="break-all italic text-sm text-t2 font-semibold">
              <AddressOrEns address={submission.author} />
            </h3>
          </div>
          {headerChildren}
        </div>
      </div>
      <div className="w-full h-0.5 bg-base-200" />
      <div className="w-9/12 m-auto">
        {submission.data.type === "video" && (
          <div>
            <RenderVideoSubmission submission={submission} />
          </div>
        )}
        {submission.data.type === "image" && (
          <div>
            <RenderImageSubmission submission={submission} />
          </div>
        )}
      </div>
      <RenderSubmissionBody submission={submission} />
    </div>
  );
};

export default ExpandedSubmission;
