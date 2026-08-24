interface props {
  responaErrorMessage: string;
}

const ResponaError = ({ responaErrorMessage }: props) => {
  return (
    <div className="respona-error-wrapper">
      <div className="respona-error-message-point"></div>
      {responaErrorMessage}
    </div>
  );
};

export default ResponaError;
