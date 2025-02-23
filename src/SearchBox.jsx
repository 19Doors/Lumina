import { useEffect, useState } from "react";

const SearchBox = () => {
  const [result, setResults] = useState([]);
  const [resultDir, setResultsDir] = useState([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (query.length > 0) {
      window.electronAPI.searchFiles(query)
        .then((files) => {
          setResults(files[0]);
          setResultsDir(files[1]);
          // Dynamically adjust window height based on number of results:
          const newHeight = Math.min(50 + (files[0].length + files[1].length) * 30, 500); // 30px per result, max 500px
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
    <div className="">
      <input
        type="text"
        placeholder="Search..."
	className="p-4 w-3xl focus:outline-none focus:border-transparent border-black"
	value={query}
	onChange={(e) => setQuery(e.target.value)}
      />
      <div className="pl-4">
      <h3 className="font-bold"> Directories </h3>
      <div className="Dirs">
        {resultDir.map((item, index) => (
          <div key={index} className="Dir-item">
	  {index} - <button onClick={(e)=>{
	    window.electronAPI.exec(item);
	  }}>{item}</button>
          </div>
        ))}
      </div>
      <h3 className="font-bold"> Files </h3>
      <div className="results">
        {result.map((item, index) => (
          <div key={index} className="result-item">
	  {index} - <button onClick={(e)=>{
	    window.electronAPI.exec(item);
	  }}>{item}</button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default SearchBox;
