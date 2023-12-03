import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import BootstrapSelect from 'react-bootstrap-select-dropdown'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import $ from 'jquery'
import 'jquery-ui-dist/jquery-ui'
import 'jquery-ui-dist/jquery-ui.css'
import axios from 'axios'

function BordereauCreate() {
    const [number, setNumber] = useState('')
    const [daty, setDaty] = useState(new Date())
    const [quartier, setQuartier] = useState([])
    const [quartierOptions, setQuartierOptions] = useState([])
    // const [statut, setStatut] = useState([0])
    const [isSaving, setIsSaving] = useState(false)
    const [isGeneralError, setIsGeneralError] = useState(false)
    const [msgGeneral, setMsgGeneral] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        // setStatut([0])
        setIsSaving(true)
        showLoader()
        axios.get(`/api/bordereau/quartierOptions`)
        .then(function (response) {
            setQuartierOptions(response.data)
            if (response.data.length > 0) {
                setIsGeneralError(false)
                setMsgGeneral("")
                setIsSaving(false)
            } else {
                setIsGeneralError(true)
                setMsgGeneral(<>Vous n'avez pas de QUARTIER disponible. Veuillez en <Link to="/quartiers/new">créer un</Link> !</>)
                setIsSaving(true)
            }
            hideLoader()
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
            navigate("/bordereaux")
        })
    }, [])
  
    const handleSave = () => {
        setIsSaving(true)
        showLoader()
        if (
            number == ''
        ) {
            setIsGeneralError(true)
            if (number == '') setMsgGeneral("Le champ \"Numéro\" est requis.")
            setIsSaving(false)
            hideLoader()
        } else {
            setIsGeneralError(false)
            setMsgGeneral("")
            let formData = new FormData()
            formData.append("action", "add")
            formData.append("number", number)
            formData.append("quartier", quartier)
            formData.append("daty", formatDate(daty))
            axios.post('/api/bordereau/create', formData)
                .then(function (response) {
                    hideLoader()
                    if (!response.data.success) {
                        setIsGeneralError(true)
                        setMsgGeneral(response.data.msg)
                        setIsSaving(false)
                    } else {
                        toast.success("Bordereau ajouté avec succès.", {
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
                        navigate("/bordereaux/edit/"+response.data.returnId)
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
                    navigate('/bordereaux')
                });
        }
    }

    const changeQuartier = (selectedOptions) => {
        setQuartier(selectedOptions.selectedKey)
    }

    const formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }

    const focusDatepicker = (ev) => {
        var thisId = ev.target.id;
        $('#'+thisId).closest('.form-floating').addClass('form-floating-datepicker')
    }

    const blurDatepicker = (ev) => {
        var thisId = ev.target.id;
        if ($('#'+thisId).val() == '') $('#'+thisId).closest('.form-floating').removeClass('form-floating-datepicker')
    }
  
    return (
        <Layout>
            <div className="pagetitle">
                <h1>Bordereaux</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/bordereaux">Bordereaux</Link></li>
                        <li className="breadcrumb-item active">Ajout</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                                <div className="card-body p-3">
                                    <div className="mt-2 mb-4"><h4>Créer un nouveau bordereau</h4></div>
                                    <hr className="mt-2 mb-4"/>
                                    <div className="w-100 mb-4">
                                        <div className="mx-4 mt-3 mb-3 alert alert-info text-center">
                                            <i className="bi bi-info-circle-fill me-2"></i>
                                            Après enregistrement, vous serez redirigé vers la mise à jour pour gérer les détails du bordereau.
                                        </div>
                                        {isGeneralError &&
                                            <div className="mx-4 mt-3 mb-3 alert alert-warning text-center form-error">
                                                <i className="bi bi-shield-fill-exclamation me-2"></i>
                                                {msgGeneral}
                                            </div>
                                        }
                                        <div className="form-floating form-floating-datepicker mx-4 mb-3">
                                            <DatePicker
                                                className="form-control border border-outline-primary"
                                                selected={daty}
                                                onChange={(value)=>{setDaty(value)}}
                                                onFocus={e => { e.preventDefault(); focusDatepicker(e); }}
                                                onBlur={e => { e.preventDefault(); blurDatepicker(e); }}
                                                dateFormat="dd/MM/yyyy"
                                                id="daty"
                                                name="daty"
                                                shouldCloseOnSelect={false}
                                                placeholder="Date"
                                            />
                                            <label htmlFor="daty">Date <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setNumber(event.target.value)}}
                                                value={number}
                                                type="text"
                                                className="form-control border border-outline-primary"
                                                id="number"
                                                name="number"
                                                placeholder="Numéro"/>
                                            <label htmlFor="number">Numéro <span className="text-bold text-danger text-sm">*</span></label>
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
                                    </div>
                                </div>
                                <div className="card-footer bg-white p-3">
                                    <div className="w-100 text-center">
                                        <button 
                                            disabled={isSaving} 
                                            type="submit"
                                            className="btn btn-sm btn-outline-primary mx-1">
                                            <i className="bi bi-save me-1"></i> 
                                            Enregistrer
                                        </button>
                                        <Link
                                            to="/bordereaux"
                                            className="btn btn-sm btn-outline-secondary mx-1">
                                            <i className="bi bi-list me-1"></i>
                                            Liste
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
  
export default BordereauCreate;