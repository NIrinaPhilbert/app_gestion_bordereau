<?php
  
namespace App\Controller;
  
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;
  
class SpaController extends AbstractController
{
    /*
    * Pour récupération des authorisations de l'utilisateur connecté
    */
    private $security ;
    private $user_authorisation ;
    public function __construct(Security $security)
    {
        $this->security = $security ;
        $user = $this->security->getUser() ;
        if($user)
        {
            $this->user_authorisation = json_decode($user->getAuthorisation()) ;
        }
    }

    /**
     * @Route("/{reactRouting}", name="app_home", requirements={"reactRouting"="^(?!api).+"}, defaults={"reactRouting": null})
     */
    public function index(Security $security)
    {
        if (null === $security->getUser()) {
            return $this->redirectToRoute('app_login', [], Response::HTTP_SEE_OTHER);
        }
        
        $data = array(
            'user_authorisation' => $this->user_authorisation,
            'mail'=>$security->getUser()->getEmail(),
            'fname'=>$security->getUser()->retrieveUserPlatform()->getFirstname(),
            'lname'=>$security->getUser()->retrieveUserPlatform()->getLastname(),
            'quart'=>(is_null($security->getUser()->retrieveUserPlatform()->getQuartier()) ? 0 : $security->getUser()->retrieveUserPlatform()->getQuartier()->getNumero()),
            'access'=>(in_array("ROLE_ADMIN", $security->getUser()->getRoles())) ? "admin" : ((in_array("ROLE_CONSULTANT", $security->getUser()->getRoles())) ? "consultant" : "user")
        );
        /*
        echo '<pre>' ;
        print_r($data) ;
        echo '</pre>' ;
        exit() ;
        */
        return $this->render('spa/admin/index.html.twig', array('data' => $data));
    }
}