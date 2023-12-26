<?php

namespace App\Repository;

use App\Entity\DetailsBordereau;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DetailsBordereau>
 *
 * @method DetailsBordereau|null find($id, $lockMode = null, $lockVersion = null)
 * @method DetailsBordereau|null findOneBy(array $criteria, array $orderBy = null)
 * @method DetailsBordereau[]    findAll()
 * @method DetailsBordereau[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DetailsBordereauRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DetailsBordereau::class);
    }

    public function add(DetailsBordereau $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(DetailsBordereau $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getLastDetails($family)
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.family = :param')
            ->setParameter('param', $family)
            ->orderBy('d.id', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findAllDistincts()
    {
        return $this->createQueryBuilder('d')
            ->select('DISTINCT(d.taonaHasina) as yearHasina')
            ->orderBy('d.taonaHasina', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    public function findDistinctsYearByQuartier($_oQuartier)
    {
        return $this->createQueryBuilder('d')
            ->select('DISTINCT(d.taonaHasina) as yearHasina')
            ->join('d.bordereau', 'b')
            ->where('b.quartier = :QuartierSearch')
            ->setParameter("QuartierSearch", $_oQuartier)
            ->orderBy('d.taonaHasina', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    public function getListBorderauxEntreDeuxDates($_zDateDebut, $_zDateFin, $_zAnnee = "")
    {
        
        $zWhere = ($_zAnnee == "") ? 'b.daty BETWEEN :start AND :end AND b.valid = :validtruefalse AND f.statut = :etat' : 'b.daty BETWEEN :start AND :end AND d.taonaHasina = :taona AND b.valid = :validtruefalse AND f.statut = :etat' ;
        $oQueryListBorderauxEntreDeuxDates = $this->createQueryBuilder('d') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->join('d.bordereau', 'b') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->join('d.family', 'f') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->where($zWhere) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('start', $_zDateDebut) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('end', $_zDateFin) ;
        if($_zAnnee != "")
        {
            $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('taona', $_zAnnee) ;
        }
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('validtruefalse', true) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('etat', "1") ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->getQuery() ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->getResult() ;

        return $oQueryListBorderauxEntreDeuxDates;
    }
    public function getListParticipantsEntreDeuxDates($_zDateDebut, $_zDateFin, $_zAnnee = "")
    {
        
        $zWhere = ($_zAnnee == "") ? 'b.daty BETWEEN :start AND :end AND b.valid = :validtruefalse AND f.statut = :etat' : 'b.daty BETWEEN :start AND :end AND d.taonaHasina = :taona AND b.valid = :validtruefalse AND f.statut = :etat' ;
        $oQueryListBorderauxEntreDeuxDates = $this->createQueryBuilder('d') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->join('d.bordereau', 'b') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->join('d.family', 'f') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->where($zWhere) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('start', $_zDateDebut) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('end', $_zDateFin) ;
        if($_zAnnee != "")
        {
            $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('taona', $_zAnnee) ;
        }
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('validtruefalse', true) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('etat', "1") ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->getQuery() ;
        //$oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->groupBy('d.family')->getQuery() ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->getResult() ;

        return $oQueryListBorderauxEntreDeuxDates;
    }


    public function getListDistinctParticipantsEntreDeuxDates($_zDateDebut, $_zDateFin, $_zAnnee = "")
    {
        
        $zWhere = ($_zAnnee == "") ? 'b.daty BETWEEN :start AND :end AND b.valid = :validtruefalse AND f.statut = :etat' : 'b.daty BETWEEN :start AND :end AND d.taonaHasina = :taona AND b.valid = :validtruefalse AND f.statut = :etat' ;
        $oQueryListBorderauxEntreDeuxDates = $this->createQueryBuilder('d') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->join('d.bordereau', 'b') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->join('d.family', 'f') ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->where($zWhere) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('start', $_zDateDebut) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('end', $_zDateFin) ;
        if($_zAnnee != "")
        {
            $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('taona', $_zAnnee) ;
        }
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('validtruefalse', true) ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->setParameter('etat', "1") ;
        //$oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->getQuery() ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->groupBy('d.family')->getQuery() ;
        $oQueryListBorderauxEntreDeuxDates = $oQueryListBorderauxEntreDeuxDates->getResult() ;

        return $oQueryListBorderauxEntreDeuxDates;
    }


    // public function findParticipantsRapport($quartier)
    // {
    //     return $this->createQueryBuilder('ps')
    //         ->select('SUM(ps.quantity * ps.prix) as sumOfSale')
    //         ->andWhere('ps.product = :prod')
    //         ->andWhere("ps.date_entry LIKE '%".$daty."-%'")
    //         ->setParameter('prod', $product)
    //         ->getQuery()
    //         ->getSingleScalarResult()
    //     ;
    // }

//    /**
//     * @return DetailsBordereau[] Returns an array of DetailsBordereau objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('d')
//            ->andWhere('d.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('d.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?DetailsBordereau
//    {
//        return $this->createQueryBuilder('d')
//            ->andWhere('d.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
