import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom"
import Swal from 'sweetalert2'
// import '../styles/sidebars.css'
   
const Layout = ({children}) =>{
	var userRating = document.querySelector('#app')
    var isAuthenticated = userRating.dataset.isAuthenticated
	//userRating.dataset ==> récupère les variables passés dans l'attribut data-user de la page index.html.twig après SpaController.php
	//console.log(userRating.dataset) ;
    if (isAuthenticated) {
    	var userFO = JSON.parse(userRating.dataset.user)
    	// console.log(userFO)
    	var userData = {
    		'email': userFO.mail,
    		'firstname': userFO.fname,
    		'lastname': userFO.lname,
    		'access': userFO.access,
			'user_authorisation' : userFO.user_authorisation
    	}
    	localStorage.setItem('mysession', JSON.stringify(userData));
    }
	const location = useLocation()
	const navigate = useNavigate()
	const currentRoute = location.pathname
	let mysession = (localStorage.getItem('mysession') !== null) ? JSON.parse(localStorage.getItem('mysession')) : null
	const [isConnected, setIsConnected] = useState((mysession !== null) ? true : false)

	// if (isConnected && mysession.access != "root") {
    //     showLoader()
    //     return window.location.href = "/"
    // }

	useEffect(() => {
		var body = document.querySelector("body").getBoundingClientRect();
		if(body.width < 1200) {
            document.querySelector("body").classList.remove('toggle-sidebar')
        } else {
            document.querySelector("body").classList.add('expanded')
        }
	}, [])

	const handleSignout = () => {
        Swal.fire({
            title: 'Voulez-vous vraiment vous déconnecter?',
            icon: 'question',
            showCancelButton: true,
            customClass: {
	            confirmButton: 'btn btn-md btn-outline-primary',
	            cancelButton: 'btn btn-md btn-outline-secondary ms-2'
	        },
	        buttonsStyling: false,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then((result) => {
            if (result.isConfirmed) {
            	showLoader()
            	localStorage.removeItem('mysession')
                window.location.href = '/logout'
            }
          })
    }

    const handleMenu = () => {
    	document.querySelector('body').classList.toggle('toggle-sidebar')
    }

    return(
    	<>
    		{isConnected &&
    			<>
		    		<header id="header" className="header fixed-top d-flex align-items-center">
						<div className="d-flex align-items-center justify-content-between">
							<Link to="/dashboard" className="logo d-flex align-items-center w-auto">
								<img src="/resources/img/logo.png" alt=""/>
							</Link>
							<i onClick={(e)=>{e.preventDefault(); handleMenu();}} className="bi bi-list toggle-sidebar-btn"></i>
						</div>
						<nav className="header-nav ms-auto">
							<ul className="d-flex align-items-center">
								<li className="nav-item dropdown pe-3">
									<a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
										<img src="/resources/img/user-default.png" alt="Profile" className="rounded-circle"/>
										<span className="d-none d-md-block dropdown-toggle ps-2">{mysession.firstname}</span>
									</a>
									<ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
										<li className="dropdown-header">
											<h6>{mysession.firstname} {mysession.lastname}</h6>
											{/*<span>Administrateur</span>*/}
										</li>
										<li><hr className="dropdown-divider"/></li>
										<li>
											<a className="dropdown-item d-flex align-items-center" href="#">
												<i className="bi bi-gear"></i>
												<span>Paramètre</span>
											</a>
										</li>
										<li><hr className="dropdown-divider"/></li>
										<li>
											<a onClick={(e)=>{e.preventDefault(); handleSignout();}} className="dropdown-item d-flex align-items-center">
												<i className="bi bi-box-arrow-right"></i>
												<span>Se déconnecter</span>
											</a>
										</li>
									</ul>
								</li>
							</ul>
						</nav>
					</header>
					<aside id="sidebar" className="sidebar">
						<ul className="sidebar-nav" id="sidebar-nav">
							
							{mysession.access == "admin" &&
								<li className="nav-item">
									<Link
										to="/users"
										className={currentRoute.includes('/users') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
										<i className="bi bi-people-fill fs-5"></i>
										<span>Utilisateurs</span>
									</Link>
								</li>
							}
							{(mysession.user_authorisation.quartier.menu == 1) ?
								<li className="nav-item">
									<Link
										to="/quartiers"
										className={currentRoute.includes('/quartiers') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
										<i className="bi bi-intersect fs-5"></i>
										<span>Quartiers</span>
									</Link>
								</li> : null
							}
							{(mysession.user_authorisation.apv.menu == 1) ?
							<li className="nav-item">
								<Link
									to="/apvs"
									className={currentRoute.includes('/apvs') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
									<i className="bi bi-intersect fs-5"></i>
									<span>APV</span>
								</Link>
							</li> : null
							}
							{(mysession.user_authorisation.famille.menu == 1) ?
							<li className="nav-item">
								<Link
									to="/families"
									className={currentRoute.includes('/families') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
									<i className="bi bi-person-bounding-box fs-5"></i>
									<span>Familles</span>
								</Link>
							</li> : null
							}

							{(mysession.user_authorisation.bordereaux.menu == 1) ?
							<li className="nav-item">
								<Link
									to="/bordereaux"
									className={currentRoute.includes('/bordereaux') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
									<i className="bi bi-card-list fs-5"></i>
									<span>Bordereaux</span>
								</Link>
							</li> : null
							}
							{(mysession.user_authorisation.rapport.menu == 1) ?
								<li className="nav-item">
									<Link
										to="/rapport"
										className={currentRoute.includes('/rapport') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
										<i className="bi bi-receipt fs-5"></i>
										<span>Rapport</span>
									</Link>
								</li> : null
							}
							<li className="nav-item">
								<Link
									to="/rapportfamilleparticipant"
									className={currentRoute.includes('/rapportfamilleparticipant') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
									<i className="bi bi-receipt fs-5"></i>
									<span>Liste famille participant</span>
								</Link>
							</li>
							<li className="nav-item">
								<Link
									to="/rapportfamillenonparticipant"
									className={currentRoute.includes('/rapportfamillenonparticipant') ? 'nav-link border-radius-0' : 'nav-link border-radius-0 collapsed'}>
									<i className="bi bi-receipt fs-5"></i>
									<span>Liste famille non participant</span>
								</Link>
							</li>
						</ul>
					</aside>
					<main id="main" className="main">{ children }</main>
					<footer id="footer" className="footer">
						<div className="copyright">
							&copy; Décembre 2023 - Tous droits réservés
						</div>
						<div className="credits"><label className="text-muted text-bold">ECAR MANGASOAVINA</label></div>
					</footer>
					<a href="#" className="back-to-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>
				</>
			}
			<div className="menu-backdrop" onClick={(e)=>{e.preventDefault();handleMenu();}}></div>
		    <div className="modal-loading">
		    	<div className="modal-loading-content">
		            <div className="modal-loading-body">
		                <div className="row">
		                    <div className="col-md-12">
								<div className="progress progress-farm">
									<div className="progress-bar"></div>
								</div>
							</div>
		                </div>
		            </div>
	        	</div>
	        </div>
        </>
    )
}
    
export default Layout;