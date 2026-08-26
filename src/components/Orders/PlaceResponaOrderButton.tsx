import ResponaLogo from "../UI/ResponaLogo";

interface props {
  handlePlaceResponaOrder: any;
}

const PlaceResponaOrderButton = ({ handlePlaceResponaOrder }: props) => {
  return (
    <div className="place-respona-order-button-wrapper">
      <button
        className="place-respona-logo-button"
        onClick={() => handlePlaceResponaOrder()}
      >
        <div className="place-respona-logo-wrapper">
          <ResponaLogo height={"14px"} width={"14px"} fill={"white"} />
        </div>
        Place Order
      </button>
    </div>
  );
};

export default PlaceResponaOrderButton;
