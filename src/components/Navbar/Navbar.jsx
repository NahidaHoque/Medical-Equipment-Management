import React , {useState} from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'

const Navbar = () => {
  
  const [equipment,setEquipment] =useState("equipment");


  return (
    <div className='navbar'>
       <img src={assets.logo} alt="" className="logo"/>
       <ul className="navbar-menu">
        <li onClick={()=>setEquipment("profile")} className={equipment === "profile"?"active":""}>email</li>
        <li onClick={()=>setEquipment("home")} className={equipment === "home"?"active":""}>home</li>
        <li onClick={()=>setEquipment("equipment")} className={equipment === "equipment"?"active":""}>equipment</li>
        <li onClick={()=>setEquipment("mobileapp")} className={equipment === "mobileapp"?"active":""}>mobile-app</li>
        <li onClick={()=>setEquipment("contactus")} className={equipment === "contactus"?"active":""}>contact us</li>
        {/* <li className={equipment === "log out"?"active":""}>log out</li> */}

       </ul>
       <div className ="navbar-right">
        <img src={assets.search_icon} alt=""/>
        <div className="navbar-search-icon">
          <img src={assets.basket_icon} alt=""/>
          <div className="dot"></div>
        </div>
        <button>sign in</button>
       </div>
    </div>
  )
}

export default Navbar