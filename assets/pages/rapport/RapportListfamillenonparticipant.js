import React,{ useState, useEffect} from 'react'
import { Link, useNavigate, Navigate } from "react-router-dom"
import Layout from "../../components/Layout"
import parse from 'html-react-parser'
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'

function formatDate(date) {
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
function RapportListfamillenonparticipant() {
    const  [familyList, setFamilyList] = useState([])
    const  [isFecthed, setIsFetched] = useState(false)
    const navigate = useNavigate()
    const shouldRedirect = (localStorage.getItem('mysession') === null) ? true : false
    const [familyListSearch, setFamilyListSearch] = useState([])
    const [rapportListExport, setRapportListExport] = useState([])
    const [nombreFamilleNonParticipant, setNombreFamilleNonParticipant] = useState(0)
    //=============================================//
    const initialSearch = {
        
        fullname: '',
        quartier: '',
        apv: '',
        cardNumber: '',
        date_in: '',
        address: '',
        telephone: '',
        profession: '',
        observation: '',   

    }
    const [searchData, setSearchData] = useState(initialSearch)
    const [boutonVisible, setBoutonVisible] = useState(true)
    let date = new Date() ;
    const initialSearch1 = {
        year: "",
        begin: new Date(date.getFullYear(), 0, 1),
        end: new Date()
    }
    const [searchData1, setSearchData1] = useState(initialSearch1)
    const [yearsData, setYearsData] = useState([])
    //=============================================//

    if (shouldRedirect) {
    	showLoader()
		return (
			<>
				{shouldRedirect && window.location.reload()}
			</>
		);
	}

	const columns = [
        {
            name: '#ID',
            selector: row => row.id,
            sortable: true,
            cell: row => <div style={{display: 'block'}}><b>#{row.id}</b></div>
        },
        {
            name: 'Nom / Prénom',
            selector: row => row.fullname,
            sortable: true,
            width: "250px" ,
            cell: row => <div style={{display: 'block'}}>{row.fullname}</div>
        },
        {
            name: 'Quartier',
            selector: row => row.quartier,
            sortable: true,
            wrap: true,
            cell: row => <div style={{display: 'block'}}>{row.quartier}</div>
        },
        {
            name: 'APV',
            selector: row => row.apv,
            sortable: true,
            wrap: true,
            cell: row => <div style={{display: 'block'}}>{row.apv}</div>
        },
        {
            name: 'Numéro carte',
            selector: row => row.cardNumber,
            sortable: true,
            wrap: true,
            cell: row => <div style={{display: 'block'}}>{row.cardNumber}</div>
        },
        {
            name: 'Date entrée',
            selector: row => row.date_in,
            sortable: true,
            wrap: true,
            cell: row => <div style={{display: 'block'}}>{row.date_in}</div>
        },
        {
            name: 'Addresse',
            selector: row => row.address,
            sortable: true,
            width: "200px" ,
            cell: row => <div style={{display: 'block'}}>{row.address}</div>
        },
        {
            name: 'Telephone',
            selector: row => row.telephone,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.telephone}</div>
        },
        {
            name: 'Profession',
            selector: row => row.profession,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.profession}</div>
        },
        {
            name: 'Observation',
            selector: row => row.observation,
            sortable: true,
            width: "200px" ,
            cell: row => <div style={{display: 'block'}}>{row.observation}</div>
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
        /*
        var oDataUser = JSON.parse(jQuery('#app').attr('data-user')) ;
        console.log(oDataUser) ;
        console.log(oDataUser.access) ;
        if(oDataUser.access == 'user')
        {
            setBoutonVisible(false) ;
        }
        */
        fetchListeAnneeByUser()
        fetchRapportList()
    }, [])
    
    const fetchListeAnneeByUser = () => {
        let formData = new FormData()
        axios.post('/api/rapport/listeanneebyuser', formData)
        .then(function (response) {
            setYearsData(response.data.years)
        })
        .catch(function (error) {
            console.log(error)
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
        })
    }
    const fetchRapportList = (isLoading = true, mode = "list") => {
        let dataSearch1 = {...searchData1}
        if (isLoading) {
        	if (mode == "list") setIsFetched(false)
            showLoader()
        }
        console.log('affichage datasearch1login'+dataSearch1.begin)
        let formData = new FormData()
        formData.append("action", "search")
        formData.append("nonparticipant", "vrai")
        formData.append("mode", mode)
        formData.append("year", dataSearch1.year)
        formData.append("begin", formatDate(dataSearch1.begin))
        formData.append("end", formatDate(dataSearch1.end))
        axios.post('/api/rapport/listnonparticipant', formData)
        .then(function (response) {
            setIsFetched(true)
            if (mode == "export") {
                console.log('export excel')
                console.log(response.data)
                
                let toTitle = response.data.title
                let toFilters = response.data.filters
                let toExports = response.data.exports
                let newToExportsFilters = [...toExports.slice(0, 0), ...toFilters, ...toExports.slice(0)]
                let newToExports = [...newToExportsFilters.slice(0, 0), ...toTitle, ...newToExportsFilters.slice(0)]
                setRapportListExport(newToExports)
                exportToExcel(newToExports)
                
                
            } else {
                var iNombreFamilleNonParticipant = 0 ;
                response.data.map((family, key)=>{
                    iNombreFamilleNonParticipant ++ ;
                    var statutClass = (family.statut) ? 'badge bg-primary' : 'badge bg-danger'
                    /*family.statut = (
                        <span className={statutClass}>{familyStatus[family.statut ? 0 : 1]}</span>
                    )*/
                    family.date_in = formatDate(family.date_in)
                    family.actions = (
                        <>
                            <Link
                                className="btn btn-sm btn-outline-success mx-1"
                                to={`/families/edit/${family.id}`}>
                                <i className="bi bi-pencil-square"></i>
                            </Link>
                            <button 
                                onClick={()=>handleDelete(family.id)}
                                className="btn btn-sm btn-outline-danger mx-1">
                                <i className="bi bi-trash"></i>
                            </button>
                        </>
                    )
                    return family
                })
                setNombreFamilleNonParticipant(iNombreFamilleNonParticipant) 
                setFamilyList(response.data)
                setFamilyListSearch(response.data)
                hideLoader()

            }
            
			
        })
        .catch(function (error) {
            console.log(error)
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
        })
    }

    const handleRefresh = () => {
    	fetchFamilyList()
    }
    const focusDatepicker = (ev) => {
        var thisId = ev.target.id;
        $('#'+thisId).closest('.form-floating').addClass('form-floating-datepicker')
    }
    const blurDatepicker = (ev) => {
        var thisId = ev.target.id;
        if ($('#'+thisId).val() == '') $('#'+thisId).closest('.form-floating').removeClass('form-floating-datepicker')
    }

    const searchRapport = (mode = "list") => {
        console.log('searchRapport')
        fetchRapportList(mode == "export" ? true : false, mode)
    }

    const changeSearchData1 = (key, val) => {
        var dataSearch1 = {...searchData1}
        dataSearch1[key] = val
        setSearchData1(dataSearch1)
    }

    const changeSearchData = (key, val) => {
        var dataSearch = {...searchData}
        dataSearch[key] = val
        setSearchData(dataSearch)
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Voulez-vous supprimer cette famille?',
            text: "Cette action est irréversible!",
            icon: 'warning',
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
                axios.delete(`/api/family/remove/${id}`)
                .then(function (response) {
                	if (response.data.success) {
	                    toast.success("Famille supprimée avec succès.", {
	                        position: "top-right",
	                        autoClose: 5000,
	                        hideProgressBar: false,
	                        closeOnClick: true,
	                        pauseOnHover: true,
	                        draggable: true,
	                        progress: undefined,
	                        theme: "colored",
	                    })
	                    fetchFamilyList()
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
						hideLoader()
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
                    hideLoader()
                });
            }
          })
    }
    //=====================================================================//
   
    const searchFamilies = (key, val) => {
        console.log('ici tape recherche')
        var listFamilies = [...familyListSearch]
        searchData[key] = val
        
        setSearchData(searchData)
        var filteredFamilies = listFamilies.filter((thisFamily) => {
            return (
                thisFamily.fullname.toLowerCase().includes(searchData.fullname.toLowerCase()) && 
                thisFamily.quartier.toLowerCase().includes(searchData.quartier.toLowerCase()) && 
                thisFamily.apv.toLowerCase().includes(searchData.apv.toLowerCase()) &&
                thisFamily.cardNumber.toLowerCase().includes(searchData.cardNumber.toLowerCase()) &&
                thisFamily.date_in.toLowerCase().includes(searchData.date_in.toString().toLowerCase()) &&
                thisFamily.address.toLowerCase().includes(searchData.address.toString().toLowerCase()) &&
                thisFamily.telephone.toLowerCase().includes(searchData.telephone.toString().toLowerCase()) &&
                thisFamily.profession.toLowerCase().includes(searchData.profession.toString().toLowerCase()) &&
                thisFamily.observation.toLowerCase().includes(searchData.observation.toString().toLowerCase())
                
            )
        })
        
        
        setFamilyList(filteredFamilies)
    }
    //Style standard des fichiers excels
    const addStylesToDataCells = (ws, rowCount) => {
        // Customize the style for data cells (add borders)
        for (let row = 6; row <= rowCount; row++) {
          for (let col = 0; col <= ws['!cols'].length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

            // Check if the cell exists, create it if it doesn't
            if (!ws[cellAddress]) {
              ws[cellAddress] = { v: '' }; // You can set the default value if needed
            }

            ws[cellAddress].s = {
                font: {
                    //bold: ((row == 3 && col >= 0 && col <= 4) || (row == 6 && col >= 0 && col <= 4) || (row == (rowCount-3) && col == 0) || (row >= (rowCount-2) && row <= rowCount && col == 3)) ? true : false 
                    bold: (row == 6) ? true : false 
                },
                border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } },
                },
                alignment: {
                    vertical: "center"
                },
                wrapText: true
            };
          }
        }
    }
    const exportToExcel = (dataToExport) => {
        const ws = XLSX.utils.json_to_sheet(dataToExport)
        // Customize the style for the header row (make it bold)
        ws['!cols'] = dataToExport[0] ? Object.keys(dataToExport[0]).map(() => ({ wch: 20 })) : [];
        ws['!rows'] = [{ hpx: 20 }]; // Make the first row (header) bold
        // Remove the header row
        const headerRow = 0;
        const lastCol = ws['!cols'].length;
        for (let col = 0; col <= lastCol; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
            delete ws[cellAddress];
        }
        for (let col = 0; col <= 9; col++) {
            let cellBoldAddress = XLSX.utils.encode_cell({ r: 1, c: col });
            ws[cellBoldAddress].s = {
                font: { bold: true },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
                wrapText: true
            };
            
            let cellBoldAddress2 = XLSX.utils.encode_cell({ r: 3, c: col });
            ws[cellBoldAddress2].s = {
                font: { bold: true },
                alignment: {
                    vertical: "center"
                },
                wrapText: true
            };
            
            let cellNoBoldAddress = XLSX.utils.encode_cell({ r: 4, c: col });
            ws[cellNoBoldAddress].s = {
                font: { bold: false },
                alignment: {
                    vertical: "center"
                },
                wrapText: true
            };
        }
        //console.log()
        addStylesToDataCells(ws, dataToExport.length)
        ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }]; //Pour fusionner le grand titre sur la première ligne (r:1)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
        XLSX.writeFile(wb, 'Liste-non-participants.xlsx')
        hideLoader()
    }

    //=====================================================================//
    return (
        <Layout>
            <div className="pagetitle">
                <h1>Familles</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/families">Familles</Link></li>
                        <li className="breadcrumb-item active">Liste</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12 mb-2">
                        <h5>Zone de recherche</h5>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                        <div className="form-floating">
                            <select
                                className="form-select form-control border border-outline-primary"
                                id="searchYear"
                                value={searchData1.year}
                                onChange={(e)=>changeSearchData1("year", e.target.value)}
                                aria-label="Sélection d'année">
                                <option value="">Tous</option>
                                {yearsData.map((year, keyear) => {
                                    return (
                                        <option key={"year_"+keyear} value={year}>{year}</option>
                                    )
                                })}
                            </select>
                            <label htmlFor="searchYear">Année <span className="text-bold text-danger text-sm">*</span></label>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-3 col-xs-6">
                        <div className="form-floating form-floating-datepicker">
                            <DatePicker
                                className="form-control border border-outline-primary"
                                selected={searchData1.begin}
                                onChange={(value)=>changeSearchData1("begin", value)}
                                onFocus={e => { e.preventDefault(); focusDatepicker(e); }}
                                onBlur={e => { e.preventDefault(); blurDatepicker(e); }}
                                dateFormat="dd/MM/yyyy"
                                id="begin"
                                name="begin"
                                shouldCloseOnSelect={false}
                                placeholder="Date début"
                            />
                            <label htmlFor="begin">Date début <span className="text-bold text-danger text-sm">*</span></label>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-3 col-xs-6">
                        <div className="form-floating form-floating-datepicker">
                            <DatePicker
                                className="form-control border border-outline-primary"
                                selected={searchData1.end}
                                onChange={(value)=>changeSearchData1("end", value)}
                                onFocus={e => { e.preventDefault(); focusDatepicker(e); }}
                                onBlur={e => { e.preventDefault(); blurDatepicker(e); }}
                                dateFormat="dd/MM/yyyy"
                                id="end"
                                name="end"
                                shouldCloseOnSelect={false}
                                placeholder="Date fin"
                            />
                            <label htmlFor="end">Date fin <span className="text-bold text-danger text-sm">*</span></label>
                        </div>
                    </div>
                    <div className="col-12">
                        <button 
                            onClick={(e)=>{e.preventDefault(); searchRapport();}}
                            className="btn btn-sm btn-outline-primary me-3 mt-3 mb-2">
                            <i className="bi bi-search me-1"></i>
                            Chercher
                        </button>
                        <button 
                            onClick={(e)=>{e.preventDefault(); searchReset();}}
                            className="btn btn-sm btn-outline-secondary me-3 mt-3 mb-2">
                            <i className="bi bi-bootstrap-reboot me-1"></i>
                            Réinitialiser
                        </button>
                        <button 
                            onClick={(e)=>{e.preventDefault(); searchRapport("export");}}
                            className="btn btn-sm btn-outline-dark mt-3 mb-2">
                            <i className="bi bi-file-excel-fill me-1"></i>
                            Export EXCEL
                        </button>
                        
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <div className="card-body p-3">
                                <div className="mb-1 mt-3 px-2 py-3">
                                    <span className="badge bg-primary">Nombre de familles non participant: {nombreFamilleNonParticipant} </span>
                                </div>
                                <div className="mb-1 mt-3 px-2 py-3">
                                        <div className="w-100 border border-radius-0 p-3">
                                            <div className="row">
                                                <div className="col-12 mb-1">
                                                    <h5>Zone de recherche</h5>
                                                </div>
                                                <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="fullname" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.fullname} onChange={(e)=>searchFamilies('fullname', e.target.value)} placeholder="Nom et prénom" />
                                                        <label htmlFor="fullname">Nom et prénom</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="quartier" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.quartier} onChange={(e)=>searchFamilies('quartier', e.target.value)} placeholder="Quartier" />
                                                        <label htmlFor="quartier">Quartier</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="apv" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.apv} onChange={(e)=>searchFamilies('apv', e.target.value)} placeholder="APV" />
                                                        <label htmlFor="apv">APV</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="cardNumber" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.cardNumber} onChange={(e)=>searchFamilies('cardNumber', e.target.value)} placeholder="Numero carte" />
                                                        <label htmlFor="cardNumber">Numero carte</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="statut" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.statut} onChange={(e)=>searchFamilies('statut', e.target.value)} placeholder="Statut" />
                                                        <label htmlFor="statut">Statut</label>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <div className="row mb-1 mt-3 px-2 py-3">
                
                                                <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="date_in" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.date_in} onChange={(e)=>searchFamilies('date_in', e.target.value)} placeholder="Date d'entrée" />
                                                        <label htmlFor="date_in">Date d'entrée</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="telephone" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.telephone} onChange={(e)=>searchFamilies('telephone', e.target.value)} placeholder="Téléphone" />
                                                        <label htmlFor="telephone">Téléphone</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="observation" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.observation} onChange={(e)=>searchFamilies('observation', e.target.value)} placeholder="Observation" />
                                                        <label htmlFor="observation">Observation</label>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                                    <div className="form-floating">
                                                        <input id="profession" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.profession} onChange={(e)=>searchFamilies('profession', e.target.value)} placeholder="Profession" />
                                                        <label htmlFor="profession">Profession</label>
                                                    </div>
                                                </div>
                                                
                                                
                                            </div>
                                        </div>
                            </div>
                                <DataTable 
                                    columns={columns} 
                                    data={familyList} 
                                    pagination 
                                    paginationComponentOptions={paginationComponentOptions} 
                                    progressComponent={<div className="text-sm p-2"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>} 
                                    progressPending={!isFecthed} 
                                    highlightOnHover={true} 
                                    noDataComponent={<div className="p-2">Aucune famille trouvée.</div>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
  
  
export default RapportListfamillenonparticipant;