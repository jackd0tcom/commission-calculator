import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/UI/Loader";

const Links = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [linkList, setLinkList] = useState([{}]);

  const fetchLinks = async () => {
    try {
      await axios.get("/api/getLinks").then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setLinkList(res.data);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="links-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Links</h2>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="links-page-body">
          <div className="links-list-wrapper">
            <div className="links-list-item links-list-head">
              <p>#</p>
              <p>Provider</p>
              <p>URL</p>
              <p>Name</p>
              <p></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Links;
