import { useNavigate } from "react-router-dom";
import minus from "../assets/images/minus.png"

const Header = () => {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/")
    }

    return <>
        <div id="header">
            <button id="cancelbtn" onClick={handleCancel}>Cancel</button> 
            <div id="progressbar">
                <div><span className="progress-text" id="progress-text-active">Upload</span></div>
                <img src={minus} />
                <div><span className="progress-text" id="progress-text-unactive">Settings</span></div>
            </div>
            <div id="button-container">
                <button className="headerbtn" id="header-backbtn">Back</button>
                <button className="headerbtn" id="header-nextbtn">Next</button>
            </div>
        </div>
    </>
}

export default Header;