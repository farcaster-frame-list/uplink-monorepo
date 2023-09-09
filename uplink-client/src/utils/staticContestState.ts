
import {
    differenceInSeconds,
    differenceInMinutes,
    differenceInHours,
    differenceInDays,
    parseISO,
} from "date-fns";

/**
 *
 * returns the contest state and the remaining time in a static server-side context.
 * for dynamic client-side context, use the useContestStatus hook.
 *
 */

export const calculateContestStatus = (deadlines: any, contestType: "standard" | "twitter", tweetId: string) => {

    if (contestType === "twitter" && !tweetId) {
        return {
            contestState: "pending",
            stateRemainingTime: null,
        };
    }

    const { startTime, voteTime, endTime } = deadlines;
    const start = parseISO(startTime);
    const vote = parseISO(voteTime);
    const end = parseISO(endTime);

    let contestState = null;
    let remainingTime = null;

    const now = new Date();
    let nextDeadline = end;

    if (now < start) {
        contestState = "pending";
        nextDeadline = start;
    } else if (now < vote) {
        contestState = "submitting";
        nextDeadline = vote;
    } else if (now < end) {
        contestState = "voting";
    } else {
        contestState = "closed";
    }

    const seconds = differenceInSeconds(nextDeadline, now);
    const minutes = differenceInMinutes(nextDeadline, now);
    const hours = differenceInHours(nextDeadline, now);
    const days = differenceInDays(nextDeadline, now);

    if (days > 0) {
        remainingTime = `${days} days`;
    } else if (hours > 0) {
        remainingTime = `${hours} hrs`;
    } else if (minutes > 0) {
        remainingTime = `${minutes} mins`;
    } else {
        remainingTime = seconds > 0 ? `${seconds} s` : null;
    }

    return {
        contestState,
        stateRemainingTime: remainingTime,
    };
};