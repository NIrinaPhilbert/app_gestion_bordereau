<?php

namespace App\Form;

use App\Entity\UserPlatform;
use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserPlatformType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
    	$tUserStatusKeys = explode('|', $_ENV['USER_STATUS']);
    	$tUserStatusValues = explode('|', $_ENV['USER_STATUS']);
    	$tUserStatus = array_combine($tUserStatusKeys, $tUserStatusValues);
        $builder
            // ->add('email', EntityType::class , ['class' => User::class , 'choice_label' => 'email', "attr" => ["class" => "form-control border border-primary"], 'label' => 'Email'])
            ->add('firstname', TextType::class, ['attr' => ['class' => 'form-control border border-primary']])
            ->add('lastname', TextType::class, ['attr' => ['class' => 'form-control border border-primary']])
            ->add('address', TextareaType::class, ['attr' => ['class' => 'form-control border border-primary']])
            ->add('statut', ChoiceType::class, [
                'choices'  => $tUserStatus,
                'attr' => ['class' => 'form-control border border-primary']
            ])
            ->add('email', EmailType::class, ['mapped' => false, 'attr' => ['class' => 'form-control border border-primary']])
            ->add('password', PasswordType::class, ['mapped' => false, 'attr' => ['class' => 'form-control border border-primary']])
            // ->add('createdAt')
            // ->add('subscriptions')
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => UserPlatform::class,
        ]);
    }
}
