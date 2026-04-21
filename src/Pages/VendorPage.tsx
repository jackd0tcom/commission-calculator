import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";
import Loader from "../components/UI/Loader";

const VendorPage = () => {
  const { vendorId } = useParams();
  const [vendorData, setVendorData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendor = async () => {
    try {
      await axios.get(`/api/getVendor/${vendorId}`).then((res) => {
        console.log(res.data);
        setVendorData(res.data);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="vendor-page-wrapper">
      <div className="page-header-wrapper">
        <h2>{vendorData?.vendorName}</h2>
      </div>
    </div>
  );
};
export default VendorPage;
