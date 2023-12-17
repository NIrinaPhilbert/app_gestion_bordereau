<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Quartier;
use App\Repository\QuartierRepository;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
  
/**
 * @Route("/api", name="api_")
 */
class QuartierController extends AbstractController
{
   
    /**
     * @Route("/quartier", name="quartier_index", methods={"GET"})
     */
    public function index(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        
        $data = [];
        if ($stateAuth['success']) {
            $quartiers = $doctrine->getManager()
                ->getRepository(Quartier::class)
                ->findAll();      
            foreach ($quartiers as $quartier) {
                $data[] = [
                    'id' => $quartier->getId(),
                    'numero' => $quartier->getNumero(),
                    'name' => $quartier->getName(),
                ];
            }
        }
  
        return $this->json($data);
    }

    /**
     * @Route("/quartier/create", name="quartier_new", methods={"POST"})
     */
    public function new(Request $request, QuartierRepository $quartierRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'add') {
                $entityManager = $doctrine->getManager();
                $quartier = new Quartier();
                $quartier->setNumero($request->request->get('numero'));
                $quartier->setName($request->request->get('name'));
                $quartierRepository->add($quartier, true);

                $data = array(
                    "success" => true
                );
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/quartier/{id}", name="quartier_show", methods={"GET"})
     */
    public function show(int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        
        $data = [];
        if ($stateAuth['success']) {
            $quartier = $doctrine->getManager()
                ->getRepository(Quartier::class)
                ->find($id);
            if (!$quartier) {
                return $this->json('Quartier introuvable : id #' . $id, 404);
            }
            $data = [
                'id' => $quartier->getId(),
                'numero' => $quartier->getNumero(),
                'name' => $quartier->getName(),
            ];
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/quartier/edit/{id}", name="quartier_edit", methods={"POST"})
     */
    public function edit(Request $request, int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $entityManager = $doctrine->getManager();
        $quartier = $entityManager->getRepository(Quartier::class)->find($id);
  
        if (!$quartier) {
            return $this->json('Quartier introuvable : id #' . $id, 404);
        }
         
        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'modify') {
                $quartier->setNumero($request->request->get('numero'));
                $quartier->setName($request->request->get('name'));
                $entityManager->persist($quartier);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/quartier/remove/{id}", name="quartier_delete", methods={"DELETE"})
     */
    public function delete(int $id, Quartier $quartier, QuartierRepository $quartierRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        $quartierRepository->remove($quartier, true);
        $data = array('success'=>true);
  
        return $this->json($data);
    }

    
}