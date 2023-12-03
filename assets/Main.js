import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Dashboard
import Home from "./pages/home/Home"
// Users
import UserList from "./pages/user/UserList"
import UserCreate from "./pages/user/UserCreate"
import UserEdit from "./pages/user/UserEdit"
// QUARTIERS
import QuartierList from "./pages/quartier/QuartierList"
import QuartierCreate from "./pages/quartier/QuartierCreate"
import QuartierEdit from "./pages/quartier/QuartierEdit"
// APV
import ApvList from "./pages/apv/ApvList"
import ApvCreate from "./pages/apv/ApvCreate"
import ApvEdit from "./pages/apv/ApvEdit"
// FAMILLES
import FamilyList from "./pages/family/FamilyList"
import FamilyCreate from "./pages/family/FamilyCreate"
import FamilyEdit from "./pages/family/FamilyEdit"
// BORDEREAUX
import BordereauList from "./pages/bordereau/BordereauList"
import BordereauCreate from "./pages/bordereau/BordereauCreate"
import BordereauEdit from "./pages/bordereau/BordereauEdit"
import BordereauShow from "./pages/bordereau/BordereauShow"
// RAPPORT
import RapportList from "./pages/rapport/RapportList"

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
   
function Main() {
    return (
    	<>
	        <Router>
	            <Routes>
	                <Route exact path="/dashboard" element={<Home/>} />
	                <Route path="/users" element={<UserList/>} />
	                <Route path="/users/new" element={<UserCreate/>} />
	                <Route path="/users/edit/:id" element={<UserEdit/>} />
	                <Route path="/apvs" element={<ApvList/>} />
	                <Route path="/apvs/new" element={<ApvCreate/>} />
	                <Route path="/apvs/edit/:id" element={<ApvEdit/>} />
	                <Route path="/quartiers" element={<QuartierList/>} />
	                <Route path="/quartiers/new" element={<QuartierCreate/>} />
	                <Route path="/quartiers/edit/:id" element={<QuartierEdit/>} />
	                <Route path="/families" element={<FamilyList/>} />
	                <Route path="/families/new" element={<FamilyCreate/>} />
	                <Route path="/families/edit/:id" element={<FamilyEdit/>} />
	                <Route path="/bordereaux" element={<BordereauList/>} />
	                <Route path="/bordereaux/new" element={<BordereauCreate/>} />
	                <Route path="/bordereaux/edit/:id" element={<BordereauEdit/>} />
	                <Route path="/bordereaux/show/:id" element={<BordereauShow/>} />
	                <Route path="/rapport" element={<RapportList/>} />
	            </Routes>
	        </Router>
	        <ToastContainer style={{ zIndex: 9999999 }} />
        </>
    );
}
   
export default Main;
   
if (document.getElementById('app')) {
    ReactDOM.render(<Main />, document.getElementById('app'));
}