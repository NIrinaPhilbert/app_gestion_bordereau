import React,{ useState, useEffect} from 'react'
import { Link, useNavigate, Navigate } from "react-router-dom"
import Layout from "../../components/Layout"
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import * as XLSX from 'xlsx-js-style'

var familyStatus = process.env.FAMILY_STATUS
familyStatus = familyStatus.split('|')

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
function FamilyList() {
    const  [familyListExport, setFamilyListExport] = useState([])
    const  [familyList, setFamilyList] = useState([])
    const  [isFecthed, setIsFetched] = useState(false)
    const  [nombreActif, setNombreActif] = useState(0)
    const navigate = useNavigate()
    const shouldRedirect = (localStorage.getItem('mysession') === null) ? true : false
    const [familyListSearch, setFamilyListSearch] = useState([])
    let mysession = (localStorage.getItem('mysession') !== null) ? JSON.parse(localStorage.getItem('mysession')) : null
    //=============================================//
    const initialSearch = {
        
        fullname: '',
        quartier: '',
        apv: '',
        cardNumber: '',
        statut: '',
        date_in: '',
        address: '',
        telephone: '',
        profession: '',
        observation: '',   

    }
    const [searchData, setSearchData] = useState(initialSearch)
    
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
            name: 'Statut',
            selector: row => row.statut,
            sortable: true,
            cell: row => <div style={{display: 'block'}}>{row.statut}</div>
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
        var oDataUser = JSON.parse(jQuery('#app').attr('data-user')) ;
        console.log(oDataUser) ;
        console.log(oDataUser.access) ;
        
        fetchFamilyList()
    }, [])
  
    const fetchFamilyList = (mode = "list") => {
    	setIsFetched(false)
        showLoader()
        axios.get('/api/family/list/' + mode)
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
                setFamilyListExport(newToExports)
                exportToExcel(newToExports)
            } else {
                var iNombreActif = 0 ;
                response.data.map((family, key)=>{
                    if(family.statut)
                    {
                        iNombreActif ++ ;
                    }
                    var statutClass = (family.statut) ? 'badge bg-primary' : 'badge bg-danger'
                    /*family.statut = (
                        <span className={statutClass}>{familyStatus[family.statut ? 0 : 1]}</span>
                    )*/
                    family.date_in = formatDate(family.date_in)
                    family.statut = familyStatus[family.statut ? 0 : 1]
                    family.actions = (
                        <>
                            {(mysession.user_authorisation.famille.edit == 1) ?
                                <Link
                                    className="btn btn-sm btn-outline-success mx-1"
                                    to={`/families/edit/${family.id}`}>
                                    <i className="bi bi-pencil-square"></i>
                                </Link> : null
                            }
                            {(mysession.user_authorisation.famille.delete == 1) ?
                                <button 
                                    onClick={()=>handleDelete(family.id)}
                                    className="btn btn-sm btn-outline-danger mx-1">
                                    <i className="bi bi-trash"></i>
                                </button> : null
                            }
                        </>
                    )
                    return family
                })
                setNombreActif(iNombreActif)
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
                thisFamily.statut.toLowerCase().includes(searchData.statut.toString().toLowerCase()) &&
                thisFamily.date_in.toLowerCase().includes(searchData.date_in.toString().toLowerCase()) &&
                thisFamily.address.toLowerCase().includes(searchData.address.toString().toLowerCase()) &&
                thisFamily.telephone.toLowerCase().includes(searchData.telephone.toString().toLowerCase()) &&
                thisFamily.profession.toLowerCase().includes(searchData.profession.toString().toLowerCase()) &&
                thisFamily.observation.toLowerCase().includes(searchData.observation.toString().toLowerCase())
                
            )
        })
        
        
        setFamilyList(filteredFamilies)
    }

    const searchRapport = (mode = "list") => {
        console.log('searchRapport')
        fetchFamilyList(mode)
    }

    //DEBUT PROCESSUS EXPORT EXCEL
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
        for (let col = 0; col <= 10; col++) {
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
        ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }]; //Pour fusionner le grand titre sur la première ligne (r:1)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
        XLSX.writeFile(wb, 'Liste-familles.xlsx')
        hideLoader()
    }
    //FIN PROCESSUS EXPORT EXCEL

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
                    <div className="col-12">
                        <div className="card mt-3">
                            <div className="card-body p-3">
                            	<div className="mb-2 mt-1">
                                    {(mysession.user_authorisation.famille.add == 1) ?
                                        <Link
                                            to="/families/new"
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
                                    <span className="btn-info">Nombre de familles actifs: {nombreActif}</span>
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
  
export default FamilyList;