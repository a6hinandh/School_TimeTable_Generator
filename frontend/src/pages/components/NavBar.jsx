import { Outlet } from "react-router";

function NavBar() {
  return (
    <div className="">
      <nav className="navbar navbar-expand-lg ">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          TimeTable Generator
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav justify-content-between w-100">
            <div className="d-flex">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>
            </div>
            <div className="d-flex">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Your TimeTables
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Profile
                </a>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </nav>
    <Outlet/>
    </div>
    
  );
}

export default NavBar;
