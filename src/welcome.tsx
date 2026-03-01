import { useNavigate } from "react-router-dom";
import "./Welcome.css";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <h1>ERP 시스템에 오신 것을 환영합니다.</h1>
        <p>로그인 또는 회원가입 후 서비스를 이용하실 수 있습니다.</p>

        <div className="button-group">
          <button className="login-btn" onClick={() => navigate("/login")}>
            로그인
          </button>
          <button className="signup-btn" onClick={() => navigate("/member")}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;