import { useState } from "react";

interface props {
  orders: any;
}

const OrdersSearch = ({ orders }: props) => {
  const [search, setSearch] = useState("");

  return (
    <div className="orders-search-wrapper">
      <input
        type="text"
        className="orders-search-input"
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};
export default OrdersSearch;
