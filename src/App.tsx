import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App(): JSX.Element {
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
