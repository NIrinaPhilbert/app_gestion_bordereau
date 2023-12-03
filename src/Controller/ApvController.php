<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Apv;
use App\Repository\ApvRepository;
use App\Entity\Quartier;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
  
/**
 * @Route("/api", name="api_")
 */
class ApvController extends AbstractController
{
    /**
     * @Route("/apv/list", name="apv_index", methods={"GET"})
     */
    public function index(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = [];
        if ($stateAuth['success']) {
            $apvs = $doctrine->getManager()
                ->getRepository(Apv::class)
                ->findAll();
            foreach ($apvs as $apv) {
                $quartier = (!is_null($apv->getQuartier())) ? $apv->getQuartier()->getName() : '';
                $data[] = [
                    'id' => $apv->getId(),
                    'libelle' => $apv->getLibelle(),
                    'quartier' => $quartier,
                    'statut' => $apv->isStatut(),
                ];
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/apv/quartierOptions", name="quartierApvOptions_index", methods={"GET"})
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
     * @Route("/apv/create", name="apv_new", methods={"POST"})
     */
    public function new(Request $request, ApvRepository $apvRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'add') {
                $apv = new Apv();
                $apv->setLibelle($request->request->get('libelle'));
                $apv->setStatut(($request->request->get('statut') == 0) ? true : false);
                $apv->setQuartier($doctrine->getRepository(Quartier::class)->find($request->request->get('quartier')));
                $apvRepository->add($apv, true);

                $data = array(
                    "success" => true
                );
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/apv/{id}", name="apv_show", methods={"GET"})
     */
    public function show(int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $apv = $doctrine->getManager()
                ->getRepository(Apv::class)
                ->find($id);
      
            if (!$apv) {
                return $this->json('APV introuvable : id #' . $id, 404);
            }
            $quartierOptions = array();
            $quartiers = $doctrine->getManager()
                ->getRepository(Quartier::class)
                ->findAll();
            foreach ($quartiers as $keyQuart => $quartier) {
                $quartierOptions[] = (object) [
                    'labelKey' => $quartier->getId(),
                    'value' => $quartier->getNumero().' - '.$quartier->getName(),
                    'isSelected' => ($quartier->getId() == $apv->getQuartier()->getId()) ? true : false
                ];
            }
            $statutOptions = array();
            $tApvStatus = explode('|', $_ENV['APV_STATUS']);
            $statut = $apv->isStatut() ? 0 : 1;
            foreach ($tApvStatus as $keyStatus => $valueStatus) {
                $statutOptions[] = (object) [
                    'labelKey' => $keyStatus,
                    'value' => $valueStatus,
                    'isSelected' => ($keyStatus == $statut) ? true : false
                ];
            }

            $data = [
                'id' => $apv->getId(),
                'libelle' => $apv->getLibelle(),
                'quartierOptions' => $quartierOptions,
                'quartier' => $apv->getQuartier()->getId(),
                'statutOptions' => $statutOptions,
                'statut' => $apv->isStatut() ? 0 : 1,
            ];
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/apv/edit/{id}", name="apv_edit", methods={"POST"})
     */
    public function edit(Request $request, int $id, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            $entityManager = $doctrine->getManager();
            $apv = $entityManager->getRepository(Apv::class)->find($id);
      
            if (!$apv) {
                return $this->json('APV introuvable : id #' . $id, 404);
            }
             
            if ($request->request->has('action') && $request->request->get('action') == 'modify') {
                $apv->setLibelle($request->request->get('libelle'));
                $apv->setStatut(($request->request->get('statut') == 0) ? true : false);
                $apv->setQuartier($doctrine->getRepository(Quartier::class)->find($request->request->get('quartier')));
                $entityManager->persist($apv);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/apv/remove/{id}", name="apv_delete", methods={"DELETE"})
     */
    public function delete(int $id, Apv $apv, ApvRepository $apvRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
        //if ($request->request->has('action') && $request->request->get('action') == 'delete') {
            $apvRepository->remove($apv, true);
            $data = array('success'=>true);
        //}
        }
  
        return $this->json($data);
    }
     /**
     * @Route("/apv/quartierOptions", name="quartierOptions_index", methods={"GET"})
     */
    public function quartOptions(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $quartierOptions = array();
        if ($stateAuth['success']) {
            $quartiers = $doctrine->getManager()
                ->getRepository(Quartier::class)
                ->findAll();
            foreach ($quartiers as $keyQuart => $quartier) {
                $quartierOptions[] = (object) [
                    'labelKey' => $quartier->getId(),
                    'value' => $quartier->getNom(),
                    'isSelected' => ($keyQuart == 0) ? true : false
                ];
            }
        }
  
        return $this->json($quartierOptions);
    }

    /**
     * @Route("/apv/apvOptions/{id_quartier}", name="apvOptions_index", methods={"GET"})
     */
    public function apvOptions(int $id_quartier, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $apvsOptions = array();
        if ($stateAuth['success']) {
            
            $apv_s = $doctrine->getManager()
                ->getRepository(APV::class)
                ->findBy(array('quartier' => $doctrine->getManager()->getRepository(Quartier::class)->find($id_quartier)));
            
            foreach ($apv_s as $keyAPV => $apv) {
                $apvsOptions[] = (object) [
                    'labelKey' => $apv->getId(),
                    'value' => $apv->getLibelle(),
                    'isSelected' => ($keyAPV == 0) ? true : false
                ];
            }
            
        }
  
        return $this->json($apvsOptions);
    }
  
}