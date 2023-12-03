<?php

namespace App\Repository;

use App\Entity\UserPlatform;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserPlatform>
 *
 * @method UserPlatform|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserPlatform|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserPlatform[]    findAll()
 * @method UserPlatform[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserPlatformRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserPlatform::class);
    }

    public function add(UserPlatform $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(UserPlatform $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function myOwnToken(String $str)
    {
        return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
    }

//    /**
//     * @return UserPlatform[] Returns an array of UserPlatform objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('u')
//            ->andWhere('u.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('u.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?UserPlatform
//    {
//        return $this->createQueryBuilder('u')
//            ->andWhere('u.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
