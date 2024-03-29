import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import ErrorMessage from "../Components/ErrorMessage";
import HomeIcon from "@mui/icons-material/Home";

const Signup = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate: NavigateFunction = useNavigate();

  const navigateIndex = () => {
    navigate("/");
  };

  useEffect(() => {
    document.title = "Flip-Flaap - Sign up";
    const theme: string | null = localStorage.getItem("darkmode");
    if (theme === "darkmode") document.documentElement.setAttribute("data-color-scheme", "dark");
    else document.documentElement.setAttribute("data-color-scheme", "light");
  });

  const signup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email: string = (document.querySelector("input[name='email']") as HTMLInputElement).value;
    const username: string = (document.querySelector("input[name='username']") as HTMLInputElement).value;
    const password: string = (document.querySelector("input[name='password']") as HTMLInputElement).value;
    const confirmPassword: string = (document.querySelector("input[name='confirm-password']") as HTMLInputElement)
      .value;

    axios
      .post(`https://flip-flaap-backend.onrender.com/api/signup`, { email, username, password, confirmPassword })
      .then((res) => {
        if (res.data.message === "User created") {
          localStorage.setItem("token", res.data.token);
          navigateIndex();
        }
      })
      .catch((err) => {
        switch (err.response.data) {
          case "Empty username":
            return setErrorMessage("Error: username is empty");
          case "There was a problem":
            return setErrorMessage("Error: there was a problem.");
          case "Username already exists":
            return setErrorMessage("Error: username is already being used.");
          case "Email already exists":
            return setErrorMessage("Error: email is already being used");
          case "email":
            return setErrorMessage("Error: you need to enter your email adress.");
          case "password":
            return setErrorMessage("Error: your password needs to be at least 6 characters long.");
          case "Passwords special characters":
            return setErrorMessage(
              "Error: your password must contain 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character."
            );
          case "Passwords need to match":
            return setErrorMessage("Error: passwords need to match.");
        }
      });
  };

  const handleChange = () => {
    const email: string = (document.querySelector("input[name='email']") as HTMLInputElement).value;
    const username: string = (document.querySelector("input[name='username']") as HTMLInputElement).value;
    const password: string = (document.querySelector("input[name='password']") as HTMLInputElement).value;
    const confirmPassword: string = (document.querySelector("input[name='confirm-password']") as HTMLInputElement)
      .value;
    switch (errorMessage) {
      case "Error: Username is empty":
        if (username !== "") setErrorMessage("");
        break;
      case "Error: passwords need to match.":
        if (password === confirmPassword) setErrorMessage("");
        break;
      case "Error: you need to enter your email adress.":
        if (email !== "") setErrorMessage("");
        break;
      case "Error: your password needs to be at least 6 characters long.":
        if (password.length > 6) setErrorMessage("");
        break;
      case "Error: your password must contain 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.":
        const regexPattern: RegExp = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])");
        const checkPattern: boolean = regexPattern.test(password);
        if (checkPattern) setErrorMessage("");
        break;
      default:
        return;
    }
  };
  return (
    <div className="bg">
      <form onSubmit={(e) => signup(e)} className="form form-auth">
        <h1 className="title">Sign up</h1>
        <div className="wrapper-input-auth">
          <label htmlFor="email" className="input-label">
            Email
          </label>
          <input type="email" name="email" className="input-text" onChange={() => handleChange()} />
          <label htmlFor="username" className="input-label">
            Username
          </label>
          <input type="text" name="username" className="input-text" onChange={() => handleChange()} />
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <input type="password" name="password" className="input-text" onChange={() => handleChange()} />
          <label htmlFor="confirm-password" className="input-label">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirm-password"
            className="input-text"
            onChange={() => handleChange()}
          />
        </div>
        {errorMessage !== "" ? <ErrorMessage textError={errorMessage} /> : null}
        <span className="wrapper-button-auth">
          <button type="submit" className="btn-primary">
            Sign up
          </button>
          <button className="btn-white btn-border" onClick={() => navigateIndex()}>
            {<HomeIcon />}
          </button>
        </span>
      </form>
    </div>
  );
};

export default Signup;
