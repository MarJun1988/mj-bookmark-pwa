<?php

namespace App\Repository;

use App\Entity\Bookmark;
use App\Service\DataTableService;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\Request;

/**
 * @extends ServiceEntityRepository<Bookmark>
 *
 * @method Bookmark|null find($id, $lockMode = null, $lockVersion = null)
 * @method Bookmark|null findOneBy(array $criteria, array $orderBy = null)
 * @method Bookmark[]    findAll()
 * @method Bookmark[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BookmarkRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Bookmark::class);
    }
    /**
     *
     * Find Entries for the Prime VUE DataTable
     * @return Bookmark[] Returns an array of General objects
     * @throws QueryException
     * @throws \JsonException
     */
    public function findByDataTableService(Request $requestUri, DataTableService $dataTableService, array $params): array
    {
        $uri = urldecode($requestUri->getRequestUri());
        $tableShort = "b";
        $joinTableOne = "bC";
        $joinTableTwo = "tA";
        $globalFilter = [
            "$tableShort.hyperlinkUrl", "$tableShort.hyperlinkDescription","$tableShort.comment",
            "$tableShort.tabArea", "$tableShort.bookmarkCategory",
            "$joinTableOne.designation", "$joinTableOne.comment",
            "$joinTableTwo.designation", "$joinTableTwo.comment"
        ];

        // wurden Parameter mitgegeben?
        if ($uri && str_contains($uri, '?') && !str_contains($uri, '?{}')) {
            $service = $dataTableService;

            $service->explodeParams($uri, $globalFilter, true);

//            dd($service->generateFilter());

            // Begrenzung der Ausgabe
            $sql = $this->createQueryBuilder($tableShort)
                ->leftJoin("$tableShort.bookmarkCategory", $joinTableOne)
                ->leftJoin("$tableShort.tabArea", $joinTableTwo)
                ->addCriteria($service->generateFilter());

            // Zusammenfügen der Order By Anweisung

            if (count($service->orderBy) > 0) {
                foreach ($service->orderBy as $order) {
                    $sql->addCriteria($order);
                }
            }
//
//            dd($sql
//                ->setFirstResult($service->offset)
//                ->setMaxResults($service->limit)
//                ->getQuery());

            $filterItems = $sql
                ->setFirstResult($service->offset)
                ->setMaxResults($service->limit)
                ->getQuery()
                ->getResult();

            // Ohne Begrenzung (für die Paginate)
            $maxItems = $this->createQueryBuilder($tableShort)
                ->leftJoin("$tableShort.bookmarkCategory", $joinTableOne)
                ->leftJoin("$tableShort.tabArea", $joinTableTwo)
                ->addCriteria($service->generateFilter())
                ->getQuery()
                ->getResult();

            return [
                "items" => $filterItems,
                "filterCount" => count($filterItems),
                "totalCount" => count($maxItems)
            ];
        }

        // Ohne Filter und Begrenzung
        $allItems = $this->createQueryBuilder($tableShort)
            ->leftJoin("$tableShort.bookmarkCategory", $joinTableOne)
            ->leftJoin("$tableShort.tabArea", $joinTableTwo)
            ->orderBy("$joinTableTwo.sorting", Criteria::ASC)
            ->addOrderBy("$joinTableOne.sorting", Criteria::ASC)
            ->addOrderBy("$tableShort.sorting", Criteria::ASC)
            ->getQuery()
            ->getResult();

        return [
            "items" => $allItems,
            "filterCount" => count($allItems),
            "totalCount" => count($allItems)
        ];
    }
}
