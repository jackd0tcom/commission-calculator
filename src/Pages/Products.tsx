import { useState, useEffect } from "react";
import axios from "axios";
import ProductItem from "../components/Products/ProductItem";
import { useSelector } from "react-redux";
import { FaTrashCan } from "react-icons/fa6";

const Products = () => {
  const [productList, setProductList] = useState([{}]);
  const [users, setUsers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: any) => state.user);

  const fetchProducts = async () => {
    try {
      if (!user.isAdmin) {
        await axios.get(`/api/getProducts/${user.userId}`).then((res) => {
          if (res.status === 200) {
            setProductList(res.data);
            setIsLoading(false);
          }
        });
      } else
        await axios.get(`/api/getAdminProducts`).then((res) => {
          if (res.status === 200) {
            console.log(res.data);
            setProductList(res.data.products);
            setUsers(res.data.users);
            setIsLoading(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user.userId) {
      fetchProducts();
    }
  }, [user.userId]);

  const handleAddProduct = async () => {
    try {
      await axios.post("/api/newProduct").then((res) => {
        if (res.status === 200) {
          setProductList((prev) => [res.data, ...prev]);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteItem = async (productId: number) => {
    try {
      await axios.post("/api/deleteProduct", { productId }).then((res) => {
        if (res.status === 200) {
          setProductList((prev) =>
            prev.filter(
              (p) =>
                Number((p as { productId?: number }).productId) !==
                Number(productId),
            ),
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="products-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Products</h2>
      </div>
      <div className="products-list-wrapper">
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>
            <div className="product-list-item product-list-head">
              <p>#</p>
              <p>Product</p>
              <p>Cost</p>
              <p>Default Price</p>
              <p>Commission Rate</p>
              <p>Spiff</p>
              <FaTrashCan className={"trash-can-icon"} />
            </div>
            {productList?.map((product, index) => {
              return (
                <ProductItem
                  users={users}
                  key={(product as { productId?: number }).productId ?? index}
                  product={product}
                  index={index}
                  handleDeleteItem={handleDeleteItem}
                  isAdmin={user.isAdmin}
                />
              );
            })}
          </>
        )}
        {user?.isAdmin && (
          <div
            onClick={() => handleAddProduct()}
            className="product-list-item add-product-wrapper"
          >
            <p>+</p>
            <p>Add Product</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Products;
