<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\DetailsBordereau;
use App\Repository\DetailsBordereauRepository;
use App\Entity\Family;
use App\Entity\UserPlatform;
use App\Entity\Bordereau;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 * @Route("/api", name="api_")
 */
class DetailsBordereauController extends AbstractController
{
    /**
     * @Route("/detailsbordereau/edit", name="detailsbordereau_edit", methods={"POST"})
     */
    public function edit(Request $request, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        $data = array();
        if ($stateAuth['success']) {
            $entityManager = $doctrine->getManager();
            if ($request->request->has('action') && $request->request->get('action') == 'add') {
                $detailsbordereau = new DetailsBordereau();
                $detailsbordereau->setLigne($request->request->get('ligne'));
            }
            if ($request->request->has('action') && $request->request->get('action') == 'modify') {
                $id = $request->request->get('detailsbordereau');
                $detailsbordereau = $entityManager->getRepository(DetailsBordereau::class)->find($id);
                if (!$detailsbordereau) {
                    return $this->json('Détails introuvable : id #' . $id, 404);
                }
                $detailsbordereau->setLigne($detailsbordereau->getLigne());
            }

            $detailsbordereau->setBordereau($doctrine->getRepository(Bordereau::class)->find($request->request->get('bordereau')));
            $detailsbordereau->setFamily($doctrine->getRepository(Family::class)->find($request->request->get('family')));
            $detailsbordereau->setHasina($request->request->get('hasina'));
            $detailsbordereau->setTaonaHasina($request->request->get('taonaHasina'));
            $detailsbordereau->setSeminera($request->request->get('seminera'));
            $detailsbordereau->setTaonaSeminera($request->request->get('taonaSeminera'));
            $detailsbordereau->setDiosezy($request->request->get('diosezy'));
            $detailsbordereau->setTaonaDiosezy($request->request->get('taonaDiosezy'));
            $entityManager->persist($detailsbordereau);
            $entityManager->flush();

            $data = array(
                "success" => true
            );
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/detailsbordereau/remove/{id}", name="detailsbordereau_delete", methods={"DELETE"})
     */
    public function delete(int $id, DetailsBordereau $detailsBordereau, DetailsBordereauRepository $detailsBordereauRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
        //if ($request->request->has('action') && $request->request->get('action') == 'delete') {
            $detailsBordereauRepository->remove($detailsBordereau, true);
            $data = array('success'=>true);
        //}
        }
  
        return $this->json($data);
    }
}
