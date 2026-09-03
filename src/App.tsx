import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayPage from "./DisplayPage";




function App() {


  const [page, setPage] = useState("Home")
  

  return (
    <div className="app-shell">
      <Navbar func = {setPage}/>

      <div className="app-layout">
        <Sidebar func={setPage}/>

        <main className="hatti-main">
            <DisplayPage name = {page} />

        </main>
      </div>
    </div>
  );
}

export default App;
