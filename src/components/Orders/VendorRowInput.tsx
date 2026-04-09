interface props {
  field: any;
}

const VendorRowInput = ({ field }: props) => {
  return <input className="order-input" type={field.field_type} />;
};
export default VendorRowInput;
