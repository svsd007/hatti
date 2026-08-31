import ListGroup from "./components/ListGroup";




function App() {
    const handleSelectItem = (item: string) => {
        console.log(item);
    }
    const items: string[] = ["New York", "Chandigarh", "Surrey"];
    return <div> <ListGroup items = {items} heading = "Cities" onSelectItem={handleSelectItem}/> </div>;
}

export default App;
