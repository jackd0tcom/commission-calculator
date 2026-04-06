import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../components/UI/Loader";
import LinkItem from "../components/Links/LinkItem";

const Links = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [linkList, setLinkList] = useState([{}]);
  const user = useSelector((state: any) => state.user);

  const fetchLinks = async () => {
    try {
      await axios.get("/api/getLinks").then((res) => {
        if (res.status === 200) {
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

  const handleAddLink = async () => {
    try {
      await axios.post("/api/newLink").then((res) => {
        if (res.status === 200) {
          setLinkList((prev) => [res.data, ...prev]);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      await axios.post("/api/deleteLink", { linkId }).then((res) => {
        if (res.status === 200) {
          setLinkList((prev) =>
            prev.filter(
              (l) =>
                Number((l as { linkId?: number }).linkId) !== Number(linkId),
            ),
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

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
              <p>Name</p>
              <p>URL</p>
              <p>Cost</p>
              <p>Price</p>
              <p>Commission Rate</p>
              <p>Spiff</p>
            </div>
            <div className="links-list">
              {linkList?.length > 0 &&
                linkList?.map((link: any, index: number) => (
                  <LinkItem
                    link={link}
                    index={index}
                    isAdmin={user.isAdmin}
                    key={(link as { linkId?: number }).linkId ?? index}
                    handleDeleteLink={handleDeleteLink}
                    linkList={linkList}
                    setLinkList={setLinkList}
                  />
                ))}
              {user?.isAdmin && (
                <div
                  onClick={() => handleAddLink()}
                  className="product-list-item add-product-wrapper"
                >
                  <p>+</p>
                  <p>Add Link</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Links;
