import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";

export default function App(): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={NotFoundPage}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
