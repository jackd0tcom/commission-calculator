import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Loader from "../components/UI/Loader";

const Vendors = () => {
  const [vendorList, setVendorList] = useState([{}]);
  const [productList, setProductList] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVendors = async () => {
    try {
      await axios.get("/api/getVendors").then((res) => {
        console.log(res.data);
        setVendorList(
          res.data.filter((vendor: any) => vendor.vendorName !== "Interior"),
        );
      });
      await axios.get("/api/getAdminProducts").then((res) => {
        setProductList(res.data.products);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="vendors-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Vendors</h2>
      </div>
      <div className="vendor-list">
        {isLoading ? (
          <Loader />
        ) : (
          vendorList.length > 0 &&
          vendorList?.map((vendor: any) => (
            <div
              className="vendor-item"
              onClick={() => navigate(`/vendor/${vendor.vendorId}`)}
            >
              <h3>{vendor.vendorName}</h3>
              <div className="vendor-sheet-wrapper">
                {vendor.googleSheetId ? (
                  <p>Google Sheet Connected</p>
                ) : (
                  <p>Google Sheet Disconnected</p>
                )}
              </div>
              <div>
                <p>Offered Products</p>
                <div className="vendor-products-wrapper">
                  {vendor.vendor_products.map((product: any) => {
                    const productData: any = productList.find(
                      (prod: any) => prod.productId === product.productId,
                    );
                    return (
                      <div className="vendor-product-item">
                        {productData?.productName}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Vendors;
