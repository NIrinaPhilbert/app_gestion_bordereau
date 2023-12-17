import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import BootstrapSelect from 'react-bootstrap-select-dropdown'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import axios from 'axios'

var familyStatus = process.env.FAMILY_STATUS
familyStatus = familyStatus.split('|')
var formattedFamilyStatus = []
for (var i = 0; i < familyStatus.length; i++) {
    formattedFamilyStatus[i] = {
        'labelKey': i,
        'value': familyStatus[i],
        'isSelected': (i == 0) ? true : false
    }
}
const statutOptions = formattedFamilyStatus

function FamilyCreate() {
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [address, setAddress] = useState('')
    const [quartier, setQuartier] = useState('')
    const [quartierOptions, setQuartierOptions] = useState([])
    const [apv, setAPV] = useState('')
    const [apvOptions, setApvOptions] = useState([])
    const [cardsNumberList, setCardsNumberList] = useState([])
    const [firstnameLastnameList, setFirstnameLastnameList] = useState([])
    const [cardNumber, setCardNumber] = useState('')
    const [dateIn, setDateIn] = useState(new Date())
    const [dateOut, setDateOut] = useState(null)
    const [statut, setStatut] = useState([0])
    const [telephone, setTelephone] = useState('')
    const [profession, setProfession] = useState('')
    const [observation, setObservation] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isGeneralError, setIsGeneralError] = useState(false)
    const [msgGeneral, setMsgGeneral] = useState('')
    const [firstnameLastnameSearch, setFirstnameLastnameSearch] = useState('')
    const navigate = useNavigate()

    
    
    /*useEffect(() => {
        setStatut([0])
        setIsSaving(true)
        showLoader()
        axios.get(`/api/quartier/quartierOptions`)
        .then(function (response) {
            setQuartierOptions(response.data.quartierOptions)
            setCardsNumberList(response.data.cardsNumberList)
            if (response.data.quartierOptions.length > 0) {
                setIsGeneralError(false)
                setMsgGeneral("")
                setIsSaving(false)
            } else {
                setIsGeneralError(true)
                setMsgGeneral(<>Vous n'avez pas de Quartier disponible. Veuillez en <Link to="/apvs/new">créer un</Link> !</>)
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
            navigate("/families")
        })
    }, [])*/
    //========================Get List Quartier=========================//
    useEffect(() => {
        //setDocumentAccess([document_access_keys[0]])
        //setIsGeneralError(false)
        //setMsgGeneral("")
        //setIsSaving(true)
        showLoader()
        axios.get(`/api/apv/quartierOptions`)
        .then(function (response) {
            setQuartierOptions(response.data)
            setIsSaving(false)
            hideLoader()
        })
        .catch(function (error) {
            toast.error('Une erreur option direction est survenue.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            //navigate("/Families")
        })
    }, [])

    //========================End get List Quartier====================//
    //=======================Start change quartier=====================//
    const changeQuartier = (selectedOptions) => {
        let quartierSelected = selectedOptions.selectedKey
        setQuartier(quartierSelected)
        if (quartierSelected != '') {
            setIsSaving(true)
            showLoader()
            axios.get(`/api/apv/apvOptions/${quartierSelected}`)
            .then(function (response) {
                setApvOptions(response.data)
                setIsSaving(false)
                hideLoader()
            })
            .catch(function (error) {
                toast.error('Une erreur liste theme est survenue.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                //navigate("/admin/documentaryresources")
            })
        }
    }



    //========================End change quartier=====================//
    const changeAPV = (selectedOptions) => {
        setAPV(selectedOptions.selectedKey)
    }



    //================================================================//
    useEffect(() => {
        setStatut([0])
        setIsSaving(true)
        showLoader()
        axios.get(`/api/family/apvOptions`)
        .then(function (response) {
            setApvOptions(response.data.apvOptions)
            setCardsNumberList(response.data.cardsNumberList)
            setFirstnameLastnameList(response.data.tzNomPrenomFamilleList)
            if (response.data.apvOptions.length > 0) {
                setIsGeneralError(false)
                setMsgGeneral("")
                setIsSaving(false)
            } else {
                setIsGeneralError(true)
                setMsgGeneral(<>Vous n'avez pas d'APV disponible. Veuillez en <Link to="/apvs/new">créer un</Link> !</>)
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
            navigate("/families")
        })
    }, [])
  
    const handleSave = () => {
        
        /*
        setFirstnameLastnameSearch(firstname.toLowerCase() + ' ' + lastname.toLowerCase())
        console.log(firstname.toLowerCase() + ' ' + lastname.toLowerCase()) ;
        console.log(firstnameLastnameList) ;
        console.log(firstnameLastnameList.includes(firstname.toLowerCase() + ' ' + lastname.toLowerCase())) ;
        console.log(cardsNumberList) ;
        return false ;
        */
        
        
        setIsSaving(true)
        showLoader()
        if (
            firstname == '' 
            || cardNumber == '' 
            || cardsNumberList.includes(cardNumber)
            || firstnameLastnameList.includes(firstname.toLowerCase() + ' ' + lastname.toLowerCase())
        ) {
            console.log(firstnameLastnameList) ;
            console.log(firstnameLastnameSearch) ;
            //return false ;
            setIsGeneralError(true)
            if (firstname == '') setMsgGeneral("Le champ \"Nom\" est requis.")
            else if (cardNumber == '') setMsgGeneral("Le champ \"Numéro carte\" est requis.")
            else if (cardsNumberList.includes(cardNumber)) setMsgGeneral("Le \"Numéro carte\" existe déjà.")
            else if (firstnameLastnameList.includes(firstname.toLowerCase() + ' ' + lastname.toLowerCase())) setMsgGeneral("Le nom et prénom existe déjà.")
            setIsSaving(false)
            hideLoader()
        } else {
            setIsGeneralError(false)
            setMsgGeneral("")
            let formData = new FormData()
            formData.append("action", "add")
            formData.append("firstname", firstname)
            formData.append("lastname", lastname)
            formData.append("quartier", quartier)
            formData.append("apv", apv)
            formData.append("cardNumber", cardNumber)
            formData.append("dateIn", formatDate(dateIn))
            formData.append("dateOut", dateOut != null ? formatDate(dateOut) : null)
            
            formData.append("statut", statut)
            formData.append("address", address)
            formData.append("telephone", telephone)
            formData.append("profession", profession)
            formData.append("observation", observation)

            axios.post('/api/family/create', formData)
                .then(function (response) {
                    hideLoader()
                    if (!response.data.success) {
                        setIsGeneralError(true)
                        setMsgGeneral(response.data.msg)
                        setIsSaving(false)
                    } else {
                        toast.success("Famille ajoutée avec succès.", {
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
                        navigate("/families")
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
                    navigate('/families')
                });
        }
    }

    

    const changeStatut = (selectedOptions) => {
        setStatut(selectedOptions.selectedKey)
    }

    const changeDateOut = (val) => {
        setDateOut(val)
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

    //********************************************* //
    /*const changeQuartier = (selectedOptions) => {
        let quartierSelected = selectedOptions.selectedKey
        setQuartier(quartierSelected)
        if (quartierSelected != '') {
            setIsSaving(true)
            showLoader()
            axios.get(`/api/themes/themesOptions/${posttypeSelected}`)
            .then(function (response) {
                setThemesOptions(response.data)
                setIsSaving(false)
                hideLoader()
            })
            .catch(function (error) {
                toast.error('Une erreur liste theme est survenue.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                navigate("/Families")
            })
        }
    }
    */
    
    //*******************************************/

    return (
        <Layout>
            <div className="pagetitle">
                <h1>Familles</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/families">Familles</Link></li>
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
                                    <div className="mt-2 mb-4"><h4>Créer une nouvelle famille</h4></div>
                                    <hr className="mt-2 mb-4"/>
                                    <div className="w-100 mb-4">
                                        {isGeneralError &&
                                            <div className="mx-4 mt-3 mb-3 alert alert-warning text-center form-error">
                                                <i className="bi bi-shield-fill-exclamation me-2"></i>
                                                {msgGeneral}
                                            </div>
                                        }
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setFirstname(event.target.value)}}
                                                value={firstname}
                                                type="text"
                                                className="form-control border border-outline-primary"
                                                id="firstname"
                                                name="firstname"
                                                placeholder="Nom"/>
                                            <label htmlFor="firstname">Nom <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setLastname(event.target.value)}}
                                                value={lastname}
                                                type="text"
                                                className="form-control border border-outline-primary"
                                                id="lastname"
                                                name="lastname"
                                                placeholder="Prénom"/>
                                            <label htmlFor="lastname">Prénom</label>
                                        </div>

                                        <div className="form-floating mx-4 mb-3">
                                                <BootstrapSelect
                                                id="quartier_id"
                                                options={quartierOptions}
                                                placeholder={"Choisir quartier"}
                                                className="form-control border border-outline-primary bg-white"
                                                onChange={changeQuartier}/>
                                                
                                            
                                                
                                            <label htmlFor="quartier">Quartier <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <BootstrapSelect
                                                id="apv_id"
                                                options={apvOptions}
                                                placeholder={"Choisir APV"}
                                                className="form-control border border-outline-primary bg-white"
                                                onChange={changeAPV} />
                                            
                                            <label htmlFor="apv">APV <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>

                                       
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setCardNumber(event.target.value)}}
                                                value={cardNumber}
                                                type="text"
                                                className="form-control border border-outline-primary"
                                                id="cardNumber"
                                                name="cardNumber"
                                                placeholder="Numéro carte"/>
                                            <label htmlFor="cardNumber">Numéro carte <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating form-floating-datepicker mx-4 mb-3">
                                            <DatePicker
                                                className="form-control border border-outline-primary"
                                                selected={dateIn}
                                                onChange={(value)=>{setDateIn(value)}}
                                                onFocus={e => { e.preventDefault(); focusDatepicker(e); }}
                                                onBlur={e => { e.preventDefault(); blurDatepicker(e); }}
                                                dateFormat="dd/MM/yyyy"
                                                id="dateIn"
                                                name="dateIn"
                                                shouldCloseOnSelect={false}
                                                placeholder="Date d'entrée"
                                            />
                                            <label htmlFor="dateIn">Date d'entrée <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <DatePicker
                                                className="form-control border border-outline-primary"
                                                selected={dateOut}
                                                onChange={(value)=>{changeDateOut(value)}}
                                                onFocus={e => { e.preventDefault(); focusDatepicker(e); }}
                                                onBlur={e => { e.preventDefault(); blurDatepicker(e); }}
                                                dateFormat="dd/MM/yyyy"
                                                id="dateOut"
                                                name="dateOut"
                                                shouldCloseOnSelect={false}
                                                placeholder="Date de sortie"
                                            />
                                            <label htmlFor="dateOut">Date de sortie</label>
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
                                        <div className="form-floating mx-4 mb-3">
                                            <textarea 
                                                value={address}
                                                onChange={(event)=>{setAddress(event.target.value)}}
                                                className="form-control border border-outline-primary h-auto"
                                                id="address"
                                                rows="4"
                                                name="address"
                                                placeholder="Adresse"></textarea>
                                            <label htmlFor="address">Adresse</label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setTelephone(event.target.value)}}
                                                value={telephone}
                                                type="text"
                                                className="form-control border border-outline-primary"
                                                id="telephone"
                                                name="telephone"
                                                placeholder="Telephone"/>
                                            <label htmlFor="telephone">Telephone</label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setProfession(event.target.value)}}
                                                value={profession}
                                                type="text"
                                                className="form-control border border-outline-primary"
                                                id="profession"
                                                name="profession"
                                                placeholder="Profession"/>
                                            <label htmlFor="profession">Profession</label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <textarea 
                                                value={observation}
                                                onChange={(event)=>{setObservation(event.target.value)}}
                                                className="form-control border border-outline-primary h-auto"
                                                id="observation"
                                                rows="4"
                                                name="observation"
                                                placeholder="Observation"></textarea>
                                            <label htmlFor="observation">Observation</label>
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
                                            to="/apvs"
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
  
export default FamilyCreate;