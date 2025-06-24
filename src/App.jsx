import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("http://localhost:8000/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({ error: "요청 실패" });
    }
    setLoading(false);
  };

  return (
    <div className="warm-container">
      <h2>오늘의 일기</h2>
      <Link
        to="/summary"
        className="warm-btn"
        style={{ marginBottom: "1.5em" }}
      >
        일기 분석하러 가기
      </Link>
      <textarea
        className="warm-textarea"
        rows={10}
        placeholder="여기에 오늘의 일기를 적어주세요..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />
      <button
        className="warm-btn"
        onClick={handleSubmit}
        disabled={loading || !prompt}
      >
        {loading ? "전송 중..." : "Claude에게 보내기"}
      </button>
      {response && (
        <div className="warm-response">
          {response.response ? (
            (() => {
              let parsed = null;
              try {
                if (typeof response.response === "string") {
                  let cleanResponse = response.response;
                  cleanResponse = cleanResponse.replace(/\\"/g, '"');
                  if (
                    cleanResponse.startsWith('"') &&
                    cleanResponse.endsWith('"')
                  ) {
                    cleanResponse = cleanResponse.slice(1, -1);
                  }
                  try {
                    parsed = JSON.parse(cleanResponse);
                  } catch {
                    return <pre>{response.response}</pre>;
                  }
                  parsed = response.response;
                }
                if (
                  typeof parsed === "object" &&
                  parsed !== null &&
                  !Array.isArray(parsed)
                ) {
                  const entries = Object.entries(parsed);
                  return (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {entries.map(([key, value]) => (
                        <li
                          key={key}
                          style={{
                            marginBottom: "0.7em",
                            fontSize: "1.1em",
                            padding: "0.5em",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "5px",
                            borderLeft: "3px solid #007bff",
                          }}
                        >
                          <strong style={{ color: "#007bff" }}>{key}</strong>
                          {Array.isArray(value) ? (
                            <span>: {value.join(", ")}</span>
                          ) : value !== undefined &&
                            value !== null &&
                            value !== "" ? (
                            <span>: {value}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  );
                } else {
                  return (
                    <pre>{JSON.stringify(response.response, null, 2)}</pre>
                  );
                }
              } catch {
                return <pre>{response.response}</pre>;
              }
            })()
          ) : (
            <pre>{JSON.stringify(response, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

function Summary() {
  const [diary, setDiary] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSummary = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/claude/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: diary }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "요청 실패" });
    }
    setLoading(false);
  };

  return (
    <div className="warm-container">
      <h2>일기 분석</h2>
      <Link to="/" className="warm-btn" style={{ marginBottom: "1.5em" }}>
        홈으로 돌아가기
      </Link>
      <textarea
        className="warm-textarea"
        rows={10}
        placeholder="분석할 일기 내용을 입력하세요..."
        value={diary}
        onChange={(e) => setDiary(e.target.value)}
      />
      <br />
      <button
        className="warm-btn"
        onClick={handleSummary}
        disabled={loading || !diary}
      >
        {loading ? "분석 중..." : "분석 요청"}
      </button>
      {result && (
        <div className="warm-response">
          {result.response ? (
            <div
              style={{
                fontSize: "1.2em",
                color: "#7a4c2a",
                padding: "1em",
                background: "#fff8f3",
                borderRadius: "10px",
                marginTop: "1em",
              }}
            >
              {result.response}
            </div>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </Router>
  );
}

export default App;
