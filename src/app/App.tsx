import { APP_NAME } from "../shared/constants/app";
import "../styles/global.css";

export default function App() {
  return (
    <main className="app">
      <h1>{APP_NAME}</h1>
      <p>AI-assisted learning workspace</p>
    </main>
  );
}
