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
const dataSearchTypeOptions = formattedSearchTypeOptions

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
        diosezy: ""
    }
}

function BordereauShow() {
    const idShow = useParams().id
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
        }
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
        axios.get(`/api/bordereau/${idShow}`)
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
        getDetailsBordereauList(true)
    }, [idShow])

    const getDetailsBordereauList = (isLoading = false) => {
        if (isLoading) setDetailsIsFetched(false)
        if (isLoading) showLoader()
        axios.get('/api/bordereau/details/list/'+idShow)
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
                        <li className="breadcrumb-item active">Détails</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <form onSubmit={e => { e.preventDefault(); }}>
                                <div className="card-body p-3">
                                    <div className="mt-2 mb-4"><h4>Détails d'un bordereau</h4></div>
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
                                                className="form-control border border-outline-primary bg-white"
                                                selected={daty}
                                                onChange={(value)=>{setDaty(value)}}
                                                onFocus={e => { e.preventDefault(); focusDatepicker(e); }}
                                                onBlur={e => { e.preventDefault(); blurDatepicker(e); }}
                                                dateFormat="dd/MM/yyyy"
                                                id="daty"
                                                name="daty"
                                                shouldCloseOnSelect={false}
                                                placeholder="Date"
                                                disabled="true"
                                            />
                                            <label htmlFor="daty">Date <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <input 
                                                onChange={(event)=>{setNumber(event.target.value)}}
                                                value={number}
                                                type="text"
                                                className="form-control border border-outline-primary bg-white"
                                                id="number"
                                                name="number"
                                                placeholder="Numéro"
                                                disabled="true" />
                                            <label htmlFor="number">Numéro <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                        <div className="form-floating mx-4 mb-3">
                                            <BootstrapSelect
                                                id="quartier"
                                                options={quartierOptions}
                                                placeholder={"Choisissez une quartier"}
                                                className="form-control border border-outline-primary bg-white"
                                                onChange={changeQuartier}
                                                disabled="true" />
                                            <label htmlFor="quartier">Quartier <span className="text-bold text-danger text-sm">*</span></label>
                                        </div>
                                    </div>
                                    <hr className="mx-4 mt-2 mb-4"/>
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
                                        <Link
                                            to={"/bordereaux/edit/"+idShow}
                                            className="btn btn-sm btn-outline-primary mx-1">
                                            <i className="bi bi-pencil-square me-1"></i> 
                                            Modifier
                                        </Link>
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
  
export default BordereauShow;