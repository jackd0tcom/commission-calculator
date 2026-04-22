interface props {
  borderColor: string;
}

const HideNavToggle = ({ borderColor }: props) => {
  return (
    <div className="hide-nav-toggle" style={{ borderColor: borderColor }}>
      <div
        className="hide-nav-toggle-inner"
        style={{ borderColor: borderColor }}
      ></div>
    </div>
  );
};
export default HideNavToggle;
