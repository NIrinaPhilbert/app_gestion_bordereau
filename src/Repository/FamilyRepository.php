<?php

namespace App\Repository;

use App\Entity\Family;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Family>
 *
 * @method Family|null find($id, $lockMode = null, $lockVersion = null)
 * @method Family|null findOneBy(array $criteria, array $orderBy = null)
 * @method Family[]    findAll()
 * @method Family[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FamilyRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Family::class);
    }

    public function add(Family $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Family $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getDataBySearch($type, $search)
    {
        return $this->createQueryBuilder('f')
            ->andWhere("f.".$type." = '".$search."'")
            ->getQuery()
            ->getResult()
        ;
    }
    public function getFamilyNotIn($_tiFamilyId)
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.id NOT IN (:notfamily) AND f.statut = :etat')
            ->setParameter("notfamily", $_tiFamilyId)
            ->setParameter("etat", "1")
            ->getQuery()
            ->getResult()
        ;
        
    }
    public function getFamilyNotInWithQuartier($_tiFamilyId, $_oQuartier)
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.id NOT IN (:notfamily) AND f.statut = :etat AND f.Quartier = :QuartierSearch')
            ->setParameter("notfamily", $_tiFamilyId)
            ->setParameter("etat", "1")
            ->setParameter("QuartierSearch", $_oQuartier)
            ->getQuery()
            ->getResult()
        ;
    }
}
