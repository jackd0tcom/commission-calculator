import { useState, useEffect, useMemo } from "react";
import { useRef } from "react";
import axios from "axios";
import Loader from "../components/UI/Loader";
import FilterDropdown from "../components/UI/FilterDropdown";
import { usePersistedFilter } from "../hooks/usePersistedFilter";
import { useSelector } from "react-redux";
import OrderItem from "../components/Orders/OrderItem";
import Sorter from "../components/Clients/Sorter";
import OrderFooter from "../components/Orders/OrderFooter";

type FilterOption = {
  title: string;
  id?: number;
  profilePic?: string;
};

const Production = () => {
  const user = useSelector((state: any) => state.user);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vendorList, setVendorList] = useState([{}]);
  const [productList, setProductList] = useState([{}]);
  const [linkList, setLinkList] = useState([{}]);
  const [bulkSelects, setBulkSelects] = useState([]);
  const listWrapperRef = useRef<HTMLDivElement>(null);
  const statusOrder = [
    "staged",
    "ordered",
    "in progress",
    "complete",
    "cancelled",
    "support needed",
  ];
  const [filter, setFilter] = usePersistedFilter(`production`, user.userId, {
    due: [],
    product: [],
    vendor: [],
    status: [],
    client: [],
    sales: [],
    sort: "",
    direction: "up",
  });
  const [dueDates, setDueDates] = useState<FilterOption[]>([]);
  const [products, setProducts] = useState<FilterOption[]>([]);
  const [vendors, setVendors] = useState<FilterOption[]>([]);
  const [statuses, setStatuses] = useState<FilterOption[]>([]);
  const [clients, setClients] = useState<FilterOption[]>([]);
  const [sales, setSales] = useState<FilterOption[]>([]);

  const createFilters = (items: any) => {
    // Create arrays for filters
    let dueDatesArray: FilterOption[] = [];
    let productsArray: FilterOption[] = [];
    let vendorsArray: FilterOption[] = [];
    let statusesArray: FilterOption[] = [];
    let clientsArray: FilterOption[] = [];
    let salesArray: FilterOption[] = [];

    items.forEach((item: any) => {
      if (item.dueDate) {
        const monthKey = item.dueDate.slice(0, 7);
        if (!dueDatesArray.some((date) => date.id === monthKey)) {
          const [year, month] = item.dueDate.split("-");
          dueDatesArray.push({
            title: `${month}/${year}`,
            id: monthKey,
          });
        }
      }
      if (
        item.product &&
        !productsArray.some(
          (product: any) => product.id === item.product?.productId,
        )
      ) {
        productsArray.push({
          title: item.product.productName,
          id: item.product.productId,
        });
      }
      if (
        item.vendor &&
        !vendorsArray.some((vendor: any) => vendor.id === item.vendor?.vendorId)
      ) {
        vendorsArray.push({
          title: item.vendor.vendorName,
          id: item.vendor.vendorId,
        });
      }
      if (!statusesArray.some((status: any) => status.id === item.itemStatus)) {
        if (item.itemStatus) {
          statusesArray.push({
            title: item.itemStatus,
            id: item.itemStatus,
          });
        }
      }
      if (
        !clientsArray.some((client: any) => client.id === item.order?.clientId)
      ) {
        clientsArray.push({
          title: item.order?.client?.clientName,
          id: item.order?.clientId,
        });
      }
      if (
        !salesArray.some(
          (sales: any) => sales.id === item.order?.salesPersonUser.userId,
        )
      ) {
        salesArray.push({
          title: item.order?.salesPersonUser.firstName,
          id: item.order?.salesPersonUser.userId,
          profilePic: item.order?.salesPersonUser.profilePic,
        });
      }
    });
    setSales(salesArray);
    setClients(
      clientsArray.sort((a: any, b: any) => a.title.localeCompare(b.title)),
    );
    setVendors(
      vendorsArray.sort((a: any, b: any) => a.title.localeCompare(b.title)),
    );
    setProducts(
      productsArray.sort((a: any, b: any) => a.title.localeCompare(b.title)),
    );
    setStatuses(
      statusesArray.sort(
        (a: any, b: any) =>
          statusOrder.indexOf(a.id) - statusOrder.indexOf(b.id),
      ),
    );
    setDueDates(
      dueDatesArray.sort(
        (a: any, b: any) => new Date(a.id).getTime() - new Date(b.id).getTime(),
      ),
    );
  };

  const fetch = async () => {
    try {
      const promises = [];

      promises.push(
        axios.get("/api/getProductionOrderItems").then((res) => {
          setOrderItems(res.data);
          console.log(res.data);
          setIsLoading(false);
          createFilters(res.data);
        }),
      );
      promises.push(
        axios.get("/api/getVendors").then((res) => {
          if (res.status === 200) setVendorList(res.data);
        }),
      );

      promises.push(
        axios.get(`/api/getProducts/${user?.userId}`).then((res) => {
          if (res.status === 200) {
            setProductList(res.data.products);
            setLinkList(res.data.links);
          }
        }),
      );
      await Promise.all(promises);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // Filtering / Sorting
  const filteredOrderItems = useMemo(() => {
    let data: any = orderItems;

    if (search.trim() !== "") {
      const searchTerm = search.toLowerCase();
      data = data.filter((item: any) => {
        // Return true since searchTerm only has to match with one of the items, not match all criteria

        // Search in products
        if (item.product?.productName.toLowerCase().includes(searchTerm))
          return true;

        // Search in client
        if (item.order?.client?.clientName?.toLowerCase().includes(searchTerm))
          return true;

        // Search in client
        if (item.orderId.toString().includes(searchTerm)) return true;

        // Search in vendors
        if (item.vendor?.vendorName.toLowerCase().includes(searchTerm))
          return true;

        // Search status date
        if (item.itemStatus?.toLowerCase().includes(searchTerm)) return true;
      });
    }

    // Filtering
    data = data.filter((item: any) => {
      if (!item) {
        return false;
      }
      if (filter.due.length > 0) {
        if (
          !filter.due.some((date: any) => item.dueDate?.slice(0, 7) === date.id)
        )
          return false;
      }
      if (filter.client.length > 0) {
        if (
          !filter.client.some(
            (client: any) => client.id === item.order?.clientId,
          )
        )
          return false;
      }
      if (filter.product.length > 0) {
        if (
          !filter.product.some(
            (product: any) => product.id === item.product?.productId,
          )
        )
          return false;
      }
      if (filter.vendor.length > 0) {
        if (
          !filter.vendor.some(
            (vendor: any) => vendor.id === item.vendor?.vendorId,
          )
        )
          return false;
      }
      if (filter.status.length > 0) {
        if (!filter.status.some((status: any) => status.id === item.itemStatus))
          return false;
      }
      if (filter.sales.length > 0) {
        if (
          !filter.sales.some(
            (sales: any) => sales.id === item.order?.salesPersonUser?.userId,
          )
        )
          return false;
      }

      return true;
    });

    const clientName = (item: any) =>
      (item.order?.client?.clientName ?? "").toLowerCase();

    // Sorting
    if (filter.sort !== "") {
      data = data.sort((a: any, b: any) => {
        const price = (item: any) => {
          const price =
            item.priceSnapshot ??
            item.price ??
            item.product?.defaultPrice ??
            item.link?.price ??
            0;
          return price;
        };

        const cost = (item: any) => {
          const cost =
            item.costSnapshot ??
            item.cost ??
            item.product?.defaultCost ??
            item.link?.cost;

          0;
          return cost;
        };
        switch (filter.sort) {
          case "due":
            return filter.direction === "up"
              ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            break;

          case "status":
            return filter.direction === "up"
              ? statusOrder.indexOf(a.itemStatus) -
                  statusOrder.indexOf(b.itemStatus)
              : statusOrder.indexOf(b.itemStatus) -
                  statusOrder.indexOf(a.itemStatus);
            break;

          case "price":
            return filter.direction === "up"
              ? price(a) - price(b)
              : price(b) - price(a);
            break;

          case "cost":
            return filter.direction === "up"
              ? cost(a) - cost(b)
              : cost(b) - cost(a);
            break;

          case "client":
            return filter.direction === "up"
              ? clientName(a).localeCompare(clientName(b))
              : clientName(b).localeCompare(clientName(a));
            break;

          case "order":
            return filter.direction === "up"
              ? a.orderId - b.orderId
              : b.orderId - a.orderId;
            break;

          default:
            break;
        }
      });
    }

    return data;
  }, [filter, orderItems, search]);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setOrderItems((prev: any) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, quantity } : it)),
    );
  };

  const handlePriceChange = (itemId: number, price: number) => {
    setOrderItems((prev: any) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, price } : it)),
    );
  };

  const handleCostChange = (itemId: number, cost: number) => {
    setOrderItems((prev: any) =>
      prev.map((it: any) => (it.itemId === itemId ? { ...it, cost } : it)),
    );
  };

  const handleDeliveriesChange = (itemId: number, deliveries: any[]) => {
    setOrderItems((prev: any) =>
      prev.map((it: any) =>
        it.itemId === itemId ? { ...it, deliveries } : it,
      ),
    );
  };

  const handleOrderItemUpdate = (
    fieldName: string,
    itemId: number,
    value: any,
  ) => {
    console.log(fieldName);
    setOrderItems((prev: any) =>
      prev.map((it: any) =>
        it.itemId === itemId ? { ...it, [fieldName]: value } : it,
      ),
    );
  };

  return (
    <div className="production-page-wrapper">
      <div className="page-header-wrapper order-page-header">
        <h2>Production</h2>
      </div>
      <div className="production-page-body">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="production-top-bar">
              <input
                type="text"
                placeholder="Search"
                className="orders-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Sorter
                filter={filter}
                setFilter={setFilter}
                options={[
                  {
                    heading: "Due Date",
                    sortHeading: "sort",
                    sortValue: "due",
                  },
                  {
                    heading: "Client",
                    sortHeading: "sort",
                    sortValue: "client",
                  },
                  {
                    heading: "Order #",
                    sortHeading: "sort",
                    sortValue: "order",
                  },
                  {
                    heading: "Status",
                    sortHeading: "sort",
                    sortValue: "status",
                  },
                  {
                    heading: "Price",
                    sortHeading: "sort",
                    sortValue: "price",
                  },
                  {
                    heading: "Cost",
                    sortHeading: "sort",
                    sortValue: "cost",
                  },
                ]}
                direction="direction"
                position="left"
              />
              <FilterDropdown
                heading="Sales"
                array={true}
                options={sales}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
            <div className="order-items-list" ref={listWrapperRef}>
              <div className="order-items-list-item-production order-items-list-head">
                <div>#</div>
                <FilterDropdown
                  heading={"Client"}
                  array={true}
                  options={clients}
                  filter={filter}
                  setFilter={setFilter}
                />
                <div>Order</div>
                <FilterDropdown
                  heading={"Due"}
                  array={true}
                  options={dueDates}
                  filter={filter}
                  setFilter={setFilter}
                />
                <FilterDropdown
                  heading={"Product"}
                  array={true}
                  options={products}
                  filter={filter}
                  setFilter={setFilter}
                />
                <FilterDropdown
                  heading={"Vendor"}
                  array={true}
                  options={vendors}
                  filter={filter}
                  setFilter={setFilter}
                />
                <FilterDropdown
                  heading={"Status"}
                  array={true}
                  options={statuses}
                  filter={filter}
                  setFilter={setFilter}
                />
                <p>Cost</p>
                <p>Price</p>
                <p className="input-heading">Notes / Restrictions</p>
                <p className="input-heading">Target URL</p>
                <p className="input-heading">Anchor Text</p>
              </div>
              <div className="order-items-list-wrapper">
                {filteredOrderItems?.length > 0 &&
                  filteredOrderItems?.map(
                    (item: any, index: number) =>
                      item.itemId && (
                        <OrderItem
                          isProduction={true}
                          boundaryRef={listWrapperRef}
                          bulkSelects={bulkSelects}
                          setBulkSelects={setBulkSelects}
                          key={`order-item-${item.itemId}`}
                          item={item}
                          index={index}
                          setOrderItems={setOrderItems}
                          products={productList}
                          linkList={linkList}
                          onQuantityChange={handleQuantityChange}
                          onPriceChange={handlePriceChange}
                          onDeliveriesChange={handleDeliveriesChange}
                          vendorList={vendorList}
                          handleOrderItemUpdate={handleOrderItemUpdate}
                          handleCostChange={handleCostChange}
                        />
                      ),
                  )}
              </div>
            </div>
          </>
        )}
        <div className="prod-footer-wrapper">
          <OrderFooter items={filteredOrderItems} clients={clients.length} />
        </div>
      </div>
    </div>
  );
};
export default Production;
