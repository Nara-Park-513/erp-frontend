import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";

const INSTAGRAM_CLIENT_ID = "YOUR_INSTAGRAM_CLIENT_ID";
const INSTAGRAM_REDIRECT_URI = "http://localhost:5174/auth/instagram";

const KAKAO_CLIENT_ID = "YOUR_INSTAGRAM_CLIENT_ID";
const KAKAO_REDIRECT_URI = "http://localhost:5174/auth/kakao";

const handleInstargramLogin = () => {
const url=`https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
window.location.href=url;
}

const handleKakaoLogin = () => {
const url=`https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
window.location.href=url;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  companyName: string;
  position: string;
  tel: string;
  address: string;
  detailAddress: string;
  gender: string; // 추가
}

declare global {
  interface Window {
    daum: any;
  }
}

const Member = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    companyName: "",
    position: "",
    tel: "",
    address: "",
    detailAddress: "",
    gender: "", // 초기값 add
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!window.daum || !window.daum.Postcode) {
      console.error("다음 주소 검색 api가 로드되지 않았습니다");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setFormData((prev) => ({ ...prev, address: data.address }));
      },
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.repeatPassword) {
      alert("비밀번호와 확인이 일치하지 않습니다!");
      return;
    }

    if (!formData.gender) {
      alert("성별을 선택해주세요!");
      return;
    }

    try {
      const { repeatPassword, ...payload } = formData;
      await axios.post("http://localhost:8888/members", payload);
      alert("회원가입이 완료되었습니다");
      window.location.href = "http://localhost:5173/login";
    } catch (err) {
      console.error(err);
      alert("회원가입 중 에러가 발생했습니다");
    }
  };

  return (
    <Container className="mt-5">
      <script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
      ></script>

      <Card className="o-hidden border-0 shadow-lg mt-150">
        <Card.Body className="p-0">
          <Row>
            <div className="col-lg-5 d-none d-lg-block bg-register-image"></div>
            <div className="col-lg-7">
              <div className="p-5">
                <div className="text-center">
                  <h1 className="h4 text-gray-900 mb-4">Create an Account!</h1>
                </div>
                <Form className="user" onSubmit={handleSubmit}>
                  <div className="form-group row mb-2">
                    <Col sm={6} className="mb-3 mb-sm-0">
                      <Form.Control
                        type="text"
                        className="form-control-user"
                        placeholder="이름"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Control
                        type="text"
                        className="form-control-user"
                        placeholder="성"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </Col>
                  </div>

                  <div className="form-group mb-2">
                    <Form.Control
                      type="email"
                      className="form-control-user"
                      placeholder="이메일"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group row mb-2">
                    <Col sm={6} className="mb-3 mb-sm-0">
                      <Form.Control
                        type="password"
                        className="form-control-user"
                        placeholder="비밀번호"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="password"
                        className="form-control-user"
                        placeholder="비밀번호 확인"
                        name="repeatPassword"
                        value={formData.repeatPassword}
                        onChange={handleChange}
                      />
                    </Col>
                  </div>

                  {/* 성별 추가 */}
                  <div className="form-group mb-2">
                    <label className="mr-3 form-label mx-2">성별 : </label>
                    <Form.Check
                      inline
                      type="radio"
                      label="남성"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="여성"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="기타"
                      name="gender"
                      value="other"
                      checked={formData.gender === "other"}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <div className="d-flex justify-between">
                      <Form.Control
                        type="text"
                        className="form-control-user"
                        placeholder="회사명"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                      <Form.Control
                        type="text"
                        className="form-control-user mx-4"
                        placeholder="직급"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                      />
                      <Form.Control
                        type="text"
                        className="form-control-user"
                        placeholder="전화번호"
                        name="tel"
                        value={formData.tel}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="d-flex btn-group br50">
                      <Form.Control
                        type="text"
                        className="form-control w-75"
                        name="address"
                        value={formData.address}
                        readOnly
                      />
                      <button
                        onClick={handleAddressSearch}
                        className="btn btn-secondary w-25"
                      >
                        주소검색
                      </button>
                    </div>
                    <div className="">
                      <Form.Control
                        type="text"
                        className="form-control-user w-100 mt-3"
                        placeholder="상세주소"
                        name="detailAddress"
                        value={formData.detailAddress}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="btn-user btn-block mb-2"
                  >
                    Register Account
                  </Button>
                </Form>
                <hr />

<a href= "/" 
className="btn btn-google btn-user btn-block mb-2"
onClick={handleInstargramLogin}
>
    <i className="">
    
    </i>Register with Insta
</a>

<a href= "/" 
className="btn btn-facebook btn-user btn-block mb-2"
onClick={handleInstargramLogin}
>
      <i className="">
    
    </i>Register with Kakao
</a>

                <div className="text-center mb-2">
                  <a href="/forgot" className="small">
                    Forgot password?
                  </a>
                </div>
                <div className="text-center">
                  <a href="/login" className="small">
                    Already have an account? Login!
                  </a>
                </div>
              </div>
            </div>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Member;