import React, { useState } from 'react'
import './navbar.css'

function Navbar() {

    const [showMenu, setShowMenu] = useState(false);

    return (
        // <nav className="navbar">
        <nav className="navbar navbar-dark bg-black">
            <div className="container-fluid">
                <div> <img src="apotheosis.png" width="" height="38" alt=""></img></div>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    {/* navbar buttons */}
                    {showMenu && (<ul className="nav-menu">
                        <li className="nav-item nav-li">
                            <a className="nav-link active" aria-current="page" href=".">Dashboard</a>
                        </li>
                        <li className="nav-item nav-li">
                            <a className="nav-link active" aria-current="page" href="#Vault">Vault</a>
                        </li>
                        <li className="nav-item nav-li">
                            <a className="nav-link active" aria-current="page" href="#NFT">NFTs</a>
                        </li>
                        <li className="nav-item nav-li">
                            <a className="nav-link active" aria-current="page" href="https://osis.world" target="_blank" rel="noreferrer">OSIS</a>
                        </li>
                        <li className="nav-item nav-li">
                            <a className="nav-link active" aria-current="page" href="https://osis.world/login" target="_blank" rel="noreferrer">GET OSIS</a>
                        </li>
                    </ul>)}

                    <img src="./burger_icon.svg.png" className="profile-icon" alt="profile-icon"></img>

                    {/* hamburger menu */}
                    <div className="hamburger" onClick={() => setShowMenu(!showMenu)}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar



