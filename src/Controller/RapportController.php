<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Quartier;
use App\Entity\Bordereau;
use App\Entity\DetailsBordereau;
use App\Repository\QuartierRepository;
use App\Repository\BordereauRepository;
use App\Repository\DetailsBordereauRepository;
use App\Entity\Family;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
  
/**
 * @Route("/api", name="api_")
 */
class RapportController extends AbstractController
{
    /**
     * @Route("/rapport/list", name="rapport_index", methods={"POST"})
     */
    public function index(Request $request, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        
        $data = [];
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'search') {
                $mode = $request->request->get('mode');
                $year = $request->request->get('year');
                $begin = new \DateTime($request->request->get('begin'));
                $end = new \DateTime($request->request->get('end'));
                $isYearEmpty = ($year == '');
                $isAdmin = in_array('ROLE_ADMIN', $security->getUser()->getRoles());
                $quartiers = $doctrine->getManager()
                    ->getRepository(Quartier::class)
                    ->findAll();
                $totalGeneral = [
                    'participants_number' => 0,
                    'families_number' => 0,
                    'hasina' => 0,
                    'percent' => 0
                ];
                $lastThree = [
                    'seminera' => [
                        'label' => 'Seminera reçu',
                        'value' => 0
                    ],
                    'diosezy' => [
                        'label' => 'Diosezy reçu',
                        'value' => 0
                    ],
                    'total' => [
                        'label' => 'Total',
                        'value' => 0
                    ]
                ];
                $participants = $doctrine->getManager()->getRepository(DetailsBordereau::class)->findAll();
                $totalGeneral['participants_number'] = count($participants);
                $totalPercentGeneral = 0;
                $totalHasinaGeneral = 0;
                $totalSemineraGeneral = 0;
                $totalDiosezyGeneral = 0;
                foreach ($quartiers as $quartier) {
                    $totalParticipants = 0;
                    $totalFamilies = 0;
                    $totalPercent = 0;
                    $totalHasina = 0;
                    if ($isAdmin || (!$isAdmin && $security->getUser()->retrieveUserPlatform()->getQuartier()->getId() == $quartier->getId())) {
                        foreach ($participants as $key => $value) {
                            $datyBordereau = $value->getBordereau()->getDaty();
                            if (
                                $datyBordereau >= $begin && $datyBordereau <= $end
                            ) {
                                if ($value->getFamily()->getApv()->getQuartier()->getId() == $quartier->getId())
                                {
                                    if ($isYearEmpty || (!$isYearEmpty && $value->getTaonaHasina() == $year)) {
                                        $totalParticipants++;
                                        $totalHasina += $value->getHasina();
                                        $totalHasinaGeneral += $value->getHasina();
                                        $totalSemineraGeneral += $value->getSeminera();
                                        $totalDiosezyGeneral += $value->getDiosezy();
                                    }
                                }
                            }
                        }
                        $families = $doctrine->getManager()->getRepository(Family::class)->findBy(["statut" => true]);
                        $totalGeneral['families_number'] = count($families);
                        foreach ($families as $key => $value) {
                            if (($value->getApv()->getQuartier()->getId() == $quartier->getId()) && ($isAdmin || (!$isAdmin && $security->getUser()->retrieveUserPlatform()->getQuartier()->getId() == $value->getApv()->getQuartier()->getId()))) $totalFamilies++;
                        }
                        if (!$isAdmin && $security->getUser()->retrieveUserPlatform()->getQuartier()->getId() == $quartier->getId()) {
                            $totalGeneral['participants_number'] = $totalParticipants;
                            $totalGeneral['families_number'] = $totalFamilies;
                        }
                        $totalGeneral['hasina'] = number_format($totalHasinaGeneral, 0, '.', ' ');
                        $lastThree['seminera']['value'] = number_format($totalSemineraGeneral, 0, '.', ' ');
                        $lastThree['diosezy']['value'] = number_format($totalDiosezyGeneral, 0, '.', ' ');
                        $lastThree['total']['value'] = number_format($totalHasinaGeneral+$totalSemineraGeneral+$totalDiosezyGeneral, 0, '.', ' ');
                        if ($totalFamilies > 0) $totalPercent = $totalParticipants/$totalFamilies;
                        if ($totalGeneral['families_number'] > 0) $totalPercentGeneral = $totalGeneral['participants_number']/$totalGeneral['families_number'];
                        $totalGeneral['percent'] = number_format($totalPercentGeneral, 2, '.', ' ');
                        $data["rapports"][] = [
                            'quartier' => $quartier->getNumero(),
                            'participants_number' => $totalParticipants,
                            'families_number' => $totalFamilies,
                            'hasina' => number_format($totalHasina, 0, '.', ' '),
                            'percent' => number_format($totalPercent, 2, '.', ' ')
                        ];
                    }
                }
                $data["rapports"][] = [
                    'quartier' => '<b>Total général</b>',
                    'participants_number' => $totalGeneral['participants_number'],
                    'families_number' => $totalGeneral['families_number'],
                    'hasina' => $totalGeneral['hasina'],
                    'percent' => $totalGeneral['percent']
                ];
                foreach ($lastThree as $key => $value) {
                    $data["rapports"][] = [
                        'quartier' => '',
                        'participants_number' => '',
                        'families_number' => '',
                        'hasina' => '<b>'.$value['label'].'</b>',
                        'percent' => $value['value']
                    ];                
                }
                $data["years"] = array();
                $detailsbordereau = $doctrine->getManager()->getRepository(DetailsBordereau::class)->findAllDistincts();
                foreach ($detailsbordereau as $key => $value) {
                    $data["years"][] = $value["yearHasina"];
                }
                if ($mode == "export") {
                    $data["exports"] = $data["rapports"];
                    foreach ($data["exports"] as $key => $value) {
                        if (strpos($value['quartier'], '<b>') !== false) {
                            $value["quartier"] = str_replace("<b>", '', $value['quartier']);
                            $data["exports"][$key]["quartier"] = str_replace("</b>", '', $value['quartier']);
                        }
                        if (strpos($value['hasina'], '<b>') !== false) {
                            $value["hasina"] = str_replace("<b>", '', $value['hasina']);
                            $data["exports"][$key]["hasina"] = str_replace("</b>", '', $value['hasina']);
                        }
                        $data["exports"][$key]["Quartier"] = $data["exports"][$key]["quartier"];
                        $data["exports"][$key]["Nombre participants"] = $data["exports"][$key]["participants_number"];
                        $data["exports"][$key]["Nombre familles"] = $data["exports"][$key]["families_number"];
                        $data["exports"][$key]["Hasina reçu"] = $data["exports"][$key]["hasina"];
                        $data["exports"][$key]["Pourcentage"] = $data["exports"][$key]["percent"];
                        unset($data["exports"][$key]["quartier"]);
                        unset($data["exports"][$key]["participants_number"]);
                        unset($data["exports"][$key]["families_number"]);
                        unset($data["exports"][$key]["hasina"]);
                        unset($data["exports"][$key]["percent"]);
                        $data["exports"][$key] = array_values($data["exports"][$key]);
                    }
                    $data["filters"][] = [
                        'Quartier' => 'Année',
                        'Nombre participants' => 'Date début',
                        'Nombre familles' => 'Date fin',
                        'Hasina reçu' => '',
                        'Pourcentage' => ''
                    ];
                    $data["filters"][] = [
                        'Quartier' => $isYearEmpty ? "Tous" : $year,
                        'Nombre participants' => $begin->format('d/m/Y'),
                        'Nombre familles' => $end->format('d/m/Y'),
                        'Hasina reçu' => '',
                        'Pourcentage' => ''
                    ];
                    $data["filters"][] = [
                        'Quartier' => '',
                        'Nombre participants' => '',
                        'Nombre familles' => '',
                        'Hasina reçu' => '',
                        'Pourcentage' => ''
                    ];
                    $data["filters"][] = [
                        'Quartier' => 'Quartier',
                        'Nombre participants' => 'Nombre participants',
                        'Nombre familles' => 'Nombre familles',
                        'Hasina reçu' => 'Hasina reçu',
                        'Pourcentage' => 'Pourcentage'
                    ];
                    foreach ($data["filters"] as $key => $value) {
                        $data["filters"][$key] = array_values($data["filters"][$key]);
                    }
                    $data["title"][] = [
                        'Quartier' => 'RAPPORT ADIDY IOMBONANA CE ' . date("d/m/Y"),
                        'Nombre participants' => '',
                        'Nombre familles' => '',
                        'Hasina reçu' => '',
                        'Pourcentage' => ''
                    ];
                    $data["title"][] = [
                        'Quartier' => '',
                        'Nombre participants' => '',
                        'Nombre familles' => '',
                        'Hasina reçu' => '',
                        'Pourcentage' => ''
                    ];
                    foreach ($data["title"] as $key => $value) {
                        $data["title"][$key] = array_values($data["title"][$key]);
                    }
                }
            }
        }
  
        return $this->json($data);
    }

    /**
     * @Route("/rapport/listnonparticipant", name="rapportnonparticipant_index", methods={"POST"})
     */
    public function getlistfamillenonparticipant(Request $request, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        $tiFamilyParticipant = array();

        $zDateDuJour    = date('d/m/Y') ;
        $iAnneeCourante = date('Y') ;
        $mode = 'list' ;
        $year = $request->request->get('year');
        $begin = new \DateTime($request->request->get('begin'));
        $end = new \DateTime($request->request->get('end'));

        $toDetailsBordereau = $doctrine->getManager()
            ->getRepository(DetailsBordereau::class)
            ->getListBorderauxEntreDeuxDates($begin, $end) ;
        foreach($toDetailsBordereau as $oDetailsBordereau)
        {
            $tiFamilyParticipant[] = $oDetailsBordereau->getFamily()->getId() ;
        }
        /*
        $toFamilyNotIn = $doctrine->getManager()
            ->getRepository(Family::class)
            ->getFamilyNotIn($tiFamilyParticipant) ;
        foreach($toFamilyNotIn as $oFamilyNotIn)
        {
            echo '<pre>' ;
            print_r($oFamilyNotIn->getId()) ;
            echo '</pre>' ;
        }
        */
        

        $oQuartierUser = $security->getUser()->retrieveUserPlatform()->getQuartier();
        if(!is_null($oQuartierUser)){
            $iIdQuartierUserConnected = $oQuartierUser->getId();
            /*
            $families = $doctrine->getManager()
            ->getRepository(Family::class)
            ->findBy(["Quartier" => $doctrine->getManager()->getRepository(Quartier::class)->find($iIdQuartierUserConnected)]);
            */
            $oQuartierWhere = $doctrine->getManager()->getRepository(Quartier::class)->find($iIdQuartierUserConnected) ;
            $families = $doctrine->getManager()
                ->getRepository(Family::class)
                ->getFamilyNotInWithQuartier($tiFamilyParticipant, $oQuartierWhere) ;
        }else{
            /*
            $families = $doctrine->getManager()
                ->getRepository(Family::class)
                ->findAll();
            */
            $families = $doctrine->getManager()
                ->getRepository(Family::class)
                ->getFamilyNotIn($tiFamilyParticipant) ;
        }
        /*
        foreach($families as $oFamilyNotIn)
        {
            echo '<pre>' ;
            print_r($oFamilyNotIn->getId()) ;
            echo '</pre>' ;
        }
        
        echo '<hr/>' ;
        //echo $QueryDetailBordereau . '<br/>';
        echo '<pre>' ;
        print_r($tiFamilyParticipant) ;
        echo '</pre>' ;

        echo $mode . ' => ' . $year  ;
        print_r($begin) ;
        echo '<br/>begin==' ;
        print_r($end) ;
        exit() ;
        */

        $data = [];
        if ($stateAuth['success']) {
            if(count($families)> 0){
                    foreach ($families as $family) {
                        $apv = (!is_null($family->getApv())) ? $family->getApv()->getLibelle() : '';
                        $date_in = (!is_null($family->getDateIn())) ? $family->getDateIn() : '';
                        $address = (!is_null($family->getAddress())) ? $family->getAddress() : '';
                        $telephone = (!is_null($family->getTelephone())) ? $family->getTelephone() : '';
                        $profession = (!is_null($family->getProfession())) ? $family->getProfession() : '';
                        $observation = (!is_null($family->getObservation())) ? $family->getObservation() : '';
                        $data[] = [
                            'id' => $family->getId(),
                            'fullname' => $family->getFullname(),
                            'quartier' => $family->getQuartier()->getNumero(),
                            'apv' => $apv,
                            'cardNumber' => $family->getCardNumber(),
                            'statut' => $family->isStatut(),
                            'date_in' => $date_in,
                            'address' => $address,
                            'telephone' => $telephone,
                            'profession' => $profession,
                            'observation' => $observation,
                        ];
                    }
                }
        }//end connected

        return $this->json($data);
        
        
  
        
    }
}