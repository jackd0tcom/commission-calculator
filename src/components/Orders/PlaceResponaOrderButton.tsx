import ResponaLogo from "../UI/ResponaLogo";

interface props {
  handlePlaceResponaOrder: any;
  responaOrderStatus: string;
}

const PlaceResponaOrderButton = ({
  handlePlaceResponaOrder,
  responaOrderStatus,
}: props) => {
  return (
    <div className="place-respona-order-button-wrapper">
      <button
        className="place-respona-logo-button"
        // Dont want to accidentally run this mama
        // onClick={() => handlePlaceResponaOrder()}
      >
        <div className="place-respona-logo-wrapper">
          <ResponaLogo
            height={"14px"}
            width={"14px"}
            fill={"white"}
            arrow="#2617b9"
          />
        </div>
        {responaOrderStatus === "" ? "Place Order" : responaOrderStatus}
      </button>
    </div>
  );
};

export default PlaceResponaOrderButton;
