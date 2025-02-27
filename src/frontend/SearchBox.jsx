import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Markdown from "react-markdown";

function AILoading({ answer }) {
  window.electronAPI.adjustHeight(400);
  return (
    <div className="p-4">
      <Skeleton className="h-12 w-full" />
      <Separator className="mt-2 mb-2" />
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-full mb-2" />
    </div>
  );
}
function AI({ answer }) {
  window.electronAPI.adjustHeight(400);
  return (
    <div className="p-4">
      <Markdown className="text-2xl">{answer[0]}</Markdown>
      <Separator className="mt-2 mb-2" />
      <Markdown>{answer[1]}</Markdown>
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
  const [isLoading, setIsLoading] = useState(false);
  const [pdfParsedText, setPdfParsedText] = useState("");

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdfParsedTextt = await window.electronAPI.parsePDF(arrayBuffer);
      setPdfParsedText(pdfParsedTextt);
    } catch (err) {
      console.error("Error while parsing: " + err);
      console.error("Failed to parse.");
    }
  };
  const handleKeyDown = async (e) => {
    if (e.key == "Enter") {
      const tq = query.trim();
      if (tq.length > 0 && tq[0] == "/") {
        console.log("AI Detected");
        setIsAI(true);
        setIsLoading(true);
        try {
	  let emailText="";
	  const parsedCommand = await window.electronAPI.getCommand(query);
	  console.log("TYPE: "+parsedCommand.type);
	  switch(parsedCommand.type) {
	    case "email":
	      let emails = await window.electronAPI.getEmails("ok");
	      console.log("EMAILS SET DONE "+emails);
	      emailText=emails;
	      break;

	    default:
	      console.log("NO");
	      break;
	  }
	  console.log("PARSED");
          const response = await window.electronAPI.getAIQuery(
	    [query, pdfParsedText, emailText]
          );
          setAIAnswer(response);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsAI(false);
      }
    }
  };
  useEffect(() => {}, [isLoading]);
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
      <div className="flex pl-4 pr-4 pt-4 pb-2">
        <input
          type="text"
          placeholder="Search... | Begin with / for AI, upload pdf for AI to handle -> "
          className="basis-2/3 w-full focus:outline-none focus:border-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="basis-1/3 grid w-full max-w-sm items-center gap-1.5">
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <Separator />
      {!isAI && <SearchAllFiles resultDir={resultDir} result={result} />}
      {isAI && isLoading && <AILoading />}
      {isAI && !isLoading && <AI answer={AIAnswer} />}
    </div>
  );
};

export default SearchBox;
