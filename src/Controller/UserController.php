<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserPlatform;
use App\Form\UserType;
use App\Repository\UserRepository;
use App\Repository\UserPlatformRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;

/**
 * @Route("/user")
 */
class UserController extends AbstractController
{
    /**
     * @Route("/", name="app_user_index", methods={"GET"})
     */
    public function index(UserRepository $userRepository, Security $security): Response
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user/index.html.twig', [
            'users' => $userRepository->findAll(),
        ]);
    }

    /**
     * @Route("/new", name="app_user_new", methods={"GET", "POST"})
     */
    public function new(Request $request, UserRepository $userRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder): Response
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        $user = new User();
        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
        	$user->setPassword($passwordEncoder->encodePassword($user, $user->getPassword()));
			$user->setRoles(["ROLE_ADMIN"]);
            $userRepository->add($user, true);

            $entityManager = $doctrine->getManager();
            $userPlatform = new UserPlatform();
            $userPlatform->setEmail($user);
            $userPlatform->setFirstname(explode('@', $user->getEmail())[0]);
            $userPlatform->setCreatedAt(new \DateTime(date('Y-m-d H:i:s')));
            $entityManager->persist($userPlatform);
            $entityManager->flush();

            return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('user/new.html.twig', [
            'user' => $user,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/{id}", name="app_user_show", methods={"GET"})
     */
    public function show(User $user, Security $security): Response
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user/show.html.twig', [
            'user' => $user,
        ]);
    }

    /**
     * @Route("/{id}/edit", name="app_user_edit", methods={"GET", "POST"})
     */
    public function edit(Request $request, User $user, UserRepository $userRepository, ManagerRegistry $doctrine, Security $security, UserPasswordEncoderInterface $passwordEncoder): Response
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
        	$user->setPassword($passwordEncoder->encodePassword($user, $user->getPassword()));
            $userRepository->add($user, true);

            return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('user/edit.html.twig', [
            'user' => $user,
            'form' => $form,
        ]);
    }

    /**
     * @Route("/{id}", name="app_user_delete", methods={"POST"})
     */
    public function delete(Request $request, User $user, UserRepository $userRepository, ManagerRegistry $doctrine, Security $security): Response
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('index', [], Response::HTTP_SEE_OTHER);
        }

        if ($this->isCsrfTokenValid('delete'.$user->getId(), $request->request->get('_token'))) {
            $userRepository->remove($user, true);
            $entityManager = $doctrine->getManager();
            $userPlatform = new UserPlatform();
            $entityManager->remove($userPlatform);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
    }
}
