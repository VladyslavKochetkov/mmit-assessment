import { Divider } from "@mui/material";
import { useState } from "react";
import CarResults from "./CarResults";
import CarSearch from "./CarSearch";

const HomePage = () => {
  const [results, setResults] = useState(null);
  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-700 text-slate-50 pt-4">
      <div className="lg:max-w-lg w-full p-4 lg:p-0">
        <CarSearch setResults={setResults} />
        {results && (
          <>
            <Divider className="my-4" />
            <CarResults results={results} />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
