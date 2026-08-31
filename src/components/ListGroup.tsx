import { useState } from "react";

interface ListGroupProps {
    items: string[]
    heading: string
    onSelectItem: (item: string) => void
}


function ListGroup(props: ListGroupProps) {
  
    const items = props.items;
    const heading = props.heading;
    const onSelectItem = props.onSelectItem;
  //StateHook -> we can tell react that this component has data or state that can change over time

  const [selectedIndex, setSelectedIndex] = useState(-1) // returns array

  return (
    <>
      <h1>{heading}</h1>
      <ul className="list-group">
        
        {items.map((item, index) => (
          <li
            key={item}
            className= {selectedIndex === index ? "list-group-item active" : "list-group-item"} 
            onClick = {() => {setSelectedIndex(index);
                onSelectItem(item);
            }}
            aria-current="true"
          >
            {item}{" "}
          </li>
        ))}

        
      </ul>
    </>
  );
}

export default ListGroup;
