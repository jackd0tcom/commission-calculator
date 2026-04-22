import { useState } from "react";
import axios from "axios";
import { TiDelete } from "react-icons/ti";
import { FaLink } from "react-icons/fa6";
import { capitalize } from "../../helpers";

interface props {
  link: any;
  index: number;
  isAdmin: boolean;
  handleDeleteLink: any;
  linkList: any;
  setLinkList: any;
  setCart: any;
  cart: any;
}

const LinkItem = ({
  link,
  index,
  isAdmin,
  handleDeleteLink,
  linkList,
  setLinkList,
  setCart,
}: props) => {
  const [name, setName] = useState(link?.linkName ?? "Add a name");
  const [cost, setCost] = useState(link?.cost ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [defaultPrice, setDefaultPrice] = useState(link?.defaultPrice ?? 0);
  const [commissionRate, setCommissionRate] = useState(
    link?.commissionRate ?? 0,
  );
  const [spiff, setSpiff] = useState(link?.spiff ?? 0.0);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateLink = async (fieldName: string, value: string) => {
    try {
      await axios
        .post("/api/updateLink", {
          linkId: link.linkId,
          fieldName,
          value,
        })
        .then((res) => {
          console.log(res.data);
          if (res.status === 200) {
            const listCopy = [...linkList];
            const currentLink = listCopy.find(
              (link: any) => link.linkId === link.linkId,
            );
            if (fieldName === "commissionRate") {
              currentLink[fieldName] = value;
            }
            setLinkList(listCopy);
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
            handleDeleteLink(link.linkId);
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
  ) : isAdmin ? (
    <div className="links-list-item">
      <p>{index + 1}</p>
      <input
        type="text"
        className="product-list-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name !== link.productName) {
            updateLink("linkName", name);
          }
        }}
        onKeyDown={(e) => {
          if (name === link.productName) {
            return;
          }
          if (e.key === "Enter") {
            updateLink("linkName", name);
          }
        }}
      />
      <input
        type="text"
        className="product-list-name"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => {
          if (url !== link.url) {
            updateLink("url", url);
          }
        }}
        onKeyDown={(e) => {
          if (url === link.url) {
            return;
          }
          if (e.key === "Enter") {
            updateLink("url", url);
          }
        }}
      />
      <div className="link-list-number-wrapper">
        <p>$</p>
        <input
          type="number"
          className="link-list-number"
          value={cost}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < 0) {
              return;
            }
            setCost(e.target.value);
          }}
          onBlur={() => {
            if (cost !== link.cost) {
              updateLink("cost", cost);
            }
          }}
          onKeyDown={(e) => {
            if (cost === link.cost) {
              return;
            }
            if (e.key === "Enter") {
              updateLink("cost", cost);
            }
          }}
        />
      </div>
      <div className="link-list-number-wrapper">
        <p>$</p>
        <input
          type="number"
          className="link-list-number"
          value={defaultPrice}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < 0) {
              return;
            }
            setDefaultPrice(e.target.value);
          }}
          onBlur={() => {
            if (defaultPrice !== link.defaultPrice) {
              updateLink("defaultPrice", defaultPrice);
            }
          }}
          onKeyDown={(e) => {
            if (defaultPrice === link.defaultPrice) {
              return;
            }
            if (e.key === "Enter") {
              updateLink("defaultPrice", defaultPrice);
            }
          }}
        />
      </div>
      <input
        type="number"
        className="link-list-number"
        value={commissionRate}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val < 0) {
            return;
          }
          setCommissionRate(e.target.value);
        }}
        onBlur={() => {
          if (commissionRate !== link.commissionRate) {
            updateLink("commissionRate", commissionRate);
          }
        }}
        onKeyDown={(e) => {
          if (commissionRate === link.commissionRate) {
            return;
          }
          if (e.key === "Enter") {
            updateLink("commissionRate", commissionRate);
          }
        }}
      />
      <div className="link-list-number-wrapper">
        <p>$</p>
        <input
          type="number"
          className="link-list-number"
          value={spiff}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val < 0) {
              return;
            }
            setSpiff(e.target.value);
          }}
          onBlur={() => {
            if (spiff !== link.spiff) {
              updateLink("spiff", spiff);
            }
          }}
          onKeyDown={(e) => {
            if (spiff === link.spiff) {
              return;
            }
            if (e.key === "Enter") {
              updateLink("spiff", spiff);
            }
          }}
        />
      </div>
      <TiDelete
        className="sheet-item-delete"
        onClick={() => setIsDeleting(true)}
      />
    </div>
  ) : (
    <div className="links-list-item">
      <div>{link.publication}</div>
      <div>{link.genre}</div>
      <div>${link.defaultPrice}</div>
      <div>{link.DA}</div>
      <div>{link.DR}</div>
      <div>{link.TAT}</div>
      <div>{link.region}</div>
      <div>{capitalize(link.sponsored)}</div>
      <div>{link.indexed ? "Yes" : "No"}</div>
      <div>{link.doFollow ? "Yes" : "No"}</div>
      <div className="link-example-wrapper">
        <a href={url}>
          <FaLink className="link-example" />
        </a>
      </div>
      <div>
        <button
          onClick={() => {
            setCart((prev: any) => {
              const hit = prev.some((item: any) => item.linkId === link.linkId);
              if (!hit) {
                return [...prev, { ...link, quantity: 1 }];
              }
              return prev.map((item: any) =>
                item.linkId === link.linkId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              );
            });
          }}
          className="link-add-to-cart"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
export default LinkItem;
