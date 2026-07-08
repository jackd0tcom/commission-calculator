import { useEffect, useState, useRef } from "react";
import { TbArrowsSort } from "react-icons/tb";
import { FaX } from "react-icons/fa6";
import { FaSortAmountDownAlt, FaSortAmountUp } from "react-icons/fa";

interface props {
  filter: any;
  setFilter: any;
}

const OrderSort = ({ filter, setFilter }: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isFiltered = filter.sort !== "";
  const dropdownRef = useRef<HTMLInputElement>(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-sort-filter-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="order-sort-wrapper">
      <button
        className={
          !isFiltered
            ? "order-sort-filter-button"
            : "order-sort-filter-button order-sort-filtered"
        }
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <TbArrowsSort />
        Sort
        {isFiltered && (
          <span
            className="order-sort-filter-x-wrapper"
            onClick={() => {
              setFilter({ ...filter, sort: "" });
              setTimeout(() => {
                setShowDropdown(false);
              }, 50);
            }}
          >
            <FaX className="order-sort-filter-x" />
          </span>
        )}
      </button>
      {isFiltered && (
        <button
          onClick={() => {
            filter.direction === "up"
              ? setFilter({ ...filter, direction: "down" })
              : setFilter({ ...filter, direction: "up" });
          }}
          className="order-sort-direction"
        >
          {filter.direction === "up" ? (
            <FaSortAmountDownAlt />
          ) : (
            <FaSortAmountUp />
          )}
        </button>
      )}
      {showDropdown && (
        <div className="dropdown order-sort-dropdown" ref={dropdownRef}>
          <div
            className="dropdown-item"
            onClick={() => {
              if (filter.sort !== "dateCreated") {
                setFilter({ ...filter, sort: "dateCreated" });
              } else {
                setFilter({ ...filter, sort: "" });
              }
              setShowDropdown(false);
            }}
          >
            Date Created
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              if (filter.sort !== "client") {
                setFilter({ ...filter, sort: "client" });
              } else {
                setFilter({ ...filter, sort: "" });
              }
              setShowDropdown(false);
            }}
          >
            Client
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              if (filter.sort !== "status") {
                setFilter({ ...filter, sort: "status" });
              } else {
                setFilter({ ...filter, sort: "" });
              }
              setShowDropdown(false);
            }}
          >
            Status
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              if (filter.sort !== "number") {
                setFilter({ ...filter, sort: "number" });
              } else {
                setFilter({ ...filter, sort: "" });
              }
              setShowDropdown(false);
            }}
          >
            Order #
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              if (filter.sort !== "m2m") {
                setFilter({ ...filter, sort: "m2m" });
              } else {
                setFilter({ ...filter, sort: "" });
              }
              setShowDropdown(false);
            }}
          >
            M2M
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderSort;
