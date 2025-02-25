import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function AI({answer}) {
  window.electronAPI.adjustHeight(400);
  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">AI</h1>
      <p>{answer}</p>
    </div>
  );
}

function SearchAllFiles({ resultDir, result }) {
  return (
    <>
      <div className="pl-4 pt-4">
        <h3 className="font-bold"> Directories </h3>
        <div className="Dirs">
          {resultDir.map((item, index) => (
            <div key={index} className="Dir-item">
              <Button
                variant="ghost"
                onClick={(e) => {
                  window.electronAPI.exec(item);
                }}
              >
                {item}
              </Button>
            </div>
          ))}
        </div>
        <h3 className="font-bold"> Files </h3>
        <div className="results">
          {result.map((item, index) => (
            <div key={index} className="result-item">
              <Button
                variant="ghost"
                onClick={(e) => {
                  window.electronAPI.exec(item);
                }}
              >
                {item}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const SearchBox = () => {
  const [result, setResults] = useState([]);
  const [resultDir, setResultsDir] = useState([]);
  const [query, setQuery] = useState("");
  const [isAI, setIsAI] = useState(false);
  const [AIAnswer, setAIAnswer] = useState("");
  const handleKeyDown= (e) => {
    if(e.key=="Enter"){
      const tq = query.trim();
      if(tq.length>0 && tq[0]=='/') {
	console.log("AI Detected");
	setIsAI(true);
	window.electronAPI.getAIQuery(query).then((e)=>{setAIAnswer(e)}).catch((e)=>{console.error(e)});
      }else {
	setIsAI(false);
      }
    }
  };
  useEffect(() => {
    if (query.length > 0) {
      if (query[0] == "/") {
      } else {
        setIsAI(false);
      }
      window.electronAPI
        .searchFiles(query)
        .then((files) => {
          setResults(files[0]);
          setResultsDir(files[1]);
          // Dynamically adjust window height based on number of results:
          const newHeight = Math.min(
            50 + (files[0].length + files[1].length) * 30,
            500,
          ); // 30px per result, max 500px
          window.electronAPI.adjustHeight(newHeight);
        })
        .catch((err) => {
          console.error("Search error:", err);
        });
    } else {
      setResults([]);
      window.electronAPI.adjustHeight(50); // Reset height if query is empty
    }
  }, [query]);
  return (
    <div>
      <input
        type="text"
        placeholder="Search... | Begin with / for AI"
        className="p-4 w-full focus:outline-none focus:border-transparent"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
	onKeyDown={handleKeyDown}
      />
      <Separator />
      {!isAI && <SearchAllFiles resultDir={resultDir} result={result} />}
      {isAI && <AI answer={AIAnswer}/>}
    </div>
  );
};

export default SearchBox;
