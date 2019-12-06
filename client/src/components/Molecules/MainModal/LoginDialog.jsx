import React, { useState, useContext } from "react";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {
  DialogStyle,
  InputContainer,
  Input,
  SubmitButton,
  DivisionLine,
  Footer,
  OAuthLoginButton,
  SignUpButton,
  KakaoButton,
  GoogleButton
} from "./LoginDialogStyles";
import UserContext from "../../../context/UserContext";
import apiConfig from "../../../config/api";
import pathConfig from "../../../config/path";
import { jsonFetch } from "../../../services/fetchService";

const { apiUrl } = apiConfig;
const { sign } = pathConfig;

const LoginDialog = ({ signUp, close }) => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [user, setUser] = useContext(UserContext);

  const handleSubmit = async e => {
    const body = {
      username: id,
      password: pwd
    };
    const res = await jsonFetch(`${apiUrl}${sign.in}`, {}, body);
    const { msg, user } = res;
    if (msg) {
      setUser(user);
      localStorage.setItem("access-token", user.accessToken);
      localStorage.setItem("refresh-token", user.refreshToken);
      close();
    } else alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    e.preventDefault();
  };

  const onSuccessKakaoLogin = async result => {
    const { profile, response } = result;
    const { id, kakao_account, properties } = profile;
    const { access_token, refresh_token } = response;
    const { nickname, profile_image } = properties;
    const { email } = kakao_account;
    const body = {
      id,
      name: nickname,
      email: email,
      profileUrl: profile_image
    };
    const headers = {
      "access-token": access_token,
      "refresh-token": refresh_token,
      "Content-Type": "application/json"
    };
    const res = await jsonFetch(`${apiUrl}${sign.kakao}`, headers, body);

    const { msg, user } = res;
    if (msg) {
      console.log(user);
      setUser(user);
      localStorage.setItem("access-token", user.accessToken);
      localStorage.setItem("refresh-token", user.refreshToken);
      close();
    } else alert("카카오 로그인에 실패하였습니다.");
  };

  const onSuccessGoogleLogin = async result => {
    const response = await jsonFetch(
      `${apiUrl}${sign.google}`,
      { "auth-code": result.code },
      {}
    );
    const { msg, user } = response;
    if (msg) {
      console.log(user);
      setUser(user);
      localStorage.setItem("access-token", user.accessToken);
      localStorage.setItem("refresh-token", user.refreshToken);
      close();
    } else alert("구글 로그인에 실패하였습니다.");
  };

  const handleKeyUpId = e => {
    setId(e.target.value);
  };

  const handleKeyUpPwd = e => {
    setPwd(e.target.value);
  };

  return (
    <DialogStyle>
      <form action="#" onSubmit={handleSubmit}>
        <DialogContent>
          <InputContainer>
            <Input
              type="text"
              name="username"
              placeholder="ID"
              onKeyUp={handleKeyUpId}
            />
            <Input
              type="password"
              name="password"
              placeholder="PASSWORD"
              onKeyUp={handleKeyUpPwd}
            />
          </InputContainer>
        </DialogContent>
        <DialogActions>
          <SubmitButton type="submit">로그인</SubmitButton>
        </DialogActions>
      </form>
      <DivisionLine />
      <Footer>
        <GoogleButton
          clientId={process.env.REACT_APP_GOOGLE_KEY}
          buttonText={"구글"}
          onSuccess={onSuccessGoogleLogin}
          onFailure={result => console.log(result)}
          responseType={"code"}
          accessType={"offline"}
          prompt={"consent"}
        />
        <KakaoButton
          jsKey={process.env.REACT_APP_KAKAO_KEY}
          onSuccess={onSuccessKakaoLogin}
          onFailure={result => console.log(result)}
          getProfile="true"
          buttonText="카카오"
        />
        <OAuthLoginButton color="#2DB400">네이버</OAuthLoginButton>
        <SignUpButton onClick={signUp}>회원가입</SignUpButton>
      </Footer>
    </DialogStyle>
  );
};

export default LoginDialog;
