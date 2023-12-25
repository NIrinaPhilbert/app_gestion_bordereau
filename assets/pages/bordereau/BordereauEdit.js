import React, {useState, useEffect, useRef} from 'react'
import { Link, useParams, useNavigate } from "react-router-dom"
import Layout from "../../components/Layout"
import Swal from 'sweetalert2'
import BootstrapSelect from 'react-bootstrap-select-dropdown'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import $ from 'jquery'
import 'jquery-ui-dist/jquery-ui'
import 'jquery-ui-dist/jquery-ui.css'
import axios from 'axios'

var searchTypeKeys = ["cardNumber", "family"]
var searchTypeValues = ["Par numéro carte", "Par nom de famille"]
var formattedSearchTypeOptions = []
for (var i = 0; i < searchTypeValues.length; i++) {
    formattedSearchTypeOptions[i] = {
        'labelKey': searchTypeKeys[i],
        'value': searchTypeValues[i],
        'isSelected': (i == 0) ? true : false
    }
}
const searchTypeOptions = formattedSearchTypeOptions

const initialSearch = {
    cardNumber: "",
    family: ""
}

const paramsDetailsBordereauAdd = {
    mode: "add",
    family: "",
    hasina: 0,
    taonaHasina: new Date().getFullYear(),
    seminera: 0,
    taonaSeminera: new Date().getFullYear(),
    diosezy: 0,
    taonaDiosezy: new Date().getFullYear(),
    total: 0
}

const paramsResults = {
    isHidden: true,
    isEmpty: true,
    dataFamily: {
        id: "",
        fullname: "",
        apv: "",
        cardNumber: "",
        yearIn: "",
        address: ""
    },
    isLastDetails: false,
    lastDetails: {
        year: "",
        hasina: "",
        seminera: "",
        diosezy: "",
        total: ""
    }
}

