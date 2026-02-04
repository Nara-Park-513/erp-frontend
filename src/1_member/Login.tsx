import { useState } from "react";
import axios from "axios";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // 초기화
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해 주세요!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8888/members/login", {
        email,
        password,
      });

      // ✅ 여기서 백엔드가 토큰을 내려준다고 가정: res.data.token
      const token = res.data?.token;

      if (!token) {
        alert("로그인 응답에 token이 없습니다. 백엔드 응답을 확인하세요!");
        console.log("login response:", res.data);
        return;
      }

      // ✅ 1) 토큰 저장 (ProtectedRoute가 읽는 키 = "token" 맞춰야 함)
      localStorage.setItem("token", token);

      alert("로그인 성공");

      // ✅ 2) window.location.href 말고 SPA 라우팅으로 이동
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      alert("로그인 실패! 이메일 또는 비밀번호를 확인해 주세요");
    }
  };

  return (
    <>
      <Container>
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg mt-200 ">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                      </div>

                      <form className="user" onSubmit={handleSubmit}>
                        <div className="form-group">
                          <input
                            type="email"
                            className="form-control form-control-user"
                            id="exampleInputEmail"
                            aria-describedby="emailHelp"
                            placeholder="Enter Email Address..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            id="exampleInputPassword"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input
                              type="checkbox"
                              className="custom-control-input mx-2"
                              id="customCheck"
                            />
                            <label className="custom-control-label" htmlFor="customCheck">
                              Remember Me
                            </label>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-user btn-block">
                          Login
                        </button>

                        <hr />

                        <div className="mb-2">
                          <a href="#" className="btn btn-google btn-user btn-block">
                            <i className="fab fa-google fa-fw"></i> Login with Google
                          </a>
                        </div>
                        <a href="#" className="btn btn-facebook btn-user btn-block">
                          <i className="fab fa-facebook-f fa-fw"></i> Login with Facebook
                        </a>
                      </form>

                      <hr />
                      <div className="text-center">
                        <a className="small" href="/forgot">
                          Forgot Password?
                        </a>
                      </div>
                      <div className="text-center">
                        <a className="small" href="/member">
                          Create an Account!
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Login;
