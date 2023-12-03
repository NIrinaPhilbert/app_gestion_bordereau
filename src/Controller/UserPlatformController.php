<?php

namespace App\Controller;

use App\Entity\UserPlatform;
use App\Entity\User;
use App\Form\UserPlatformType;
use App\Repository\UserPlatformRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
// use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
// use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Security\Core\Security;

/**
 * @Route("/user_platform")
 */
class UserPlatformController extends AbstractController
{
    /**
     * @Route("/", name="app_user_platform_index", methods={"GET"})
     */
    public function index(UserPlatformRepository $userPlatformRepository, Security $security): Response
    {
    	if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user_platform/index.html.twig', [
            'user_platforms' => $userPlatformRepository->findAll(),
        ]);
    }

    /**
     * @Route("/new", name="app_user_platform_new", methods={"GET", "POST"})
     */
    public function new(Request $request, UserPlatformRepository $userPlatformRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder): Response
    {
    	if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        $userPlatform = new UserPlatform();
        $form = $this->createForm(UserPlatformType::class, $userPlatform);
        $form->handleRequest($request);

        $customError = array();
        if ($form->isSubmitted() && $form->isValid()) {
        	$ifEmailExist = ($doctrine->getRepository(User::class)->findBy(array('email' => $request->request->get('user_platform')['email'])) == null) ? false : true;
        	if($ifEmailExist) {
        		$customError['email'] = "Cette adresse e-mail n'est plus disponible.";
        	} else {
        		$entityManager = $doctrine->getManager();
	            $user = new User();
	            $user->setEmail($request->request->get('user_platform')['email']);
	            $user->setPassword($passwordEncoder->encodePassword($user, $request->request->get('user_platform')['email']));
	            $user->setRoles(["ROLE_USER"]);
	            $user->setIsVerified(true);
	            $entityManager->persist($user);
	            $entityManager->flush();

	            $userPlatform->setEmail($user);
	        	$userPlatform->setCreatedAt(new \DateTime(date('Y-m-d H:i:s')));
	            $userPlatformRepository->add($userPlatform, true);

            	return $this->redirectToRoute('app_user_platform_index', [], Response::HTTP_SEE_OTHER);

	        }
        }

        return $this->renderForm('user_platform/new.html.twig', [
            'user_platform' => $userPlatform,
            'mode' => 'add',
            'customError' => $customError,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/profile", name="app_user_platform_profile", methods={"GET", "POST"})
     */
    public function profile(Request $request, ManagerRegistry $doctrine, Security $security): Response
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }

        $entityManager = $doctrine->getManager();
        $userPlatform = $entityManager->getRepository(UserPlatform::class)->find($security->getUser()->retrieveUserPlatform()->getId());
        //dump($userPlatform); die();
        $form = $this->createForm(UserPlatformType::class, $userPlatform);
        $form->handleRequest($request);

        $customError = array();
        if ($form->isSubmitted() && $form->isValid()) {
            $userPlatform->setStatut($userPlatform->getStatut());
            $userPlatform->setCreatedAt($userPlatform->getCreatedAt());
            $userPlatform->setEditedAt(new \DateTime(date('Y-m-d H:i:s')));
            $entityManager->flush();

            return $this->redirectToRoute('app_user_platform_profile', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('user_platform/profile.html.twig', [
            'user_platform' => $userPlatform,
            'mode' => 'profile',
            'customError' => $customError,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/{id}", name="app_user_platform_show", methods={"GET"})
     */
    public function show(UserPlatform $userPlatform, Security $security): Response
    {
    	if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user_platform/show.html.twig', [
            'user_platform' => $userPlatform,
        ]);
    }

    /**
     * @Route("/{id}/edit", name="app_user_platform_edit", methods={"GET", "POST"})
     */
    public function edit(Request $request, UserPlatform $userPlatform, UserPlatformRepository $userPlatformRepository, Security $security): Response
    {
    	if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        $form = $this->createForm(UserPlatformType::class, $userPlatform);
        $form->handleRequest($request);

        $customError = array();
        if ($form->isSubmitted() && $form->isValid()) {
        	$userPlatform->setCreatedAt($userPlatform->getCreatedAt());
        	$userPlatform->setEditedAt(new \DateTime(date('Y-m-d H:i:s')));
            $userPlatformRepository->add($userPlatform, true);

            return $this->redirectToRoute('app_user_platform_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('user_platform/edit.html.twig', [
            'user_platform' => $userPlatform,
            'mode' => 'edit',
            'customError' => $customError,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/{id}", name="app_user_platform_delete", methods={"POST"})
     */
    public function delete(Request $request, UserPlatform $userPlatform, UserPlatformRepository $userPlatformRepository, Security $security): Response
    {
    	if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        if ($this->isCsrfTokenValid('delete'.$userPlatform->getId(), $request->request->get('_token'))) {
            $userPlatformRepository->remove($userPlatform, true);
        }

        return $this->redirectToRoute('app_user_platform_index', [], Response::HTTP_SEE_OTHER);
    }
}
