import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type SearchResult = {
  id: number | string;
  type: string;
  title: string;
  path: string;
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error("검색 요청 실패");
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
        setError("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div style={{ padding: "24px" }}>
      <h2>검색 결과</h2>
      <p>
        검색어: <strong>{query || "-"}</strong>
      </p>

      {!query ? (
        <p>검색어를 입력해주세요.</p>
      ) : loading ? (
        <p>검색 중...</p>
      ) : error ? (
        <p>{error}</p>
      ) : results.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {results.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <Link
                to={item.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div style={{ fontSize: "13px", color: "#888" }}>
                  {item.type}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "13px", color: "#999", marginTop: "6px" }}>
                  {item.path}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;