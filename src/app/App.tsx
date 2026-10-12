import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { WorkspaceLayout } from "../components/layout/WorkspaceLayout";
import "../styles/global.css";

export default function App() {
  return (
    <ErrorBoundary>
      <WorkspaceLayout />
    </ErrorBoundary>
  );
}
