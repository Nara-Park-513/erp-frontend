const GOOGLE_CLIENT_ID =
  "521072625264-0vh31d53gbc1nknjvc2n77qkte19s2ap.apps.googleusercontent.com";

const REDIRECT_URI = "http://localhost:5173/auth/google/callback";

export default function GoogleLoginButton() {
  const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&access_type=offline` +
      `&prompt=consent`;

    console.log("구글 로그인 URL:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <button type="button" onClick={handleGoogleLogin}>
      구글 로그인
    </button>
  );
}