function BordereauEdit() {
    const idEdit = useParams().id
    const [number, setNumber] = useState('')
    const [daty, setDaty] = useState(new Date())
    const [quartier, setQuartier] = useState([])
    const [quartierOptions, setQuartierOptions] = useState([])
    // const [statut, setStatut] = useState([0])
    const [paramsBordereauAdd, setParamsBordereauAdd] = useState(paramsDetailsBordereauAdd)
    const [paramsBordereauSelected, setParamsBordereauSelected] = useState({})
    const [paramsResultsData, setParamsResultsData] = useState(paramsResults)
    const [detailsBordereau, setDetailsBordereau] = useState([])
    const [listFamilies, setListFamilies] = useState([])
    const familiesRef = useRef(null);
    const [searchType, setSearchType] = useState(searchTypeKeys[0])
    const [dataSearchTypeOptions, setDataSearchTypeOptions] = useState(searchTypeOptions)
    const [searchData, setSearchData] = useState(initialSearch)
    const [isSaving, setIsSaving] = useState(false)
    const [detailsIsFetched, setDetailsIsFetched] = useState(false)
    const [isGeneralError, setIsGeneralError] = useState(false)
    const [msgGeneral, setMsgGeneral] = useState('')
    const navigate = useNavigate()

    const columns = [
        {
            name: '#',
            selector: row => row.ligne,
            sortable: true,
            cell: row => <div style={{display: 'block'}}><b>{!row.isTotal && "#"}{row.ligne}</b></div>
        },
        {
            name: 'N° carte',
            selector: row => row.cardNumber,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.cardNumber}</div>
        },
        {
            name: 'Famille',
            selector: row => row.family,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.family}</div>
        },
        {
            name: 'Hasina',
            selector: row => row.hasina,
            sortable: true,
            cell: row => <div style={{display: 'block', fontWeight: row.isTotal ? 'bold' : 'normal'}}>{row.hasina}</div>
        },
        {
            name: 'Taona',
            selector: row => row.taonaHasina,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.taonaHasina}</div>
        },
        {
            name: 'Seminera',
            selector: row => row.seminera,
            sortable: true,
            cell: row => <div style={{display: 'block', fontWeight: row.isTotal ? 'bold' : 'normal'}}>{row.seminera}</div>
        },
        {
            name: 'Taona',
            selector: row => row.taonaSeminera,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.taonaSeminera}</div>
        },
        {
            name: 'Diosezy',
            selector: row => row.diosezy,
            sortable: true,
            cell: row => <div style={{display: 'block', fontWeight: row.isTotal ? 'bold' : 'normal'}}>{row.diosezy}</div>
        },
        {
            name: 'Taona',
            selector: row => row.taonaDiosezy,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.taonaDiosezy}</div>
        },
        {
            name: 'Total',
            selector: row => row.total,
            sortable: true,
            cell: row => <div style={{display: 'block', fontWeight: row.isTotal ? 'bold' : 'normal'}}>{row.total}</div>
        },
        {
            name: 'Actions',
            selector: row => row.actions,
            sortable: false,
            cell: row => <div style={{display: 'inherit'}}>{row.actions}</div>
        },
    ];
    const paginationComponentOptions = {
        rowsPerPageText: 'Lignes par page',
        rangeSeparatorText: 'de',
        selectAllRowsItem: true,
        selectAllRowsItemText: 'Tous',
    };

    useEffect(() => {
        setIsGeneralError(false)
        setMsgGeneral("")
        setIsSaving(true)
        showLoader()
        axios.get(`/api/bordereau/${idEdit}`)
        .then(function (response) {
            let bordereau = response.data
            if (bordereau.success) {
                setQuartierOptions(bordereau.quartierOptions)
                // setStatutOptions(bordereau.statutOptions)
                setNumber(bordereau.number)
                setQuartier(bordereau.quartier)
                setDaty(new Date(bordereau.daty))
                // setStatut(bordereau.statut)
                if (bordereau.quartierOptions.length > 0) {
                    setIsGeneralError(false)
                    setMsgGeneral("")
                    setIsSaving(false)
                } else {
                    setIsGeneralError(true)
                    setMsgGeneral(<>Vous n'avez pas de QUARTIER disponible. Veuillez en <Link to="/quartiers/new">créer un</Link> !</>)
                    setIsSaving(true)
                }
                hideLoader()
            } else {
                toast.warning(bordereau.message, {
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
            navigate("/bordereaux")
        })
        getFamiliesList()
        getDetailsBordereauList(true)
        return () => {
            manageUIFamilies(["destroy"])
        }
    }, [idEdit])

    const manageUIFamilies = (mode = ["load"], dataSource = []) => {
        let sourceData = dataSource.length > 0 ? dataSource : listFamilies
        if (mode.includes("reload")) {
            $(familiesRef.current).autocomplete('option', 'source', sourceData)
            $(familiesRef.current).val('')
            setParamsBordereauSelected({})
        }
        else {
            if (mode.includes("destroy")) {
                $(familiesRef.current).autocomplete('destroy')
            }
            if (mode.includes("load")) {
                $(familiesRef.current).autocomplete({
                    source: sourceData,
                    select: (event, ui) => {
                        const selectedItem = ui.item;
                        changeFamiliesSelected(selectedItem)
                    },
                    delay: 0
                })
            }
        }
    }

    const changeFamiliesSelected = (selectedOptions) => {
        changeSearchData("family", selectedOptions.labelKey)
    }

    const getFamiliesList = (familySelected = "", mode = null) => {
        var dataFamilies = []
        axios.get('/api/family/list/'+mode)
        .then(function (response) {
            var data = response.data
            if (data.length > 0) {
                if (familySelected == "") {
                    for (var i = 0; i < data.length; i++) {
                        var df = {
                            key: i,
                            labelKey: data[i].id,
                            value: data[i].cardNumber + ' - ' + data[i].fullname,
                            isSelected: (i == 0) ? true : false 
                        }
                        dataFamilies.push(df)
                    }
                    setListFamilies(dataFamilies)
                    manageUIFamilies(["load"], dataFamilies)
                } else {
                    for (var i = 0; i < data.length; i++) {
                        var df = {
                            key: i,
                            labelKey: data[i].id,
                            value: data[i].cardNumber + ' - ' + data[i].fullname,
                            isSelected: (data[i].id == familySelected) ? true : false 
                        }
                        dataFamilies.push(df)
                    }
                    setListFamilies(dataFamilies)
                    manageUIFamilies(["destroy", "reload"], dataFamilies)
                    if (mode == "reset") $(familiesRef.current).val('')
                    else $(familiesRef.current).val(dataFamilies.filter((famly) => familySelected == famly.labelKey)[0]["value"])
                    $(familiesRef.current).trigger("change")
                }
            }
        })
    }

    const getDetailsBordereauList = (isLoading = false) => {
        if (isLoading) setDetailsIsFetched(false)
        if (isLoading) showLoader()
        axios.get('/api/bordereau/details/list/'+idEdit)
        .then(function (response) {
            setDetailsIsFetched(true)
            response.data.map((details, key)=>{
                details.actions = (
                    <>
                        {!details.isTotal
                            ? <>
                                <button
                                    onClick={(e)=>{e.preventDefault(); handleEdit(searchType, details);}}
                                    className="btn btn-sm btn-outline-success mx-1">
                                    <i className="bi bi-pencil-square"></i>
                                </button>
                                <button 
                                    onClick={(e)=>{e.preventDefault(); handleDelete(details);}}
                                    className="btn btn-sm btn-outline-danger mx-1">
                                    <i className="bi bi-trash"></i>
                                </button>
                            </>
                            : ""
                        }
                    </>
                )
                return details
            })
            setDetailsBordereau(response.data)
            if (isLoading) hideLoader()
        })
    }
  
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
            formData.append("action", "modify")
            formData.append("number", number)
            formData.append("quartier", quartier)
            formData.append("daty", formatDate(daty))
            axios.post(`/api/bordereau/edit/${idEdit}`, formData)
                .then(function (response) {
                    hideLoader()
                    if (!response.data.success) {
                        setIsGeneralError(true)
                        setMsgGeneral(response.data.msg)
                        setIsSaving(false)
                    } else {
                        toast.success("Bordereau modifié avec succès.", {
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
                        navigate("/bordereaux")
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

    const changeSearchTypeSelected = (selectedOptions) => {
        let selected = selectedOptions.selectedKey
        setSearchType(selected[0])
    }

    const changeSearchData = (key, val) => {
        var dataSearch = {...searchData}
        dataSearch[key] = val
        setSearchData(dataSearch)
        if (key == "family") getFamiliesList(val)
    }

    const changeFamilySelected = (selectedOptions) => {
        let selected = selectedOptions.selectedKey
        changeSearchData("family", selected[0])
    }

    const changeParamsAdd = (key, val) => {
        var dataParamsAdd = {...paramsBordereauAdd}
        dataParamsAdd[key] = val
        let hasina = !isNaN(parseInt(dataParamsAdd.hasina)) ? parseInt(dataParamsAdd.hasina) : parseInt(paramsDetailsBordereauAdd.hasina)
        let seminera = !isNaN(parseInt(dataParamsAdd.seminera)) ? parseInt(dataParamsAdd.seminera) : parseInt(paramsDetailsBordereauAdd.seminera)
        let diosezy = !isNaN(parseInt(dataParamsAdd.diosezy)) ? parseInt(dataParamsAdd.diosezy) : parseInt(paramsDetailsBordereauAdd.diosezy)
        let total = hasina+seminera+diosezy
        dataParamsAdd["total"] = total
        setParamsBordereauAdd(dataParamsAdd)
    }

    const triggerSearch = (event, dataSearch) => {
        if (event.key == 'Enter') {
            event.preventDefault();
            searchResult(dataSearch)
        }
    }

    const isHiddenParamsResults = (isData) => {
        var tParamsResultsData = {...paramsResultsData}
        tParamsResultsData.isHidden = isData
        setParamsResultsData(tParamsResultsData)
    }

    const isEmptyParamsResults = (isData) => {
        var tParamsResultsData = {...paramsResultsData}
        tParamsResultsData.isEmpty = isData
        setParamsResultsData(tParamsResultsData)
    }

    const searchResult = (dataSearch, mode = null) => {
        if (
            dataSearch.cardNumber != '' 
            || dataSearch.family != ''
        ) {
            // var tParamsResultsData = {...paramsResultsData}
            // tParamsResultsData = paramsResults
            // setParamsResultsData(tParamsResultsData)
            if (mode == "add") setParamsBordereauAdd(paramsDetailsBordereauAdd)
            if (mode == null) showLoader()
            let formData = new FormData()
            formData.append("action", "search")
            formData.append("type", searchType)
            formData.append("cardNumber", dataSearch.cardNumber)
            formData.append("family", dataSearch.family)
            axios.post('/api/family/search', formData)
                .then(function (response) {
                    if (mode == null) hideLoader()
                    var data = response.data
                    setParamsResultsData(data)
                    setParamsBordereauSelected({})
                    var tSearch = {
                        cardNumber: dataSearch.cardNumber,
                        family: dataSearch.family
                    }
                    setSearchData(tSearch)
                    if (dataSearch.family != "" && mode != "reset") getFamiliesList(dataSearch.family)
                    if (mode == "reset") {
                        setDataSearchTypeOptions([])
                        setDataSearchTypeOptions(searchTypeOptions)
                        setSearchType(searchTypeKeys[0])
                        setSearchData(initialSearch)
                        getFamiliesList(dataSearch.family, "reset")
                        setParamsResultsData(paramsResults)
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
                    navigate('/bordereaux')
                });
        }
    }

    const addBordereau = () => {
        var tParamsBordereauMaj = {...paramsBordereauAdd}
        tParamsBordereauMaj.mode = "add"
        tParamsBordereauMaj.bordereau = idEdit
        tParamsBordereauMaj.family = paramsResultsData.dataFamily.id
        setParamsBordereauSelected(tParamsBordereauMaj)
        majDetailsBordereau(tParamsBordereauMaj)
    }
    const updateBordereau = () => {
        var tParamsBordereauMaj = {...paramsBordereauAdd}
        tParamsBordereauMaj.mode = "modify"
        tParamsBordereauMaj.bordereau = idEdit
        setParamsBordereauSelected(tParamsBordereauMaj)
        majDetailsBordereau(tParamsBordereauMaj)
    }

    const majDetailsBordereau = (paramsBordereauToUp, mode = null) => {
        setIsSaving(true)
        // if (mode == null) showLoader()
        let formData = new FormData()
        formData.append("action", paramsBordereauToUp.mode)
        formData.append("bordereau", paramsBordereauToUp.bordereau)
        if (paramsBordereauToUp.mode == "add") formData.append("ligne", parseInt(detailsBordereau.length))
        if (paramsBordereauToUp.mode == "modify") formData.append("detailsbordereau", paramsBordereauToUp.detailsbordereau)
        formData.append("family", paramsBordereauToUp.family)
        formData.append("hasina", paramsBordereauToUp.hasina)
        formData.append("taonaHasina", paramsBordereauToUp.taonaHasina)
        formData.append("seminera", paramsBordereauToUp.seminera)
        formData.append("taonaSeminera", paramsBordereauToUp.taonaSeminera)
        formData.append("diosezy", paramsBordereauToUp.diosezy)
        formData.append("taonaDiosezy", paramsBordereauToUp.taonaDiosezy)
        setParamsBordereauAdd(paramsDetailsBordereauAdd)
        setParamsBordereauSelected({})
        axios.post(`/api/detailsbordereau/edit`, formData)
            .then(function (response) {
                // if (mode == null) hideLoader()
                // toast.success(`Détail ${mode == "add" ? "ajouté" : "modifié"} avec succès.`, {
                //     position: "top-right",
                //     autoClose: 5000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: "colored",
                // })
                setIsSaving(false)
                searchResult(searchData, "reset")
                getDetailsBordereauList()
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
                getDetailsBordereauList()
            });
    }

    const handleEdit = (typeSearch, detail) => {
        var tParamsBordereauMaj = {...paramsBordereauAdd}
        tParamsBordereauMaj.mode = "modify"
        tParamsBordereauMaj.detailsbordereau = detail.id
        tParamsBordereauMaj.family = detail.familyId
        tParamsBordereauMaj.hasina = detail.hasina.replace(/\s/g, "")
        tParamsBordereauMaj.taonaHasina = detail.taonaHasina
        tParamsBordereauMaj.seminera = detail.seminera.replace(/\s/g, "")
        tParamsBordereauMaj.taonaSeminera = detail.taonaSeminera
        tParamsBordereauMaj.diosezy = detail.diosezy.replace(/\s/g, "")
        tParamsBordereauMaj.taonaDiosezy = detail.taonaDiosezy
        tParamsBordereauMaj.total = detail.total.replace(/\s/g, "")
        setParamsBordereauAdd(tParamsBordereauMaj)
        var dataSearch = {...searchData}
        dataSearch.cardNumber = detail.cardNumber 
        dataSearch.family = detail.familyId
        setSearchData(dataSearch)
        getFamiliesList(detail.familyId)
        searchResult(dataSearch, "modify")
    }

    const handleDelete = (detail) => {
        var tSearch = {
            cardNumber: detail.cardNumber,
            family: detail.familyId
        }
        // Swal.fire({
        //     title: 'Voulez-vous supprimer ce détail?',
        //     text: "Cette action est irréversible!",
        //     icon: 'warning',
        //     showCancelButton: true,
        //     customClass: {
        //         confirmButton: 'btn btn-md btn-outline-primary',
        //         cancelButton: 'btn btn-md btn-outline-secondary ms-2'
        //     },
        //     buttonsStyling: false,
        //     confirmButtonText: 'Oui',
        //     cancelButtonText: 'Non',
        //     allowOutsideClick: false,
        //     allowEscapeKey: false
        //   }).then((result) => {
        //     if (result.isConfirmed) {
        //         showLoader()
                axios.delete(`/api/detailsbordereau/remove/${detail.id}`)
                .then(function (response) {
                    if (response.data.success) {
                        // toast.success("Détail supprimé avec succès.", {
                        //     position: "top-right",
                        //     autoClose: 5000,
                        //     hideProgressBar: false,
                        //     closeOnClick: true,
                        //     pauseOnHover: true,
                        //     draggable: true,
                        //     progress: undefined,
                        //     theme: "colored",
                        // })
                    } else {
                        toast.error('Suppression impossible.', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });
                    }
                    setParamsBordereauAdd(paramsDetailsBordereauAdd)
                    setParamsBordereauSelected({})
                    searchResult(tSearch, "add")
                    getDetailsBordereauList()
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
                    hideLoader()
                });
          //   }
          // })
    }
  
    return (
        <Layout>
            <div className="pagetitle">
                <h1>Bordereaux</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/bordereaux">Bordereaux</Link></li>
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
                                    <div className="mt-2 mb-4"><h4>Modifier un bordereau</h4></div>
                                    <hr className="mt-2 mb-4"/>
                                    <div className="w-100 mb-4">
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
                                    <hr className="mx-4 mt-2 mb-4"/>
                                    <div className="mx-4">
                                        <div className="form-group mb-4 border px-3 pt-3">
                                            <div className="row">
                                                <div className="col-12"><h5><span className="badge bg-dark mb-2">Zone de recherche</span></h5></div>
                                                <div className="col-12 col-md-6 col-lg-6">
                                                    <div className="form-floating mb-3">
                                                        <BootstrapSelect
                                                            id="searchTypeOptions"
                                                            options={dataSearchTypeOptions}
                                                            placeholder={"Type de recherche"}
                                                            className="form-control border border-outline-primary bg-white"
                                                            onChange={changeSearchTypeSelected} />
                                                        <label htmlFor="searchTypeOptions">Type de recherche <span className="text-bold text-danger text-sm">*</span></label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-6">
                                                    <div className="form-floating mb-3" style={{ display: searchType == "cardNumber" ? "block" : "none" }}>
                                                        <input
                                                            type="text"
                                                            value={searchData.cardNumber}
                                                            onChange={(e)=>changeSearchData("cardNumber", e.target.value)}
                                                            id="searchTypeCardNumber"
                                                            placeholder={"Numéro carte"}
                                                            className="form-control border border-outline-primary bg-white" />
                                                        <label htmlFor="searchTypeCardNumber">Numéro carte <span className="text-bold text-danger text-sm">*</span></label>
                                                    </div>
                                                    <div className="form-floating mb-3" style={{ display: searchType == "family" ? "block" : "none" }}>
                                                        <input
                                                            type="text"
                                                            onKeyPress={(e)=>{triggerSearch(e, searchData);}}
                                                            id="listFamilies"
                                                            ref={familiesRef}
                                                            placeholder={"Nom de famille"}
                                                            className="form-control border border-outline-primary bg-white" />
                                                        <label htmlFor="listFamilies">Nom de famille <span className="text-bold text-danger text-sm">*</span></label>
                                                    </div>
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={(e)=>{e.preventDefault(); searchResult(searchData)}} id="searchResult"><i className="bi bi-search me-1"></i>Chercher</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {!paramsResultsData.isHidden &&
                                        <div className="mx-4">
                                            <div className="form-group mb-4 border px-3 pt-3">
                                                <div className="row">
                                                    <div className="col-12"><h5><span className="badge bg-dark mb-2">Résultat de recherche</span></h5></div>
                                                    <div className="col-12">
                                                        {paramsResultsData.isEmpty
                                                            ? <div className="alert alert-info text-center">Aucun résultat trouvé.</div>
                                                            : <>
                                                                <div className="w-100 mb-2">
                                                                    {paramsResultsData.dataFamily.cardNumber}&nbsp;
                                                                    {paramsResultsData.dataFamily.fullname}&nbsp;
                                                                    {paramsResultsData.dataFamily.address}&nbsp;
                                                                    APV {paramsResultsData.dataFamily.apv}&nbsp;
                                                                    Année d'entrée: {paramsResultsData.dataFamily.yearIn}
                                                                </div>
                                                                {paramsResultsData.isLastDetails
                                                                    ? <div className="w-100 mb-2">
                                                                        Adidy vita farany:
                                                                        Taona: {paramsResultsData.lastDetails.year}&nbsp;
                                                                        ={'>'} H: {paramsResultsData.lastDetails.hasina}&nbsp;
                                                                        | S: {paramsResultsData.lastDetails.seminera}&nbsp;
                                                                        | D: {paramsResultsData.lastDetails.diosezy}
                                                                        | Total: {paramsResultsData.lastDetails.total}
                                                                    </div>
                                                                    : <div className="w-100 mb-2">
                                                                        <strong>Pas encore participé</strong>
                                                                    </div>
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {!paramsResultsData.isHidden &&
                                        <div className="mx-4">
                                            <div className="form-group mb-4 border px-3 pt-3">
                                                <div className="row">
                                                    <div className="col-12"><h5><span className="badge bg-dark mb-2">Saisie de bordereau</span></h5></div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                min="0"
                                                                value={paramsBordereauAdd.hasina}
                                                                onChange={(e)=>changeParamsAdd("hasina", e.target.value)}
                                                                id="paramsHasina"
                                                                placeholder={"Hasina"}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsHasina">Hasina <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                value={paramsBordereauAdd.taonaHasina}
                                                                onChange={(e)=>changeParamsAdd("taonaHasina", e.target.value)}
                                                                id="paramsTaonaHasina"
                                                                placeholder={"Taona"}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsTaonaHasina">Taona <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                min="0"
                                                                value={paramsBordereauAdd.seminera}
                                                                onChange={(e)=>changeParamsAdd("seminera", e.target.value)}
                                                                id="paramsSeminera"
                                                                placeholder={"Seminera"}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsSeminera">Seminera <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                value={paramsBordereauAdd.taonaSeminera}
                                                                onChange={(e)=>changeParamsAdd("taonaSeminera", e.target.value)}
                                                                id="paramsTaonaSeminera"
                                                                placeholder={"Taona"}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsTaonaSeminera">Taona <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                min="0"
                                                                value={paramsBordereauAdd.diosezy}
                                                                onChange={(e)=>changeParamsAdd("diosezy", e.target.value)}
                                                                id="paramsDiosezy"
                                                                placeholder={"Diosezy"}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsDiosezy">Diosezy <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                value={paramsBordereauAdd.taonaDiosezy}
                                                                onChange={(e)=>changeParamsAdd("taonaDiosezy", e.target.value)}
                                                                id="paramsTaonaDiosezy"
                                                                placeholder={"Taona"}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsTaonaDiosezy">Taona <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-4 col-md-2 col-lg-2">
                                                        <div className="form-floating mb-3">
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                value={paramsBordereauAdd.total}
                                                                onChange={(e)=>changeParamsAdd("total", e.target.value)}
                                                                id="paramsTotal"
                                                                placeholder={"Totaly"}
                                                                disabled={true}
                                                                className="form-control border border-outline-primary bg-white" />
                                                            <label htmlFor="paramsTotal">Totaly <span className="text-bold text-danger text-sm">*</span></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        {paramsBordereauAdd.mode == "add" &&
                                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addBordereau}><i className="bi bi-plus-circle me-1"></i>Ajouter</button>
                                                        }
                                                        {paramsBordereauAdd.mode == "modify" &&
                                                            <button type="button" className="btn btn-sm btn-outline-success" onClick={updateBordereau}><i className="bi bi-save me-1"></i>Mettre à jour</button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="mx-4">
                                        <div className="form-group mb-4 border px-3 pt-3">
                                            <div className="row">
                                                <div className="col-12"><h5><span className="badge bg-dark mb-2">Détails de bordereau</span></h5></div>
                                                <div className="col-12">
                                                    <button 
                                                        onClick={(e)=>{e.preventDefault(); getDetailsBordereauList();}}
                                                        className="btn btn-sm btn-outline-primary mx-1 mt-1 mb-2">
                                                        <i className="bi bi-bootstrap-reboot me-1"></i>
                                                        Actualiser
                                                    </button>
                                                </div>
                                                <div className="col-12">
                                                    <DataTable 
                                                        columns={columns} 
                                                        data={detailsBordereau} 
                                                        pagination 
                                                        paginationComponentOptions={paginationComponentOptions} 
                                                        progressComponent={<div className="text-sm p-2"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>} 
                                                        progressPending={!detailsIsFetched} 
                                                        highlightOnHover={true} 
                                                        noDataComponent={<div className="p-2">Aucun détail trouvé.</div>}
                                                    />
                                                </div>
                                            </div>
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
  
export default BordereauEdit;