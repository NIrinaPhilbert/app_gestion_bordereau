<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserPlatform;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
// use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @Route("/api", name="api_")
 */
class SigninController extends AbstractController
{
    /**
     * @Route("/signin/check", name="signin_check", methods={"POST"})
     */
    public function check(Request $request, UserPasswordEncoderInterface $encoder, ManagerRegistry $doctrine): Response
    {
        $email = $request->request->get('email');
        $plainPassword = $request->request->get('password');
        $entityManager = $doctrine->getManager();
        $user = $entityManager->getRepository(User::class)->findOneBy(array('email'=>$email));
        $return = array();
        if (null === $user) {
            $return = array('success'=>false, 'msg'=>'No data found for this email.');
        } else {
            if (!$encoder->isPasswordValid($user, $plainPassword)) {
                $return = array('success'=>false, 'msg'=>'Verify your informations.');
            } else {
                $userPlatform = $entityManager->getRepository(UserPlatform::class)->findOneBy(array("email"=>$user->getId()));
                $data = array(
                    'email'=>$user->getEmail(),
                    'firstname'=>$userPlatform->getFirstname(),
                    'lastname'=>$userPlatform->getLastname()
                );
                $return = array('success'=>true, 'msg'=>'', 'session'=>$data);
            }
        }
        // $encoded = $encoder->encodePassword($user, $request->request->get('password'));
        return $this->json($return);
    }
}
