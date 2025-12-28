import "./Loader.css";
import LoaderImg from "../../assets/Loader/images.jpeg"

const Loader = () => {
  return (
    <div className="loader-container">
       <img
      src={LoaderImg}
      alt="Loading..."
      style={{ width: 80, margin: "auto", display: "block" }}
    />
    </div>
  );
};

export default Loader;
