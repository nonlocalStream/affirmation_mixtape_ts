import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import EditProjectPage from "./components/EditProjectPage";
import ViewProject from "./components/ViewProject";

function App() {
  // TODO: use react router
  if (window.location.pathname.includes("view")) {
    return <ViewProject/>;
  }
  return <EditProjectPage />;
}

export default App;
