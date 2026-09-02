import Home from "./Pages/Home";
import FreshProduce from "./Pages/FreshProduce";
import Farmers from "./Pages/Farmers";
import FarmersMarkets from "./Pages/FarmersMarkets";
import Deals from "./Pages/Deals";
import PreviousOrder from "./Pages/PreviousOrder";
import Profile from "./Pages/Profile";

interface displayprop {
    name: string
}



function display (p: displayprop) {
    switch (p.name) {
        case "Home":
            return <Home />
        case "Fresh Produce":
            return <FreshProduce />
        case "Farmers":
            return <Farmers />
        case "Farmers' Markets":
            return <FarmersMarkets />
        case "Deals":
            return <Deals />
        case "Previous Orders":
            return <PreviousOrder />
        case "Profile":
            return <Profile />
        default:
            return <Home />

    } 
}

export default display;
