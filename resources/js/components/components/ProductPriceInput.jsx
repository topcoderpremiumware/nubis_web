import {useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import eventBus from "../../eventBus";

const ProductPriceInput = ({ product, onChangeProductPrice }) => {
  const [localPrice, setLocalPrice] = useState(
    (product.pivot.price * product.pivot.quantity)?.toFixed(2) || ""
  );

  useEffect(() => {
    setLocalPrice((product.pivot.price * product.pivot.quantity)?.toFixed(2) || "")
  },[product.pivot.quantity])

  const handleChange = (e) => {
    let value = e.target.value;

    // Дозволяємо пусте значення
    if (value === "") {
      setLocalPrice("");
      return;
    }

    let numValue = Number(value) / product.pivot.quantity || 0;
    setLocalPrice(value);
    onChangeProductPrice(product, numValue);
  };

  return (
    <TextField
      size="small"
      style={{ minWidth: "105px" }}
      type="number"
      id="price"
      name="price"
      onChange={handleChange}
      value={localPrice}
      onBlur={() => setLocalPrice((product.pivot.price * product.pivot.quantity)?.toFixed(2))}
    />
  );
};

export default ProductPriceInput;
