import { useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const InstagramRedirect = () => {
  const [params] = useSearchParams();
  const code = params.get("code");

  useEffect(() => {
    if (code) {
      axios
        .post("http://localhost:8888/auth/instagram", { code })
        .then((res) => {
          alert("Instagram 로그인 완료");
          window.location.href = "/";
        })
        .catch(() => alert("Instagram 로그인 실패"));
    }
  }, [code]);

  return <div>Instagram 로그인 처리중...</div>;
};

export default InstagramRedirect;
