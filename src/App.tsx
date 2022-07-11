import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import { checkThunk } from "./redux/modules/auth";
import { getMyProfilesThunk } from "./redux/modules/profile";
import { AppDispath, RootState } from "./redux/store";

export default function App(): JSX.Element {
  const dispatch = useDispatch<AppDispath>();
  useEffect(() => {
    dispatch(checkThunk());
  }, [dispatch]);

  const username = useSelector((state: RootState) => state.auth.username);

  useEffect(() => {
    if (username) {
      dispatch(getMyProfilesThunk());
    }
  }, [dispatch, username]);

  return (
    <div className="app">
      <ErrorBoundary FallbackComponent={NotFoundPage}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}
