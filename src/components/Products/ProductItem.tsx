import { useState, useRef } from "react";
import axios from "axios";
import { TiDelete } from "react-icons/ti";

const ProductItem = ({ product, index, handleDeleteItem }) => {
  const [name, setName] = useState(
    product?.productName ? product?.productName : "Add a name",
  );
  const [cost, setCost] = useState(product?.cost ? product?.cost : "");
  const [defaultPrice, setDefaultPrice] = useState(
    product?.defaultPrice ? product?.defaultPrice : 0,
  );
  const [commissionRate, setCommissionRate] = useState(
    product?.commissionRate ? product?.commissionRate : 0,
  );
  const [spiff, setSpiff] = useState(product?.spiff ? product.spiff : 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const nameRef = useRef(null);
  const costRef = useRef(null);
  const priceRef = useRef(null);
  const commissionRef = useRef(null);
  const spiffRef = useRef(null);

  const updateProduct = async (fieldName: string, value: string) => {
    try {
      await axios
        .post("/api/updateProduct", {
          productId: product.productId,
          fieldName,
          value,
        })
        .then((res) => {
          if (res.status === 200) {
            return;
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return isDeleting ? (
    <div className="product-delete-modal">
      <p>Are you sure you want to delete {name}?</p>
      <div>
        <button
          className="delete-product"
          onClick={() => {
            handleDeleteItem(product.productId);
            setIsDeleting(false);
          }}
        >
          Delete
        </button>
        <button
          className="cancel-delete-product"
          onClick={() => setIsDeleting(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="product-list-item">
      <p>{index + 1}</p>
      <input
        type="text"
        className="product-list-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name !== product.productName) {
            updateProduct("productName", name);
          }
        }}
        onKeyDown={(e) => {
          if (name === product.productName) {
            return;
          }
          if (e.key === "Enter") {
            updateProduct("sheetTitle", name);
            nameRef.current.blur();
          }
        }}
      />
      <div className="product-list-number-wrapper">
        <p>$</p>
        <input
          type="number"
          className="product-list-number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          onBlur={() => {
            if (cost !== product.cost) {
              updateProduct("cost", cost);
            }
          }}
          onKeyDown={(e) => {
            if (cost === product.cost) {
              return;
            }
            if (e.key === "Enter") {
              updateProduct("cost", cost);
              costRef.current.blur();
            }
          }}
        />
      </div>
      <div className="product-list-number-wrapper">
        <p>$</p>
        <input
          type="number"
          className="product-list-number"
          value={defaultPrice}
          onChange={(e) => setDefaultPrice(e.target.value)}
          onBlur={() => {
            if (defaultPrice !== product.defaultPrice) {
              updateProduct("defaultPrice", defaultPrice);
            }
          }}
          onKeyDown={(e) => {
            if (defaultPrice === product.defaultPrice) {
              return;
            }
            if (e.key === "Enter") {
              updateProduct("defaultPrice", defaultPrice);
              priceRef.current.blur();
            }
          }}
        />
      </div>
      <input
        type="number"
        className="product-list-number"
        value={commissionRate}
        onChange={(e) => setCommissionRate(e.target.value)}
        onBlur={() => {
          if (commissionRate !== product.commissionRate) {
            updateProduct("commissionRate", commissionRate);
          }
        }}
        onKeyDown={(e) => {
          if (commissionRate === product.commissionRate) {
            return;
          }
          if (e.key === "Enter") {
            updateProduct("commissionRate", commissionRate);
            commissionRef.current.blur();
          }
        }}
      />
      <div className="product-list-number-wrapper">
        <p>$</p>
        <input
          type="number"
          className="product-list-number"
          value={spiff}
          onChange={(e) => setSpiff(e.target.value)}
          onBlur={() => {
            if (spiff !== product.spiff) {
              updateProduct("spiff", spiff);
            }
          }}
          onKeyDown={(e) => {
            if (spiff === product.spiff) {
              return;
            }
            if (e.key === "Enter") {
              updateProduct("spiff", spiff);
              spiffRef.current.blur();
            }
          }}
        />
      </div>
      <TiDelete
        className="sheet-item-delete"
        onClick={() => setIsDeleting(true)}
      />
    </div>
  );
};
export default ProductItem;
