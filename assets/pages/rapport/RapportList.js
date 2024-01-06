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
import * as XLSX from 'xlsx-js-style';

function RapportList() {
    const [rapportList, setRapportList] = useState([])
    const [rapportListSearch, setRapportListSearch] = useState([])
    const [rapportListExport, setRapportListExport] = useState([])
    const [assist, setAssist] = useState(123456789)
    const [isFecthed, setIsFetched] = useState(false)
    const navigate = useNavigate()
    const shouldRedirect = (localStorage.getItem('mysession') === null) ? true : false
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
        year: "",
        begin: new Date(),
        end: new Date()
    }
    //==set first day of current year in date debut==============//
    let date = new Date() ;
    const initialSearch1 = {
        year: "",
        begin: new Date(date.getFullYear(), 0, 1),
        end: new Date()
    }
    const [searchData1, setSearchData1] = useState(initialSearch1)
    const changeSearchData1 = (key, val) => {
        var dataSearch1 = {...searchData1}
        dataSearch1[key] = val
        setSearchData1(dataSearch1)
    }
    console.log('searchdata1='+searchData1.begin)
    //===========================================================//
    const [searchData, setSearchData] = useState(initialSearch1)
    const [yearsData, setYearsData] = useState([])

	const columns = [
        {
            name: 'Quartier',
            selector: row => row.quartier,
            sortable: false,
            cell: row => <div style={{display: 'block'}}>{row.quartier}</div>
        },
        {
            name: 'Nombre participants',
            selector: row => row.participants_number,
            sortable: false,
            cell: row => <div style={{display: 'block'}}>{row.participants_number}</div>
        },
        {
            name: 'Nombre familles',
            selector: row => row.families_number,
            sortable: false,
            cell: row => <div style={{display: 'block'}}>{row.families_number}</div>
        },
        {
            name: 'Hasina reçu',
            selector: row => row.hasina,
            sortable: false,
            cell: row => <div style={{display: 'block'}}>{row.hasina}</div>
        },
        {
            name: 'Pourcentage',
            selector: row => row.percent,
            sortable: false,
            cell: row => <div style={{display: 'block'}}>{row.percent}</div>
        }
    ];
  
    useEffect(() => {
        fetchRapportList()
    }, [assist])

    const generateRandom20DigitInteger = () => {
        let result = '';
        for (let i = 0; i < 20; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }
  
    const fetchRapportList = (isLoading = true, mode = "list") => {
        let dataSearch = {...searchData1}
        if (isLoading) {
        	if (mode == "list") setIsFetched(false)
            showLoader()
        }
        let formData = new FormData()
        formData.append("action", "search")
        formData.append("mode", mode)
        formData.append("year", dataSearch.year)
        formData.append("begin", formatDate(dataSearch.begin))
        formData.append("end", formatDate(dataSearch.end))
        axios.post('/api/rapport/list', formData)
        .then(function (response) {
            console.log(response.data)
			setIsFetched(true)
            setYearsData(response.data.years)
			response.data.rapports.map((rapport, key)=>{
                rapport.quartier = parse(rapport.quartier.toString())
                rapport.hasina = parse(rapport.hasina.toString())
                return rapport
            })
			setRapportList(response.data.rapports)
            setRapportListSearch(response.data.rapports)
            if (mode == "export") {
                let toTitle = response.data.title
                let toFilters = response.data.filters
                let toExports = response.data.exports
                let newToExportsFilters = [...toExports.slice(0, 0), ...toFilters, ...toExports.slice(0)]
                let newToExports = [...newToExportsFilters.slice(0, 0), ...toTitle, ...newToExportsFilters.slice(0)]
                setRapportListExport(newToExports)
                exportToExcel(newToExports)
            } else hideLoader()
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

    const handleRefresh = () => {
        setSearchData(initialSearch)
    	fetchRapportList(false)
    }

    const changeSearchData = (key, val) => {
        var dataSearch = {...searchData}
        dataSearch[key] = val
        setSearchData(dataSearch)
    }

    const searchRapport = (mode = "list") => {
        fetchRapportList(mode == "export" ? true : false, mode)
    }

    const searchReset = () => {
        setSearchData1(initialSearch1)
        setAssist(generateRandom20DigitInteger())
    }

    const focusDatepicker = (ev) => {
        var thisId = ev.target.id;
        $('#'+thisId).closest('.form-floating').addClass('form-floating-datepicker')
    }

    const blurDatepicker = (ev) => {
        var thisId = ev.target.id;
        if ($('#'+thisId).val() == '') $('#'+thisId).closest('.form-floating').removeClass('form-floating-datepicker')
    }

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
                    bold: ((row == 3 && col >= 0 && col <= 4) || (row == 6 && col >= 0 && col <= 4) || (row == (rowCount-3) && col == 0) || (row >= (rowCount-2) && row <= rowCount && col == 3)) ? true : false 
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
        console.log(dataToExport)
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
        for (let col = 0; col <= 4; col++) {
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
        addStylesToDataCells(ws, dataToExport.length)
        ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }];
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
        XLSX.writeFile(wb, 'BORDEREAU-export.xlsx')
        hideLoader()
    }
  
    return (
        <Layout>
            <div className="pagetitle">
                <h1>Rapport</h1>
                <nav className="mt-2">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/dashboard">BORDEREAU</Link></li>
                        <li className="breadcrumb-item"><Link to="/rapport">Rapport</Link></li>
                        <li className="breadcrumb-item active">Liste</li>
                    </ol>
                </nav>
            </div>
            <section className="section">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-3">
                            <div className="card-body p-3">
                                <div className="mt-2 mb-4"><h4>Rapport adidy iombonana</h4></div>
                                <hr className="mt-2 mb-4"/>
                                <div className="mb-1 px-3 py-2">
                                    <div className="w-100 border border-radius-0 p-3">
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
                                    </div>
                                </div>
                                <DataTable 
                                    columns={columns} 
                                    data={rapportList} 
                                    progressComponent={<div className="text-sm p-2"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>} 
                                    progressPending={!isFecthed} 
                                    highlightOnHover={true} 
                                    noDataComponent={<div className="p-2">Aucun quartier trouvé.</div>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
  
export default RapportList;