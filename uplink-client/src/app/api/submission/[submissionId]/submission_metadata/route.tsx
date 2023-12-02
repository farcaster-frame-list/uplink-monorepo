import { NextRequest, ImageResponse } from "next/server";
import fetchSingleSubmission from "@/lib/fetch/fetchSingleSubmission";

export async function GET(req: NextRequest) {
  const submissionId = req.nextUrl.pathname.split("/")[3];
  const submission = await fetchSingleSubmission(submissionId);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "transparent",
          width: "100%",
          height: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: "white",
        }}
      >
        <svg
          style={{
            // position: "absolute",
            // top: 0,
            // left: 0,
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="1200" height="600" fill="black" />
          <path
            d="M12.3047 422.808L40.8672 423.217C69.3672 423.676 126.492 424.494 183.68 426.231C240.867 427.917 298.117 430.471 355.305 420.918C412.492 411.415 469.617 389.753 526.68 378.207C583.742 366.609 640.867 365.076 697.93 373.149C754.992 381.272 812.117 398.949 869.305 394.964C926.492 390.979 983.742 365.23 1040.93 353.326C1098.12 341.422 1155.24 343.261 1183.74 344.232L1200.29 344.232V474.356V600.601H1183.74C1155.24 600.601 1098.12 600.601 1040.93 600.601C983.742 600.601 926.492 600.601 869.305 600.601C812.117 600.601 754.992 600.601 697.93 600.601C640.867 600.601 583.742 600.601 526.68 600.601C469.617 600.601 412.492 600.601 355.305 600.601C298.117 600.601 240.867 600.601 183.68 600.601C126.492 600.601 69.3672 600.601 40.8672 600.601H12.3047V422.808Z"
            fill="#FA7268"
          />
          <path
            d="M0 424.338L28.5625 421.528C57.0625 418.718 114.188 413.098 171.375 420.353C228.563 427.557 285.812 447.686 343 456.678C400.187 465.721 457.312 463.677 514.375 463.269C571.438 462.809 628.562 464.035 685.625 462.145C742.688 460.254 799.812 455.35 857 444.672C914.187 434.045 971.438 417.696 1028.63 411.923C1085.81 406.099 1142.94 410.901 1171.44 413.252L1200 415.653V600.087H1171.44C1142.94 600.087 1085.81 600.087 1028.63 600.087C971.438 600.087 914.187 600.087 857 600.087C799.812 600.087 742.688 600.087 685.625 600.087C628.562 600.087 571.438 600.087 514.375 600.087C457.312 600.087 400.187 600.087 343 600.087C285.812 600.087 228.563 600.087 171.375 600.087C114.188 600.087 57.0625 600.087 28.5625 600.087H0L0 424.338Z"
            fill="#EF5F67"
          />
          <path
            d="M0 422.809L28.5625 432.158C57.0625 441.559 114.188 460.257 171.375 466.49C228.563 472.723 285.812 466.388 343 461.228C400.187 456.017 457.312 451.93 514.375 454.74C571.438 457.55 628.562 467.257 685.625 468.023C742.688 468.789 799.812 460.615 857 464.089C914.187 467.614 971.438 482.737 1028.63 488.204C1085.81 493.67 1142.94 489.379 1171.44 487.284L1200 485.138V600.09H1171.44C1142.94 600.09 1085.81 600.09 1028.63 600.09C971.438 600.09 914.187 600.09 857 600.09C799.812 600.09 742.688 600.09 685.625 600.09C628.562 600.09 571.438 600.09 514.375 600.09C457.312 600.09 400.187 600.09 343 600.09C285.812 600.09 228.563 600.09 171.375 600.09C114.188 600.09 57.0625 600.09 28.5625 600.09H0L0 422.809Z"
            fill="#E34C67"
          />
          <path
            d="M0 532.649L28.5625 524.73C57.0625 516.811 114.188 500.973 171.375 501.637C228.563 502.352 285.812 519.519 343 522.839C400.187 526.16 457.312 515.636 514.375 505.673C571.438 495.711 628.562 486.31 685.625 486.923C742.688 487.536 799.812 498.061 857 500.207C914.187 502.352 971.438 496.017 1028.63 491.93C1085.81 487.843 1142.94 486.004 1171.44 485.033L1200 484.113V600.087H1171.44C1142.94 600.087 1085.81 600.087 1028.63 600.087C971.438 600.087 914.187 600.087 857 600.087C799.812 600.087 742.688 600.087 685.625 600.087C628.562 600.087 571.438 600.087 514.375 600.087C457.312 600.087 400.187 600.087 343 600.087C285.812 600.087 228.563 600.087 171.375 600.087C114.188 600.087 57.0625 600.087 28.5625 600.087H0L0 532.649Z"
            fill="#D53867"
          />
          <path
            d="M0 554.108L28.5625 549.102C57.0625 544.044 114.188 534.03 171.375 535.103C228.563 536.227 285.812 548.489 343 554.773C400.187 561.108 457.312 561.414 514.375 560.75C571.438 560.086 628.562 558.349 685.625 558.451C742.688 558.553 799.812 560.393 857 556.305C914.187 552.218 971.438 542.205 1028.63 535.461C1085.81 528.717 1142.94 525.345 1171.44 523.608L1200 521.922V600.089H1171.44C1142.94 600.089 1085.81 600.089 1028.63 600.089C971.438 600.089 914.187 600.089 857 600.089C799.812 600.089 742.688 600.089 685.625 600.089C628.562 600.089 571.438 600.089 514.375 600.089C457.312 600.089 400.187 600.089 343 600.089C285.812 600.089 228.563 600.089 171.375 600.089C114.188 600.089 57.0625 600.089 28.5625 600.089H0L0 554.108Z"
            fill="#C62368"
          />
        </svg>
        <div
          style={{
            zIndex: 2,
            position: "absolute",
            top: "10%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_CLIENT_URL}/uplink-logo.svg`}
            alt="uplink logo"
            width="68"
            height="100"
            style={{ filter: "grayscale(100%)" }}
          />
          <h2 style={{ maxWidth: "80%", fontFamily: "Ubuntu", color: "#6b7280" }}>{submission.data.title}</h2>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}
