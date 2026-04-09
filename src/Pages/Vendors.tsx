import { useState, useEffect } from "react";
import axios from "axios";

const Vendors = () => {
  const [vendorList, setVendorList] = useState([{}]);

  const fetchVendors = async () => {
    try {
      await axios.get("/api/getVendors").then((res) => {
        console.log(res.data);
        setVendorList(
          res.data.filter((vendor: any) => vendor.vendorName !== "Interior"),
        );
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
      <div className="vendor-list-wrapper">
        {vendorList.length > 0 &&
          vendorList?.map((vendor: any) => (
            <div className="vendor-item">
              <h3>{vendor.vendorName}</h3>
            </div>
          ))}
      </div>
    </div>
  );
};
export default Vendors;
