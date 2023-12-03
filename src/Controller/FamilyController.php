<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Family;
use App\Repository\FamilyRepository;
use App\Entity\Apv;
use App\Entity\Quartier;
use App\Entity\DetailsBordereau;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
  
/**
 * @Route("/api", name="api_")
 */
class FamilyController extends AbstractController
{
    /**
     * @Route("/family/list", name="family_index", methods={"GET"})
     */
    public function index(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        $oQuartierUser = $security->getUser()->retrieveUserPlatform()->getQuartier();
        if(!is_null($oQuartierUser)){
            $iIdQuartierUserConnected = $oQuartierUser->getId();
            $families = $doctrine->getManager()
            ->getRepository(Family::class)
            ->findBy(["Quartier" => $doctrine->getManager()->getRepository(Quartier::class)->find($iIdQuartierUserConnected)], ['quartier_id' => 'ASC'],['apv_id' => 'ASC']);

        }else{
            $families = $doctrine->getManager()
                ->getRepository(Family::class)
                ->findAll();
        }
        
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

    /**
     * @Route("/family/apvOptions", name="apvFamilyOptions_index", methods={"GET"})
     */
    public function apvOptions(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $apvOptions = array();
        $cardsNumberList = array();
        if ($stateAuth['success']) {
            $apvs = $doctrine->getManager()
                ->getRepository(Apv::class)
                ->findAll();
            foreach ($apvs as $keyApv => $apv) {
                $apvOptions[] = (object) [
                    'labelKey' => $apv->getId(),
                    'value' => $apv->getLibelle(),
                    'isSelected' => ($keyApv == 0) ? true : false
                ];
            }
            $families = $doctrine->getManager()
                ->getRepository(Family::class)
                ->findAll();
            foreach ($families as $keyFam => $family) {
                $cardsNumberList[] = $family->getCardNumber();
            }
        }
  
        return $this->json([
            "cardsNumberList" => $cardsNumberList,
            "apvOptions" => $apvOptions
        ]);
    }

    /**
     * @Route("/family/create", name="family_new", methods={"POST"})
     */
    public function new(Request $request, FamilyRepository $familyRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'add') {
                $family = new Family();
                $family->setFirstname($request->request->get('firstname'));
                if ($request->request->get('lastname') != '') $family->setLastname($request->request->get('lastname'));
                if ($request->request->get('address') != '') $family->setAddress($request->request->get('address'));
                $family->setQuartier($doctrine->getRepository(Quartier::class)->find($request->request->get('quartier')));
                $family->setApv($doctrine->getRepository(Apv::class)->find($request->request->get('apv')));
                $family->setCardNumber($request->request->get('cardNumber'));
                $family->setDateIn(new \DateTime($request->request->get('dateIn')));
                if ($request->request->get('dateOut') != 'null') $family->setDateOut(new \DateTime($request->request->get('dateOut')));
                $family->setStatut(($request->request->get('statut') == 0) ? true : false);
                if ($request->request->get('profession') != '') $family->setProfession($request->request->get('profession'));
                if ($request->request->get('telephone') != '') $family->setTelephone($request->request->get('telephone'));
                if ($request->request->get('observation') != '') $family->setObservation($request->request->get('observation'));
                $familyRepository->add($family, true);

                $data = array(
                    "success" => true
                );
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/family/search", name="family_search", methods={"POST"})
     */
    public function search(Request $request, FamilyRepository $familyRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'search') {
                $type = $request->request->get('type') == "family" ? "id" : $request->request->get('type');
                $result = $familyRepository->getDataBySearch($type, $request->request->get($request->request->get('type')));
                $data["isHidden"] = true;
                $data["isEmpty"] = true;
                $data["dataFamily"] = [
                    "id" => "",
                    "fullname" => "",
                    "apv" => "",
                    "cardNumber" => "",
                    "yearIn" => "",
                    "address" => ""
                ];
                $data["isLastDetails"] = false;
                $data["lastDetails"] = [
                    "year" => "",
                    "hasina" => "",
                    "seminera" => "",
                    "diosezy" => "",
                    "total" => ""
                ];
                if (!empty($result)) {
                    $data["isHidden"] = false;
                    $data["isEmpty"] = false;
                    $data["dataFamily"] = [
                        "id" => $result[0]->getId(),
                        "fullname" => $result[0]->getFullname(),
                        "apv" => $result[0]->getApv()->getId(),
                        "cardNumber" => $result[0]->getCardNumber(),
                        "yearIn" => $result[0]->getDateIn()->format("Y"),
                        "address" => !is_null($result[0]->getAddress()) ? $result[0]->getAddress() : ''
                    ];
                    $entityManager = $doctrine->getManager();
                    $lastDetails = $doctrine->getManager()
                                ->getRepository(DetailsBordereau::class)
                                ->getLastDetails($result[0]);
                    if (!empty($lastDetails)) {
                        $total = $lastDetails[0]->getHasina() + $lastDetails[0]->getSeminera() + $lastDetails[0]->getDiosezy();
                        $data["isLastDetails"] = true;
                        $data["lastDetails"] = [
                            "year" => $lastDetails[0]->getTaonaHasina(),
                            "hasina" => number_format($lastDetails[0]->getHasina(), 0, '.', ' '),
                            "seminera" => number_format($lastDetails[0]->getSeminera(), 0, '.', ' '),
                            "diosezy" => number_format($lastDetails[0]->getDiosezy(), 0, '.', ' '),
                            "total" => number_format($total, 0, '.', ' ')
                        ];
                    }
                }
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/family/{id}", name="family_show", methods={"GET"})
     */
    public function show(int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $family = $doctrine->getManager()
                ->getRepository(Family::class)
                ->find($id);
      
            if (!$family) {
                return $this->json('Family introuvable : id #' . $id, 404);
            }
            $quartierOptions = array();
            $quartiers = $doctrine->getManager()
                ->getRepository(Quartier::class)
                ->findAll();
            foreach ($quartiers as $keyQuartier => $quartier) {
                $quartierOptions[] = (object) [
                    'labelKey' => $quartier->getId(),
                    'value' => $quartier->getLibelle(),
                    'isSelected' => ($quartier->getId() == $family->getQuartier()->getId()) ? true : false
                ];
            }
            $apvOptions = array();
            $apvs = $doctrine->getManager()
                ->getRepository(Apv::class)
                ->findAll();
            foreach ($apvs as $keyApv => $apv) {
                $apvOptions[] = (object) [
                    'labelKey' => $apv->getId(),
                    'value' => $apv->getLibelle(),
                    'isSelected' => ($apv->getId() == $family->getApv()->getId()) ? true : false
                ];
            }
            $statutOptions = array();
            $tApvStatus = explode('|', $_ENV['FAMILY_STATUS']);
            $statut = $family->isStatut() ? 0 : 1;
            foreach ($tApvStatus as $keyStatus => $valueStatus) {
                $statutOptions[] = (object) [
                    'labelKey' => $keyStatus,
                    'value' => $valueStatus,
                    'isSelected' => ($keyStatus == $statut) ? true : false
                ];
            }

            $cardsNumberList = array();
            $families = $doctrine->getManager()
                ->getRepository(Family::class)
                ->findAll();
            foreach ($families as $keyFam => $familys) {
                if ($family->getCardNumber() != $familys->getCardNumber()) $cardsNumberList[] = $familys->getCardNumber();
            }

            $data = [
                'id' => $family->getId(),
                'firstname' => $family->getFirstname(),
                'lastname' => $family->getLastname(),
                'address' => !is_null($family->getAddress()) ? $family->getAddress() : '',
                'quartier' => $family->getQuartier()->getId(),
                'quartierOptions' => $quartierOptions,
                'apvOptions' => $apvOptions,
                'apv' => $family->getApv()->getId(),
                'cardNumber' => $family->getCardNumber(),
                'dateIn' => $family->getDateIn()->format('Y-m-d'),
                'dateOut' => !is_null($family->getDateOut()) ? $family->getDateOut()->format('Y-m-d') : null,
                'statutOptions' => $statutOptions,
                'statut' => $family->isStatut() ? 0 : 1,
                'observation' => !is_null($family->getObservation()) ? $family->getObservation() : '',
                'telephone' => !is_null($family->getTelephone()) ? $family->getTelephone() : '',
                'profession' => !is_null($family->getProfession()) ? $family->getProfession() : '',
                'cardsNumberList' => $cardsNumberList,
            ];
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/family/edit/{id}", name="family_edit", methods={"POST"})
     */
    public function edit(Request $request, int $id, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $entityManager = $doctrine->getManager();
            $family = $entityManager->getRepository(Family::class)->find($id);
      
            if (!$family) {
                return $this->json('Family introuvable : id #' . $id, 404);
            }
             
            if ($request->request->has('action') && $request->request->get('action') == 'modify') {
                $family->setFirstname($request->request->get('firstname'));
                if ($request->request->get('lastname') != '') $family->setLastname($request->request->get('lastname'));
                if ($request->request->get('address') != '') $family->setAddress($request->request->get('address'));
                $family->setApv($doctrine->getRepository(Apv::class)->find($request->request->get('apv')));
                $family->setCardNumber($request->request->get('cardNumber'));
                $family->setDateIn(new \DateTime($request->request->get('dateIn')));
                if ($request->request->get('dateOut') != 'null') $family->setDateOut(new \DateTime($request->request->get('dateOut')));
                $family->setStatut(($request->request->get('statut') == 0) ? true : false);
                if ($request->request->get('observation') != '') $family->setObservation($request->request->get('observation'));
                $entityManager->persist($family);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/family/remove/{id}", name="family_delete", methods={"DELETE"})
     */
    public function delete(int $id, Family $family, FamilyRepository $familyRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
        //if ($request->request->has('action') && $request->request->get('action') == 'delete') {
            $familyRepository->remove($family, true);
            $data = array('success'=>true);
        //}
        }
  
        return $this->json($data);
    }

    /**
     * @Route("/quartier/quartierOptions", name="quartierOptions_index", methods={"GET"})
     */
    public function quartierOptions(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $quartierOptions = array();
        if ($stateAuth['success']) {
            $quartiers = $doctrine->getManager()
                ->getRepository(Quartier::class)
                ->findAll();
            foreach ($quartiers as $keyQuartier => $quartier) {
                $quartierOptions[] = (object) [
                    'labelKey' => $quartier->getId(),
                    'value' => $quartier->getName(),
                    'isSelected' => ($keyQuartier == 0) ? true : false
                ];
            }
        }
  
        return $this->json($quartierOptions);
    }
  
}