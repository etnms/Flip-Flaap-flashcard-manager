import "./SessionExpired.scss";
import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { changeExpiredStatus } from "../features/expiredSessionSlice";
import { Dispatch } from "redux";

const SessionExpired = () => {
  const sessionExpired: boolean = useAppSelector((state) => state.expiredSession.value);
  const [countdownValue, setCountdownValue] = useState<number>(5);
  const navigate: NavigateFunction = useNavigate();
  const dispatch: Dispatch<any> = useAppDispatch();

  useEffect(() => {
    document.title = "Flip-Flaap - Session expired";
    if (countdownValue > 0) setTimeout(() => setCountdownValue(countdownValue - 1), 1000);
    if (countdownValue === 0) {
      navigate("/login");
      setCountdownValue(5);
      dispatch(changeExpiredStatus(false));
    }
  }, [countdownValue, navigate, dispatch]);

  const renderRedirect = () => {
    if (sessionExpired)
      return (
        <main className="redirect-main">
          <div className="wrapper-redirect-message">
            <p>Your session has expired.</p>
            <p>We'll redirect you to the login page.</p>
            <p>{countdownValue}</p>
          </div>
        </main>
      );
    else return null;
  };

  return renderRedirect();
};

export default SessionExpired;
