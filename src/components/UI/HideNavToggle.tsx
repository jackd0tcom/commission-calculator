interface props {
  borderColor: string;
}

const HideNavToggle = ({ borderColor }: props) => {
  return (
    <div className="hide-nav-toggle" style={{ borderColor: borderColor }}>
      <div className="hide-nav-toggle-inner"></div>
    </div>
  );
};
export default HideNavToggle;
