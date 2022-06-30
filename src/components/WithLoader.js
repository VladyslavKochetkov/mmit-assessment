import { CircularProgress, Fade } from "@mui/material";
import clsx from "clsx";

const WithLoader = ({ shown, children }) => {
  return (
    <div className={"relative"}>
      <Fade in={shown}>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <CircularProgress size={24} />
        </div>
      </Fade>
      <div
        className={clsx(
          "transition-opacity duration-200 ease-in-out",
          shown ? "opacity-50" : "opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default WithLoader;
