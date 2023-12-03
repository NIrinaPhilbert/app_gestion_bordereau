import React, {useState, useEffect} from 'react'
import { Link, useParams, useNavigate, Navigate } from "react-router-dom"
import Layout from "../../components/Layout"
import BootstrapSelect from 'react-bootstrap-select-dropdown'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

function ApvEdit() {
	const [id, setId] = useState(useParams().id)
    const [libelle, setLibelle] = useState('')
    const [quartier, setQuartier] = useState([])
    const [statutOptions, setStatutOptions] = useState([])
    const [quartierOptions, setQuartierOptions] = useState([])
    const [statut, setStatut] = useState([0])
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
        axios.get(`/api/apv/${id}`)
        .then(function (response) {
            let apv = response.data
            setQuartierOptions(apv.quartierOptions)
            setStatutOptions(apv.statutOptions)
            setLibelle(apv.libelle)
            setQuartier(apv.quartier)
            setStatut(apv.statut)
            if (apv.quartierOptions.length > 0) {
                setIsGeneralError(false)
                setMsgGeneral("")
                setIsSaving(false)
            } else {
                setIsGeneralError(true)
                setMsgGeneral(<>Vous n'avez pas de QUARTIER disponible. Veuillez en <Link to="/quartiers/new">créer un</Link> !</>)
                setIsSaving(true)
            }
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
            navigate("/apvs")
        })
    }, [])
  
    const handleSave = () => {
        setIsSaving(true)
        showLoader()
        if (
            libelle == '' 
            || statut == ''
        ) {
            setIsGeneralError(true)
            if (libelle == '') setMsgGeneral("Le champ \"Libellé\" est requis.")
            else if (statut == '') setMsgGeneral("Le champ \"Statut\" est requis.")
            setIsSaving(false)
            hideLoader()
        } else {
        	setIsGeneralError(false)
			setMsgGeneral("")
            let formData = new FormData()
            formData.append("action", "modify")
            formData.append("libelle", libelle)
            formData.append("quartier", quartier)
            formData.append("statut", statut)
            axios.post(`/api/apv/edit/${id}`, formData)
                .then(function (response) {
                    hideLoader()
                    if (!response.data.success) {
                        setIsGeneralError(true)
                        setMsgGeneral(response.data.msg)
                        setIsSaving(false)
                    } else {
                        toast.success("APV modifié avec succès.", {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        })
                        setIsGeneralError(false)
                        setMsgGeneral("")
                        setIsSaving(true)
                        setLibelle('')
                        setStatut([0])
                        navigate("/apvs")
                    }
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
                    navigate('/apvs')
                });
        }
    }

    const changeQuartier = (selectedOptions) => {
        setQuartier(selectedOptions.selectedKey)
    }

    const changeStatut = (selectedOptions) => {
        setStatut(selectedOptions.selectedKey)
    }
  
    return (
        <Layout>
            <div className="pagetitle">
                <h1>APV</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/apvs">APV</Link></li>
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
                                    <div className="mt-2 mb-4"><h4>Modifier un APV</h4></div>
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
                                                        onChange={(event)=>{setLibelle(event.target.value)}}
                                                        value={libelle}
                                                        type="text"
                                                        className="form-control border border-outline-primary"
                                                        id="libelle"
                                                        name="libelle"
                                                        placeholder="Libellé"/>
                                                    <label htmlFor="libelle">Libellé <span className="text-bold text-danger text-sm">*</span></label>
                                                </div>
                                                <div className="form-floating mx-4 mb-3">
                                                    <BootstrapSelect
                                                        id="quartier"
                                                        options={quartierOptions}
                                                        placeholder={"Choisissez une quartier"}
                                                        className="form-control border border-outline-primary bg-white"
                                                        onChange={changeQuartier} />
                                                    <label htmlFor="quartier">Quartier <span className="text-bold text-danger text-sm">*</span></label>
                                                </div>
                                                <div className="form-floating mx-4 mb-3">
                                                    <BootstrapSelect
                                                        id="statut"
                                                        options={statutOptions}
                                                        placeholder={"Choisissez un statut"}
                                                        className="form-control border border-outline-primary bg-white"
                                                        onChange={changeStatut} />
                                                    <label htmlFor="statut">Statut <span className="text-bold text-danger text-sm">*</span></label>
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
                                                to="/apvs"
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
  
export default ApvEdit;