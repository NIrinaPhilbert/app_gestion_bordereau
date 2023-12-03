import React, {useState, useEffect, useRef} from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

function QuartierEdit() {
    const id = useParams().id
    const [numero, setNumero] = useState('')
    const [name, setName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isGeneralError, setIsGeneralError] = useState(false)
    const [msgGeneral, setMsgGeneral] = useState('')
    const [isFetched, setIsFetched] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setIsGeneralError(false)
        setMsgGeneral("")
        setIsSaving(true)
        showLoader()
        axios.get(`/api/quartier/${id}`)
        .then(function (response) {
            let quart = response.data
            setNumero(quart.numero)
            setName(quart.name)
            setIsSaving(false)
            hideLoader()
            setIsFetched(true)
        })
        .catch(function (error) {
            toast.error('Une erreur est survenue.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            navigate("/dashboard")
        })
    }, [])
  
    const handleSave = () => {
        setIsSaving(true)
        showLoader()
        if (
            numero == '' 
            || name == ''
        ) {
            goToTop(0, 0)
            setIsGeneralError(true)
            if (numero == '') setMsgGeneral("Le champ \"Numéro\" est requis.")
            else if (name == '') setMsgGeneral("Le champ \"Nom du quartier\" est requis.")
            setIsSaving(false)
            hideLoader()
        } else {
            setIsGeneralError(false)
            setMsgGeneral("")
            let formData = new FormData()
            formData.append("action", "modify")
            formData.append("numero", numero)
            formData.append("name", name)
            axios.post(`/api/quartier/edit/${id}`, formData)
                .then(function (response) {
                    hideLoader()
                    toast.success("Quartier modifié avec succès.", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    })
                    setIsSaving(true)
                    setNumero('')
                    setName('')
                    navigate("/quartiers")
                })
                .catch(function (error) {
                    toast.error('Une erreur est survenue.', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                    setIsSaving(true)
                    navigate('/quartiers')
                });
        }
    }
  
    return (
        <Layout>
            <div className="pagetitle">
                <h1>Quartiers</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/quartiers">Quartiers</Link></li>
                        <li className="breadcrumb-item active">Mise à jour</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                                <div className="card-body p-3">
                                    <div className="mt-2 mb-4"><h4>Modifier un quartier</h4></div>
                                    <hr className="mt-2 mb-4"/>
                                    {!isFetched ? <div className="text-center text-sm p-0 pb-3"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>
                                        :
                                        <>
                                            <div className="w-100 mb-4">
                                                {isGeneralError &&
                                                    <div className="mx-4 mt-3 mb-3 alert alert-warning text-center form-error">
                                                        <i className="bi bi-shield-fill-exclamation me-2"></i>
                                                        {msgGeneral}
                                                    </div>
                                                }
                                                <div className="form-floating mx-4 mb-3">
                                                    <input 
                                                        onChange={(event)=>{setNumero(event.target.value)}}
                                                        value={numero}
                                                        type="text"
                                                        className="form-control border border-outline-primary"
                                                        id="numero"
                                                        name="numero"
                                                        placeholder="Numéro"/>
                                                    <label htmlFor="numero">Numéro <span className="text-bold text-danger text-sm">*</span></label>
                                                </div>
                                                <div className="form-floating mx-4 mb-3">
                                                    <input 
                                                        onChange={(event)=>{setName(event.target.value)}}
                                                        value={name}
                                                        type="text"
                                                        className="form-control border border-outline-primary"
                                                        id="name"
                                                        name="name"
                                                        placeholder="Nom du quartier"/>
                                                    <label htmlFor="name">Nom du quartier <span className="text-bold text-danger text-sm">*</span></label>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                {isFetched &&
                                    <div className="card-footer bg-white p-3">
                                        <div className="w-100 text-center">
                                            <button 
                                                disabled={isSaving} 
                                                type="submit"
                                                className="btn btn-sm btn-outline-primary mx-1">
                                                <i className="bi bi-save me-1"></i> 
                                                Mettre à jour
                                            </button>
                                            <Link
                                                to="/quartiers"
                                                className="btn btn-sm btn-outline-secondary mx-1">
                                                <i className="bi bi-list me-1"></i>
                                                Liste
                                            </Link>
                                        </div>
                                    </div>
                                }
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
  
export default QuartierEdit;