import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ProductItem from "../components/Products/ProductItem";
import { useSelector } from "react-redux";
import { FaTrashCan } from "react-icons/fa6";
import Loader from "../components/UI/Loader";
import Sorter from "../components/Clients/Sorter";

const Products = () => {
  const [productList, setProductList] = useState([{}]);
  const [users, setUsers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: any) => state.user);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    sort: "",
    direction: "up",
  });

  const fetchProducts = async () => {
    try {
      if (!user.isAdmin) {
        await axios.get(`/api/getProducts/${user.userId}`).then((res) => {
          if (res.status === 200) {
            console.log(res.data);
            setProductList(
              res.data.products.sort((a: any, b: any) =>
                (a.productName ?? "")
                  .toLowerCase()
                  .localeCompare((b.productName ?? "").toLowerCase()),
              ),
            );
            setIsLoading(false);
          }
        });
      } else
        await axios.get(`/api/getAdminProducts`).then((res) => {
          if (res.status === 200) {
            console.log(res.data);
            setProductList(
              res.data.products.sort((a: any, b: any) =>
                (a.productName ?? "")
                  .toLowerCase()
                  .localeCompare((b.productName ?? "").toLowerCase()),
              ),
            );
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

  const filteredProducts = useMemo(() => {
    let data: any = productList;

    if (search.trim() !== "") {
      // Search filtering
      const searchQuery = search.trim().toLowerCase();
      data = data.filter((product: any) => {
        if (product.productName.toLowerCase().includes(searchQuery))
          return true;
      });
    }

    // Sorting
    if (filter.sort !== "") {
      data = data.sort((a: any, b: any) => {
        switch (filter.sort) {
          case "date":
            return filter.direction === "up"
              ? new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime();
            break;

          case "price":
            return filter.direction === "up"
              ? a.defaultPrice - b.defaultPrice
              : b.defaultPrice - a.defaultPrice;
            break;

          case "cost":
            return filter.direction === "up"
              ? a.defaultCost - b.defaultCost
              : b.defaultCost - a.defaultCost;
            break;

          default:
            break;
        }
      });
    } else
      data = data.sort((a: any, b: any) =>
        (a.productName ?? "")
          .toLowerCase()
          .localeCompare((b.productName ?? "").toLowerCase()),
      );

    return data;
  }, [filter, search, productList]);

  const handleAddProduct = async () => {
    try {
      await axios.post("/api/newProduct").then((res) => {
        if (res.status === 200) {
          setProductList((prev) => [...prev, res.data]);
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
      <div className="products-page-body">
        <div className="products-top-bar">
          <input
            type="text"
            placeholder="Search"
            className="orders-search-input"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Sorter
            filter={filter}
            setFilter={setFilter}
            options={[
              {
                heading: "Date Created",
                sortHeading: "sort",
                sortValue: "date",
              },
              {
                heading: "Cost",
                sortHeading: "sort",
                sortValue: "cost",
              },
              {
                heading: "Price",
                sortHeading: "sort",
                sortValue: "price",
              },
            ]}
            direction="direction"
            position="left"
          />
        </div>
        <div className="products-list-wrapper">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="product-list-item product-list-head">
                <p>#</p>
                <p>Product</p>
                <p>Dynamic Cost</p>
                <p>Cost</p>
                <p>Default Price</p>
                <p>Commission Rate</p>
                <p>Spiff</p>
                <FaTrashCan className={"trash-can-icon"} />
              </div>
              {filteredProducts.length > 0 &&
                filteredProducts?.map((product: any, index: number) => {
                  return (
                    <ProductItem
                      users={users}
                      key={
                        (product as { productId?: number }).productId ?? index
                      }
                      product={product}
                      index={index}
                      handleDeleteItem={handleDeleteItem}
                      isAdmin={user.isAdmin}
                      productList={productList}
                      setProductList={setProductList}
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
    </div>
  );
};
export default Products;
