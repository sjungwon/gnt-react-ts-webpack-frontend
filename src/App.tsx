import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import { checkThunk } from "./redux/modules/auth";
import { AppDispath } from "./redux/store";

export default function App(): JSX.Element {
  const dispatch = useDispatch<AppDispath>();
  useEffect(() => {
    dispatch(checkThunk());
  });

  return (
    <div className="test">
      <ErrorBoundary FallbackComponent={NotFoundPage}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/signin" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}
