import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import { checkThunk } from "./redux/modules/auth";
import { getMyProfilesThunk } from "./redux/modules/profile";
import { AppDispatch, RootState } from "./redux/store";

export default function App(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(checkThunk());
  }, [dispatch]);

  const userId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    if (userId) {
      dispatch(getMyProfilesThunk(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="app">
      <ErrorBoundary FallbackComponent={NotFoundPage}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/" element={<HomePage />}>
              <Route path="/" element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}
