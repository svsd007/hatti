import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayPage from "./DisplayPage";

import Home from "./Pages/Home";
import FreshProduce from "./Pages/FreshProduce";
import Farmers from "./Pages/Farmers";
import Deals from "./Pages/Deals";
import PreviousOrder from "./Pages/PreviousOrder";


import {BrowserRouter, Routes, Route, Link} from "react-router-dom"
import FarmersMarkets from "./Pages/FarmersMarkets";
import Profile from "./Pages/Profile";


// function App() {


// //   const [page, setPage] = useState("Home")
  

//   return (
//     <div className="app-shell">
//       {/* <Navbar func = {setPage}/> */}
//       <Navbar/>

//       <div className="app-layout">
//         {/* <Sidebar func={setPage}/> */}
//         <Sidebar/>

//         <main className="hatti-main">
//             {/* <DisplayPage name = {page} /> */}

//         </main>
//       </div>
//     </div>
//   );
// }

// export default App;




function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <div className="app-layout">
          <Sidebar />

          <main className="hatti-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/fresh-produce" element={<FreshProduce />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/previous-orders" element={<PreviousOrder />} />
              <Route path="/farmers-markets" element={<FarmersMarkets />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;