import React,{ useState, useEffect} from 'react';
import { Link, useNavigate, Navigate } from "react-router-dom";
import Layout from "../../components/Layout"
 
function Home() {
    const navigate = useNavigate()
    const shouldRedirect = (localStorage.getItem('mysession') === null) ? true : false

    // if (shouldRedirect) {
    //     showLoader()
    //     return (
    //         <>
    //             {shouldRedirect && window.location.reload()}
    //         </>
    //     );
    // }

    return (
        <Layout>
            <div className="pagetitle">
                <h1>Tableau de bord</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/admin/home">BORDEREAU</Link></li>
                        <li className="breadcrumb-item active">Tableau de bord</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <div className="card-body p-3">
                                <div className="w-100 d-flex justify-content-center">
                                    <img src="/resources/img/logo.png" alt="" width="100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
  
export default Home;