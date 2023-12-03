<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Home;
use App\Repository\HomeRepository;
use Symfony\Component\Security\Core\Security;
use App\Service\StateService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
  
/**
 * @Route("/api", name="api_")
 */
class HomeController extends AbstractController
{
    /**
     * @Route("/home", name="home_index", methods={"GET"})
     */
    public function index(ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        
        $data = [];
        if ($stateAuth['success']) {
            $docFolder = '../public/files/home/';
            if (!file_exists($docFolder)) mkdir($docFolder, 0777, true);
            $docs = $doctrine->getManager()
                ->getRepository(Home::class)
                ->findAll();      
            foreach ($docs as $doc) {
                $data[] = [
                    'id' => $doc->getId(),
                    'title' => $doc->getTitle(),
                    'imageFile' => str_replace("../public/", "/", $docFolder).$doc->getImage(),
                    'imageName' => $doc->getImage(),
                    'textContent' => !is_null($doc->getTextContent()) ? $doc->getTextContent() : ''
                ];
            }
        }
  
        return $this->json($data);
    }

    /**
     * @Route("/home/create", name="home_new", methods={"POST"})
     */
    public function new(Request $request, HomeRepository $homeRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $data = array();
        if ($stateAuth['success']) {
            if ($request->request->has('action') && $request->request->get('action') == 'add') {
                $entityManager = $doctrine->getManager();
                $doc = new Home();
                $doc->setImage('');
                $doc->setTitle($request->request->get('title'));
                $doc->setTextContent($request->request->get('textContent'));
                $homeRepository->add($doc, true);

                $newDoc = $doctrine->getRepository(Home::class)->findOneBy(array(), array('id'=>'DESC'));
                $docFolder = '../public/files/home/';
                if (!file_exists($docFolder)) mkdir($docFolder, 0777, true);
                $imageFile = $request->files->get('imageFile');
                $imageName = $request->request->get('imageName');
                $imageExtension = explode(".", $imageName)[(count(explode(".", $imageName)))-1];
                $imageFileName = "DOC-".md5($newDoc->getId()).".".$imageExtension;
                $imageFile->move($docFolder, $imageFileName);

                $newDoc->setImage($imageFileName);
                $entityManager->persist($newDoc);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }

        return $this->json($data);
    }

    /**
     * @Route("/home/{id}", name="home_show", methods={"GET"})
     */
    public function show(int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();
        
        $data = [];
        if ($stateAuth['success']) {
            $docFolder = '../public/files/home/';
            if (!file_exists($docFolder)) mkdir($docFolder, 0777, true);
            $doc = $doctrine->getManager()
                ->getRepository(Home::class)
                ->find($id);
            if (!$doc) {
                return $this->json('Donnée introuvable : id #' . $id, 404);
            }
            $data = [
                'id' => $doc->getId(),
                'title' => $doc->getTitle(),
                'imageFile' => str_replace("../public/", "/", $docFolder).$doc->getImage(),
                'imageName' => $doc->getImage(),
                'textContent' => !is_null($doc->getTextContent()) ? $doc->getTextContent() : ''
            ];
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/home/edit/{id}", name="home_edit", methods={"POST"})
     */
    public function edit(Request $request, int $id, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $entityManager = $doctrine->getManager();
        $doc = $entityManager->getRepository(Home::class)->find($id);
  
        if (!$doc) {
            return $this->json('Donnée introuvable : id #' . $id, 404);
        }
         
        $data = array();
        if ($stateAuth['success']) {
            $docFolder = '../public/files/home/';
            if (!file_exists($docFolder)) mkdir($docFolder, 0777, true);
            if ($request->request->has('action') && $request->request->get('action') == 'modify') {
                $doc->setTitle($request->request->get('title'));
                $doc->setTextContent($request->request->get('textContent'));

                $imageName = $request->request->get('imageName');
                $imageNameToEdit = $request->request->get('imageNameToEdit');
                if ($imageName != $imageNameToEdit) {
                    $imageFile = $request->files->get('imageFile');
                    $imageExtension = explode(".", $imageName)[(count(explode(".", $imageName)))-1];
                    $imageFileName = "DOC-".md5($doc->getId()).".".$imageExtension;
                    if (!empty($imageNameToEdit) && file_exists($docFolder.$imageNameToEdit)) unlink($docFolder.$imageNameToEdit);
                    $imageFile->move($docFolder, $imageFileName);
                    $doc->setImage($imageFileName);
                }

                $entityManager->persist($doc);
                $entityManager->flush();

                $data = array(
                    "success" => true
                );
            }
        }
          
        return $this->json($data);
    }

    /**
     * @Route("/home/remove/{id}", name="home_delete", methods={"DELETE"})
     */
    public function delete(int $id, Home $home, HomeRepository $homeRepository, ManagerRegistry $doctrine, Security $security, ParameterBagInterface $params): Response
    {
        $stateService = new StateService($security, $params);
        $stateAuth = $stateService->checkState();

        $doc = $homeRepository->find($id);
        $homeRepository->remove($home, true);
        $docToDelete = '../public/files/home/'.$doc->getImage();
        if (file_exists($docToDelete)) unlink($docToDelete);
        $data = array('success'=>true);
  
        return $this->json($data);
    }
}