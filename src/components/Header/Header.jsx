import { useSelector } from "react-redux";
import Navbar from "./Navbar";

function Header() {
  const auth = useSelector((state) => state.auth);
  // DUMMY
  // const auth = {
  //   status: "success",
  //   user: {
  //     name: "siddharth",
  //     profileImage: "https://picsum.photos/200?random=41",
  //   },
  // };
  // const auth = {
  //   status: "failed",
  //   user: {},
  // };

  return (
    <header className="z-100">
      <Navbar auth={auth} />
    </header>
  );
}

export default Header;
