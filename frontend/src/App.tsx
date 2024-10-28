import { useState } from "react";
import Alert from "./components/Alert";
import Button from "./components/Button";
import ListGroup from "./components/ListGroup";

function App() {
  let items = ["Paris", `Tokio`, "Rio", "Madrid", "Cartagena"];
  const handleSelectItem = (item: string) => {
    console.log(item);
  };
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {visible && (
        <Alert
          onClick={() => {
            setVisible(false);
          }}
        >
          Button Clicked
        </Alert>
      )}
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        Show alert
      </Button>

      <ListGroup
        items={items}
        heading="Cities"
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}

export default App;
