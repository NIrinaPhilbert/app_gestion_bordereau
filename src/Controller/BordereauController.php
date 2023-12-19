<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Bordereau;
use App\Repository\BordereauRepository;
use App\Entity\Quartier;
use App\Entity\UserPlatform;
use App\Entity\DetailsBordereau;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
  
/**
 * @Route("/api", name="api_")
 */
class BordereauController extends AbstractController
{
    /**
     * @Route("/bordereau/list/{mode}", name="bordereau_index", methods={"GET"})
     */
    public function index(string $mode, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        $oQuartierUser = $security->getUser()->retrieveUserPlatform()->getQuartier();

        $data = [];
        if ($stateAuth['success']) {
            if (in_array('ROLE_ADMIN', $security->getUser()->getRoles())) {
                $bordereaux = $doctrine->getManager()
                    ->getRepository(Bordereau::class)
                    ->findAll();
            } else {
                $bordereaux = $doctrine->getManager()
                    ->getRepository(Bordereau::class)
                    ->findBy(["quartier" => $security->getUser()->retrieveUserPlatform()->getQuartier()]);
            }
            $tBordereauStatus = explode('|', $_ENV['BORDEREAU_STATES']);
            foreach ($bordereaux as $bordereau) {
                $quartier = (!is_null($bordereau->getQuartier())) ? $bordereau->getQuartier()->getName() : '';
                $statut = $bordereau->isValid() ? 1 : 0;
                $detailsBordereaux = $doctrine->getManager()
                    ->getRepository(DetailsBordereau::class)
                    ->findBy(["bordereau" => $bordereau]);
                $totalTotal = 0;
                foreach ($detailsBordereaux as $keyBordereau => $detailsbordereau) {
                    $total = $detailsbordereau->getHasina() + $detailsbordereau->getSeminera() + $detailsbordereau->getDiosezy();
                    $totalTotal += $total;
                }
                $data[] = [
                    'id' => $bordereau->getId(),
                    'number' => $bordereau->getNumber(),
                    'quartier' => $quartier,
                    'daty' => $bordereau->getDaty()->format("d/m/Y"),
                    'owner' => $bordereau->getOwner()->getFirstname().(!is_null($bordereau->getOwner()->getLastname()) ? ' '.$bordereau->getOwner()->getLastname() : ''),
                    'receiver' => $bordereau->isValid() ? $bordereau->getReceiver()->getFirstname().(!is_null($bordereau->getReceiver()->getLastname()) ? ' '.$bordereau->getReceiver()->getLastname() : '') : "",
                    'valid' => $bordereau->isValid(),
                    'statutText' => $tBordereauStatus[$statut],
                    'total' => number_format($totalTotal, 0, '.', ' ')
                ];
            }

            if ($mode == "export") {
                
                $data["title"]   = array() ;
                $data["filters"] = array() ;
                $data["exports"] = array() ;

                $data["filters"][] = [
                    'id' => '', 
                    'number' =>  '',
                    'quartier' =>  '',
                    'daty' =>  '',
                    'owner' =>  '',
                    'statut' =>  '',
                    'total' =>  '',
                    'col8' => '',
                    'col9' => '',
                    'col10' => '',
                    'col11' => '',
                    'col12' => '',
                    'col13' => '',
                    'col14' => '',
                    'col15' => '',
                    'col16' => '',
                ] ;
                $data["filters"][] = [
                    'id' => '', 
                    'number' =>  '',
                    'quartier' =>  '',
                    'daty' =>  '',
                    'owner' =>  '',
                    'statut' =>  '',
                    'total' =>  '',
                    'col8' => '',
                    'col9' => '',
                    'col10' => '',
                    'col11' => '',
                    'col12' => '',
                    'col13' => '',
                    'col14' => '',
                    'col15' => '',
                    'col16' => '',
                ] ;
                $data["filters"][] = [
                    'id' => '', 
                    'number' =>  '',
                    'quartier' =>  '',
                    'daty' =>  '',
                    'owner' =>  '',
                    'statut' =>  '',
                    'total' =>  '',
                    'col8' => '',
                    'col9' => '',
                    'col10' => '',
                    'col11' => '',
                    'col12' => '',
                    'col13' => '',
                    'col14' => '',
                    'col15' => '',
                    'col16' => '',
                ] ;
                $data["filters"][] = [
                    'id' => 'ID', 
                    'number' =>  'Numéro',
                    'quartier' =>  'Quartier',
                    'daty' =>  'Date',
                    'owner' =>  'Auteur',
                    'statut' =>  'Statut',
                    'total' =>  'Montant',
                    'col8' => 'N° carte',
                    'col9' => 'Famille',
                    'col10' => 'Hasina',
                    'col11' => 'Taona',
                    'col12' => 'Seminera',
                    'col13' => 'Taona',
                    'col14' => 'Diosezy',
                    'col15' => 'Taona',
                    'col16' => 'Total',
                ] ;
                $zQuartierTitre = (!is_null($oQuartierUser)) ? $oQuartierUser->getName() : 'Tous' ;
                
                $iKey = 0 ;
                foreach ($bordereaux as $bordereau) {
                    $quartier = (!is_null($bordereau->getQuartier())) ? $bordereau->getQuartier()->getName() : '';
                    $statut = $bordereau->isValid() ? 1 : 0;
                    $detailsBordereaux = $doctrine->getManager()
                        ->getRepository(DetailsBordereau::class)
                        ->findBy(["bordereau" => $bordereau]);
                    $totalTotal = 0;
                    foreach ($detailsBordereaux as $keyBordereau => $detailsbordereau) {
                        $total = $detailsbordereau->getHasina() + $detailsbordereau->getSeminera() + $detailsbordereau->getDiosezy();
                        $totalTotal += $total;
                    }
                    $iCompteurDetail = 0 ;
                    foreach ($detailsBordereaux as $keyBordereau => $detailsbordereau) {
                        $totaldetailbordereau = $detailsbordereau->getHasina() + $detailsbordereau->getSeminera() + $detailsbordereau->getDiosezy();
                        $data['exports'][$iKey] = [
                            'id' => $bordereau->getId(),
                            'number' => $bordereau->getNumber(),
                            'quartier' => $quartier,
                            'daty' => $bordereau->getDaty()->format("d/m/Y"),
                            'owner' => $bordereau->getOwner()->getFirstname().(!is_null($bordereau->getOwner()->getLastname()) ? ' '.$bordereau->getOwner()->getLastname() : ''),
                            'statut' => $tBordereauStatus[$statut],
                            'total' => number_format($totalTotal, 0, '.', ' '),
                        ];
                        $data['exports'][$iKey]['col8'] = $detailsbordereau->getFamily()->getCardNumber() ;
                        $data['exports'][$iKey]['col9'] =  $detailsbordereau->getFamily()->getFullname();
                        $data['exports'][$iKey]['col10'] =  $detailsbordereau->getHasina();
                        $data['exports'][$iKey]['col11'] =  $detailsbordereau->getTaonaHasina();
                        $data['exports'][$iKey]['col12'] =  $detailsbordereau->getSeminera();
                        $data['exports'][$iKey]['col13'] =  $detailsbordereau->getTaonaSeminera();
                        $data['exports'][$iKey]['col14'] = $detailsbordereau->getDiosezy();
                        $data['exports'][$iKey]['col15'] = $detailsbordereau->getTaonaDiosezy();
                        $data['exports'][$iKey]['col16'] = number_format($totaldetailbordereau, 0, '.', ' ');

                        if($iCompteurDetail > 0)
                        {
                            $data['exports'][$iKey]['id'] =  '' ;
                            $data['exports'][$iKey]['number'] =  '' ;
                            $data['exports'][$iKey]['quartier'] =  '' ;
                            $data['exports'][$iKey]['daty'] =  '' ;
                            $data['exports'][$iKey]['owner'] =  '' ;
                            $data['exports'][$iKey]['statut'] =  '' ;
                            $data['exports'][$iKey]['total'] =  '' ;
                        }

                        $iKey ++ ;
                        $iCompteurDetail ++ ;
                    }
                    
                }
            
                $data["title"][] = [
                    'id' =>  'LISTE DES BORDEREAUX ' . $zQuartierTitre,
                    'number' =>  '',
                    'quartier' =>  '',
                    'daty' =>  '',
                    'owner' =>  '',
                    'statut' =>  '',
                    'total' =>  '',
                    'col8' => '',
                    'col9' => '',
                    'col10' => '',
                    'col11' => '',
                    'col12' => '',
                    'col13' => '',
                    'col14' => '',
                    'col15' => '',
                    'col16' => '',
                ];
                $data["title"][] = [
                    'id' =>  '',
                    'number' =>  '',
                    'quartier' =>  '',
                    'daty' =>  '',
                    'owner' =>  '',
                    'statut' =>  '',
                    'total' =>  '',
                    'col8' => '',
                    'col9' => '',
                    'col10' => '',
                    'col11' => '',
                    'col12' => '',
                    'col13' => '',
                    'col14' => '',
                    'col15' => '',
                    'col16' => '',
                ];
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/bordereau/quartierOptions", name="quartierBordereauOptions_index", methods={"GET"})
     */
    public function quartOptions(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $quartierOptions = array();
        if ($stateAuth['success']) {
            if (in_array('ROLE_ADMIN', $security->getUser()->getRoles())) {
                $quartiers = $doctrine->getManager()
                    ->getRepository(Quartier::class)
                    ->findAll();
            } else {
                $quartiers = $doctrine->getManager()
                    ->getRepository(Quartier::class)
                    ->findBy(["id" => $security->getUser()->retrieveUserPlatform()->getQuartier()->getId()]);
            }
            foreach ($quartiers as $keyQuart => $quartier) {
                $quartierOptions[] = (object) [
                    'labelKey' => $quartier->getId(),
                    'value' => $quartier->getNumero().' - '.$quartier->getName(),
                    'isSelected' => ($keyQuart == 0) ? true : false
                ];
            }
        }
  
        return $this->json($quartierOptions);
    }

    /**
     * @Route("/bordereau/create", name="bordereau_new", methods={"POST"})
     */
    public function new(Request $request, BordereauRepository $bordereauRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'add') {
                $bordereau = new Bordereau();
                $bordereau->setNumber($request->request->get('number'));
                $bordereau->setQuartier($doctrine->getRepository(Quartier::class)->find($request->request->get('quartier')));
                $bordereau->setDaty(new \DateTime($request->request->get('daty')));
                $bordereau->setOwner($security->getUser()->retrieveUserPlatform());
                $bordereau->setReceiver(null);
                $bordereau->setValid(false);
                $bordereauRepository->add($bordereau, true);

                $data = array(
                    "success" => true,
                    "returnId" => $bordereau->getId()
                );
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/bordereau/details/list/{id}", name="bordereauDetails_index", methods={"GET"})
     */
    public function details(int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = [];
        if ($stateAuth['success']) {
            $detailsBordereaux = $doctrine->getManager()
                ->getRepository(DetailsBordereau::class)
                ->findBy(["bordereau" => $doctrine->getManager()
                ->getRepository(Bordereau::class)
                ->find($id)]);
            $totalHasina = 0;
            $totalSeminera = 0;
            $totalDiosezy = 0;
            $totalTotal = 0;
            foreach ($detailsBordereaux as $keyBordereau => $bordereau) {
                $totalHasina += $bordereau->getHasina();
                $totalSeminera += $bordereau->getSeminera();
                $totalDiosezy += $bordereau->getDiosezy();
                $total = $bordereau->getHasina() + $bordereau->getSeminera() + $bordereau->getDiosezy();
                $totalTotal += $total;
                $data[] = [
                    'isTotal' => false,
                    'ligne' => $bordereau->getLigne(),
                    'id' => $bordereau->getId(),
                    'cardNumber' => $bordereau->getFamily()->getCardNumber(),
                    'familyId' => $bordereau->getFamily()->getId(),
                    'family' => $bordereau->getFamily()->getFullname(),
                    "hasina" => number_format($bordereau->getHasina(), 0, '.', ' '),
                    "taonaHasina" => $bordereau->getTaonaHasina(),
                    "seminera" => number_format($bordereau->getSeminera(), 0, '.', ' '),
                    "taonaSeminera" => $bordereau->getTaonaSeminera(),
                    "diosezy" => number_format($bordereau->getDiosezy(), 0, '.', ' '),
                    "taonaDiosezy" => $bordereau->getTaonaDiosezy(),
                    "total" => number_format($total, 0, '.', ' ')
                ];
            }
            $data[] = [
                'isTotal' => true,
                'ligne' => "TOTAL",
                'id' => "",
                'cardNumber' => "",
                'familyId' => "",
                'family' => "",
                "hasina" => number_format($totalHasina, 0, '.', ' '),
                "taonaHasina" => "",
                "seminera" => number_format($totalSeminera, 0, '.', ' '),
                "taonaSeminera" => "",
                "diosezy" => number_format($totalDiosezy, 0, '.', ' '),
                "taonaDiosezy" => "",
                "total" => number_format($totalTotal, 0, '.', ' ')
            ];
        }

        return $this->json($data);
    }

    /**
     * @Route("/bordereau/{id}", name="bordereau_show", methods={"GET"})
     */
    public function show(int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $bordereau = $doctrine->getManager()
                ->getRepository(Bordereau::class)
                ->find($id);
      
            if (!$bordereau) {
                return $this->json('Bordereau introuvable : id #' . $id, 404);
            }
            // if ($bordereau->isValid() && !in_array('ROLE_ADMIN', $security->getUser()->getRoles())) {
            //     return $this->json(
            //         [
            //             'success' => false,
            //             'message' => 'Le bordereau "'.$bordereau->getNumber().'" a déjà été validé par '.$bordereau->getReceiver()->getFirstname().(!is_null($bordereau->getReceiver()->getLastname()) ? ' '.$bordereau->getReceiver()->getLastname() : '')
            //         ]
            //     );
            // }
            $quartierOptions = array();
            if (in_array('ROLE_ADMIN', $security->getUser()->getRoles())) {
                $quartiers = $doctrine->getManager()
                    ->getRepository(Quartier::class)
                    ->findAll();
            } else {
                $quartiers = $doctrine->getManager()
                    ->getRepository(Quartier::class)
                    ->findBy(["id" => $security->getUser()->retrieveUserPlatform()->getQuartier()->getId()]);
            }
            foreach ($quartiers as $keyQuart => $quartier) {
                $quartierOptions[] = (object) [
                    'labelKey' => $quartier->getId(),
                    'value' => $quartier->getNumero().' - '.$quartier->getName(),
                    'isSelected' => ($quartier->getId() == $bordereau->getQuartier()->getId()) ? true : false
                ];
            }
            $statutOptions = array();
            $tBordereauStatus = explode('|', $_ENV['BORDEREAU_STATES']);
            $statut = $bordereau->isValid() ? 1 : 0;
            foreach ($tBordereauStatus as $keyStatus => $valueStatus) {
                $statutOptions[] = (object) [
                    'labelKey' => $keyStatus,
                    'value' => $valueStatus,
                    'isSelected' => ($keyStatus == $statut) ? true : false
                ];
            }

            $data = [
                'success' => true,
                'id' => $bordereau->getId(),
                'number' => $bordereau->getNumber(),
                'quartier' => $bordereau->getQuartier()->getId(),
                'quartierOptions' => $quartierOptions,
                'daty' => $bordereau->getDaty()->format("Y-m-d"),
                'owner' => $bordereau->getOwner()->getFirstname().(!is_null($bordereau->getOwner()->getLastname()) ? ' '.$bordereau->getOwner()->getLastname() : ''),
                'statut' => $bordereau->isValid() ? 1 : 0,
                'statutOptions' => $statutOptions
            ];
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/bordereau/edit/{id}", name="bordereau_edit", methods={"POST"})
     */
    public function edit(Request $request, int $id, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $entityManager = $doctrine->getManager();
            $bordereau = $entityManager->getRepository(Bordereau::class)->find($id);
      
            if (!$bordereau) {
                return $this->json('Bordereau introuvable : id #' . $id, 404);
            }
             
            if ($request->request->has('action') && $request->request->get('action') == 'modify') {
                $bordereau->setNumber($request->request->get('number'));
                $bordereau->setQuartier($doctrine->getRepository(Quartier::class)->find($request->request->get('quartier')));
                $bordereau->setDaty(new \DateTime($request->request->get('daty')));
                $entityManager->persist($bordereau);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/bordereau/validate/{id}", name="bordereau_validate", methods={"POST"})
     */
    public function validate(Request $request, int $id, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $entityManager = $doctrine->getManager();
            $bordereau = $entityManager->getRepository(Bordereau::class)->find($id);
      
            if (!$bordereau) {
                return $this->json('Bordereau introuvable : id #' . $id, 404);
            }
             
            if ($request->request->has('action') && $request->request->get('action') == 'validate') {
                $bordereau->setReceiver($security->getUser()->retrieveUserPlatform());
                $bordereau->setValid(true);
                $entityManager->persist($bordereau);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/bordereau/remove/{id}", name="bordereau_delete", methods={"DELETE"})
     */
    public function delete(int $id, Bordereau $bordereau, BordereauRepository $bordereauRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
        //if ($request->request->has('action') && $request->request->get('action') == 'delete') {
            $bordereauRepository->remove($bordereau, true);
            $data = array('success'=>true);
        //}
        }
  
        return $this->json($data);
    }
  
}