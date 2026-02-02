<?php

namespace App\Repository;

use App\Entity\TabArea;
use App\Service\DataTableService;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\Request;

/**
 * @extends ServiceEntityRepository<TabArea>
 *
 * @method TabArea|null find($id, $lockMode = null, $lockVersion = null)
 * @method TabArea|null findOneBy(array $criteria, array $orderBy = null)
 * @method TabArea[]    findAll()
 * @method TabArea[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TabAreaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TabArea::class);
    }

    /**
     * Find Entries for the Prime VUE DataTable
     * @return TabArea[] Returns an array of General objects
     * @throws QueryException
     * @throws \JsonException
     */
    public function findByDataTableService(Request $requestUri, DataTableService $dataTableService, array $params): array
    {
        $uri = urldecode($requestUri->getRequestUri());
        $tableShort = "tA";
        $globalFilter = [
            "$tableShort.designation", "$tableShort.comment",

        ];

        // wurden Parameter mitgegeben?
        if ($uri && str_contains($uri, '?') && !str_contains($uri, '?{}')) {
            $service = $dataTableService;

            $service->explodeParams($uri, $globalFilter, true);

            // Begrenzung der Ausgabe
            $sql = $this->createQueryBuilder($tableShort)
                ->addCriteria($service->generateFilter());
            
            // Zusammenfügen der Order By Anweisung
            if (count($service->orderBy) > 0) {
                foreach ($service->orderBy as $order) {
                    $sql->addCriteria($order);
                }
            }

            $filterItems = $sql
                ->setFirstResult($service->offset)
                ->setMaxResults($service->limit)
                ->getQuery()
                ->getResult();

            // Ohne Begrenzung (für die Paginate)
            $maxItems = $this->createQueryBuilder($tableShort)
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
            ->orderBy("$tableShort.sorting", Criteria::ASC)
            ->getQuery()
            ->getResult();

        return [
            "items" => $allItems,
            "filterCount" => count($allItems),
            "totalCount" => count($allItems)
        ];
    }
}
