import ProfilePic from "../UI/ProfilePic";
import { useState } from "react";
import axios from "axios";

interface props {
  user: any;
  product: any;
}

const UserProductRow = ({ user, product }: props) => {
  const userProductCommission =
    product.user_product_commissions?.find(
      (item: any) => item.userId === user.userId,
    ) ?? null;
  const id = userProductCommission ? userProductCommission.id : null;
  const userProductRate =
    userProductCommission?.commissionRate ?? product.commissionRate;
  const [commission, setCommission] = useState(userProductRate);

  const updateCommissionRate = async () => {
    try {
      await axios
        .post("/api/updateUserCommissionRate", {
          id: id ?? null,
          productId: product.productId,
          userId: user.userId,
          commissionRate: Number(commission),
        })
        .then((res) => {
          if (res.status === 200) {
            setCommission(res.data.commissionRate);
            return;
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="product-list-item user-product-row">
      <ProfilePic src={user.profilePic} />
      <p>{user.firstName + " " + user.lastName}</p>
      <p></p>
      <p></p>
      <input
        type="number"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        onBlur={() => {
          if (commission !== userProductRate) {
            updateCommissionRate();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && commission !== userProductRate) {
            updateCommissionRate();
          }
        }}
      />
      <p></p>
      <p></p>
    </div>
  );
};
export default UserProductRow;
