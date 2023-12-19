import React,{ useState, useEffect} from 'react'
import { Link, useNavigate, Navigate } from "react-router-dom"
import Layout from "../../components/Layout"
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'

var bordereauStatus = process.env.BORDEREAU_STATES
bordereauStatus = bordereauStatus.split('|')
 
function BordereauList() {
    const  [bordereauListExport, setBordereauListExport] = useState([])
    const [bordereauList, setBordereauList] = useState([])
    const [bordereauListSearch, setBordereauListSearch] = useState([])
    const [isFecthed, setIsFetched] = useState(false)
    const navigate = useNavigate()
    const shouldRedirect = (localStorage.getItem('mysession') === null) ? true : false
    //Récupération de session venant de security dans SpaController.php et transmis dans Layout.js
    let mysession = (localStorage.getItem('mysession') !== null) ? JSON.parse(localStorage.getItem('mysession')) : null

    if (shouldRedirect) {
    	showLoader()
		return (
			<>
				{shouldRedirect && window.location.reload()}
			</>
		);
	}

    const initialSearch = {
        number: '',
        quartier: '',
        daty: '',
        owner: '',
        statut: '',
        total: ''
    }
    const [searchData, setSearchData] = useState(initialSearch)

	const columns = [
        {
            name: '#ID',
            selector: row => row.id,
            sortable: true,
            cell: row => <div style={{display: 'block'}}><b>#{row.id}</b></div>
        },
        {
            name: 'Numéro',
            selector: row => row.number,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.number}</div>
        },
        {
            name: 'Quartier',
            selector: row => row.quartier,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.quartier}</div>
        },
        {
            name: 'Date',
            selector: row => row.daty,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.daty}</div>
        },
        {
            name: 'Auteur',
            selector: row => row.owner,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.owner}</div>
        },
        {
            name: 'Statut',
            selector: row => row.statut,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.statut}</div>
        },
        {
            name: 'Montant total',
            selector: row => row.total,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.total}</div>
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
        fetchBordereauList()
    }, [])
  
    const fetchBordereauList = (mode = "list") => {
    	setIsFetched(false)
        showLoader()
        axios.get('/api/bordereau/list/' + mode)
        .then(function (response) {
			setIsFetched(true)
            if (mode == "export") {
                let toTitle = response.data.title
                let toFilters = response.data.filters
                let toExports = response.data.exports
                let newToExportsFilters = [...toExports.slice(0, 0), ...toFilters, ...toExports.slice(0)]
                let newToExports = [...newToExportsFilters.slice(0, 0), ...toTitle, ...newToExportsFilters.slice(0)]
                setBordereauListExport(newToExports)
                exportToExcel(newToExports)
            } else {
                response.data.map((bordereau, key)=>{
                    var validClass = (bordereau.valid) ? 'badge bg-primary' : 'badge bg-warning'
                    bordereau.statut = (
                        <>
                            <span className={validClass}>{bordereauStatus[bordereau.valid ? 1 : 0]}</span>
                            {bordereau.valid && <p className="d-block"><strong>{bordereau.receiver}</strong></p>}
                        </>
                    )
                    bordereau.actions = (
                        <>
                            <Link
                                className="btn btn-sm btn-outline-dark mx-1"
                                to={`/bordereaux/show/${bordereau.id}`}>
                                <i className="bi bi-eye-fill"></i>
                            </Link>
                            {((bordereau.valid && mysession.access == "admin") || !bordereau.valid) &&
                                <>
                                    <Link
                                        className="btn btn-sm btn-outline-success mx-1"
                                        to={`/bordereaux/edit/${bordereau.id}`}>
                                        <i className="bi bi-pencil-square"></i>
                                    </Link>
                                    <button 
                                        onClick={()=>handleDelete(bordereau.id)}
                                        className="btn btn-sm btn-outline-danger mx-1">
                                        <i className="bi bi-trash"></i>
                                    </button>
                                    {(mysession.access == "admin" && !bordereau.valid) &&
                                        <button 
                                            onClick={()=>handleValidate(bordereau)}
                                            className="btn btn-sm btn-outline-primary mx-1">
                                            <i className="bi bi-check2-square"></i>
                                        </button>
                                    }
                                </>
                            }
                        </>
                    )
                    return bordereau
                })
                setBordereauList(response.data)
                setBordereauListSearch(response.data)
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
        setSearchData(initialSearch)
    	fetchBordereauList()
    }

    const searchBordereau = (key, val) => {
        var listBordereau = [...bordereauListSearch]
        searchData[key] = val
        setSearchData(searchData)
        var filteredBordereau = listBordereau.filter((thisBordereau) => {
            return (
                thisBordereau.number.toLowerCase().includes(searchData.number.toLowerCase()) && 
                thisBordereau.daty.toLowerCase().includes(searchData.daty.toLowerCase()) && 
                thisBordereau.quartier.toLowerCase().includes(searchData.quartier.toLowerCase()) && 
                thisBordereau.owner.toLowerCase().includes(searchData.owner.toLowerCase()) && 
                thisBordereau.statutText.toLowerCase().includes(searchData.statut.toLowerCase()) && 
                thisBordereau.total.toLowerCase().includes(searchData.total.toLowerCase())
            )
        })
        setBordereauList(filteredBordereau)
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Voulez-vous supprimer ce bordereau?',
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
                axios.delete(`/api/bordereau/remove/${id}`)
                .then(function (response) {
                	if (response.data.success) {
	                    toast.success("Bordereau supprimé avec succès.", {
	                        position: "top-right",
	                        autoClose: 5000,
	                        hideProgressBar: false,
	                        closeOnClick: true,
	                        pauseOnHover: true,
	                        draggable: true,
	                        progress: undefined,
	                        theme: "colored",
	                    })
	                    fetchBordereauList()
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

    const handleValidate = (bord) => {
        Swal.fire({
            title: 'Etes-vous sûr de valider le bordereau N° '+bord.number+' d\'un montant de '+bord.total+' Ar?',
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
                let formData = new FormData()
                formData.append("action", "validate")
                axios.post(`/api/bordereau/validate/${bord.id}`, formData)
                .then(function (response) {
                    if (response.data.success) {
                        toast.success("Bordereau validé avec succès.", {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        })
                        fetchBordereauList()
                    } else {
                        toast.error('Validation impossible.', {
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
    const searchRapport = (mode = "list") => {
        console.log('searchRapport')
        fetchBordereauList(mode)
    }

    //DEBUT PROCESSUS EXPORT EXCEL
    //Style standard des fichiers excels
    const addStylesToDataCells = (ws, rowCount) => {
       
        // Customize the style for data cells (add borders)
        var zValeurPremiereColonneDeLigne = '' ;
        
        for (let row = 6; row <= rowCount; row++) {
            var iCountDetectEtoile = 0 ;
            for (let col = 0; col <= ws['!cols'].length; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                zValeurPremiereColonneDeLigne = (col == 0) ? cellAddress : '' ;
                
                

                // Check if the cell exists, create it if it doesn't
                if (!ws[cellAddress]) {
                ws[cellAddress] = { v: '' }; // You can set the default value if needed
                }

                ws[cellAddress].s = {
                    font: {
                        //bold: ((row == 3 && col >= 0 && col <= 4) || (row == 6 && col >= 0 && col <= 4) || (row == (rowCount-3) && col == 0) || (row >= (rowCount-2) && row <= rowCount && col == 3)) ? true : false 
                        bold: ((row == 6) || (zValeurPremiereColonneDeLigne != '')) ? true : false 
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
        for (let col = 0; col <= 15; col++) {
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
        var toLigneAfusionner = addStylesToDataCells(ws, dataToExport.length)
        
        ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 15 } }]; //Pour fusionner le grand titre sur la première ligne (r:1)
        
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
        XLSX.writeFile(wb, 'Liste-bordereaux.xlsx')
        hideLoader()
    }
    //FIN PROCESSUS EXPORT EXCEL
  
    return (
        <Layout>
            <div className="pagetitle">
                <h1>Bordereaux</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/bordereaux">Bordereaux</Link></li>
                        <li className="breadcrumb-item active">Liste</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <div className="card-body p-3">
                            	<div className="mb-2 mt-1">
                                    {(mysession.user_authorisation.bordereaux.add == 1) ?
                                        <Link
                                            to="/bordereaux/new"
                                            className="btn btn-sm btn-outline-primary mx-1">
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Créer
                                        </Link> : null
                                    }
                                    <button 
                                        onClick={()=>handleRefresh()}
                                        className="btn btn-sm btn-outline-secondary mx-1">
                                        <i className="bi bi-bootstrap-reboot me-1"></i>
                                        Actualiser
                                    </button>
                                    <button 
                                        onClick={(e)=>{e.preventDefault(); searchRapport("export");}}
                                        className="btn btn-sm btn-outline-dark mx-1">
                                        <i className="bi bi-file-excel-fill me-1"></i>
                                        Export EXCEL
                                    </button>
            					</div>
                                <div className="mb-1 mt-3 px-2 py-3">
                                    <div className="w-100 border border-radius-0 p-3">
                                        <div className="row">
                                            <div className="col-12 mb-1">
                                                <h5>Zone de recherche</h5>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                <div className="form-floating">
                                                    <input id="number" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.number} onChange={(e)=>searchBordereau('number', e.target.value)} placeholder="Titre" />
                                                    <label htmlFor="number">Numéro</label>
                                                </div>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                <div className="form-floating">
                                                    <input id="quartier" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.quartier} onChange={(e)=>searchBordereau('quartier', e.target.value)} placeholder="Titre" />
                                                    <label htmlFor="quartier">Quartier</label>
                                                </div>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                <div className="form-floating">
                                                    <input id="daty" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.daty} onChange={(e)=>searchBordereau('daty', e.target.value)} placeholder="Date" />
                                                    <label htmlFor="daty">Date</label>
                                                </div>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                <div className="form-floating">
                                                    <input id="owner" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.owner} onChange={(e)=>searchBordereau('owner', e.target.value)} placeholder="Auteur" />
                                                    <label htmlFor="owner">Auteur</label>
                                                </div>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                <div className="form-floating">
                                                    <input id="statut" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.statut} onChange={(e)=>searchBordereau('statut', e.target.value)} placeholder="Statut" />
                                                    <label htmlFor="statut">Statut</label>
                                                </div>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12">
                                                <div className="form-floating">
                                                    <input id="total" type="text" className="form-control form-control-sm border-radius-0" defaultValue={searchData.total} onChange={(e)=>searchBordereau('total', e.target.value)} placeholder="Auteur" />
                                                    <label htmlFor="total">Montant total</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DataTable 
                                    columns={columns} 
                                    data={bordereauList} 
                                    pagination 
                                    paginationComponentOptions={paginationComponentOptions} 
                                    progressComponent={<div className="text-sm p-2"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>} 
                                    progressPending={!isFecthed} 
                                    highlightOnHover={true} 
                                    noDataComponent={<div className="p-2">Aucun bordereau trouvé.</div>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
  
export default BordereauList;