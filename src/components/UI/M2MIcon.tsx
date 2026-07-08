import { FaRotate } from "react-icons/fa6";
import { useNavigate } from "react-router";

interface props {
  wasM2M: boolean;
  M2MId: number;
}

const M2MIcon = ({ wasM2M, M2MId }: props) => {
  const nav = useNavigate();
  return (
    <div
      onClick={() => {
        setTimeout(() => {
          wasM2M && nav(`/order/${M2MId}/false`);
        }, 300);
      }}
      className={wasM2M ? "m2m-icon was-m2m" : "m2m-icon"}
    >
      <FaRotate />
    </div>
  );
};
export default M2MIcon;
