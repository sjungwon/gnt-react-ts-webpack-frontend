import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CategoryPage from "./pages/CategoryPage";
import HomePage from "./pages/HomePage";
import LayoutPage from "./pages/LayoutPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import UserPage from "./pages/UserPage";
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
            <Route element={<LayoutPage />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/categories" element={<CategoryPage />}>
                <Route path=":title" element={<CategoryPage />} />
              </Route>
              <Route path="/profiles" element={<ProfilePage />}>
                <Route path=":id" element={<ProfilePage />} />
              </Route>
              <Route path="/usernames" element={<UserPage />}>
                <Route path=":username" element={<UserPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}
