import axios from "axios";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const KakaoRedirect = () => {
  const [params] = useSearchParams();
  const code = params.get("code");

  useEffect(() => {
    if (code) {
      axios
        .post("http://localhost:8888/auth/kakao", { code })
        .then((res) => {
          alert("카카오 로그인 완료");
          window.location.href = "/";
        })
        .catch(() => alert("카카오 로그인 실패"));
    }
  }, [code]);

  return <div>Kakao 로그인 처리중...</div>;
};

export default KakaoRedirect;
