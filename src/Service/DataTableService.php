<?php

declare(strict_types=1);

namespace App\Service;

use Doctrine\Common\Collections\Criteria;
use JsonException;

/**
 * This Service Generate the Doctrine Order BY and Where Question
 *
 *
 */
class DataTableService
{

    public int $offset = 0;
    public int|null $limit = null;

    /**
     * @var Criteria[]
     */
    public array $orderBy = [];
    /**
     * @var Criteria[]
     */
    public array $where = [];
    /**
     * @var string[]
     */
    public array $globalFilter = [];


    public Criteria $criteria;

    /**
     * Explode the URI and Save the Globalfilter
     * @param string $uri The request URI
     * @param string[] $globalFilter array $globalFilter   The Fields for the Global Filter
     * @return void
     * @throws JsonException
     */
    public function explodeParams(string $uri, array $globalFilter): void
    {
        $explode = explode('?', $uri);
        $this->globalFilter = $globalFilter;

        if (count($explode) > 1) {

            $request = json_decode($explode[1], true, 512, JSON_THROW_ON_ERROR);
            if (count($request) > 0) {
                $this->offset = $request['offset'] ? (int)$request['offset'] : 0;
                $this->limit = $request['limit'] ? (int)$request['limit'] : null;

                $this->where = $request['filter'];

                $this->generateFilter();

                // Order By
                if (count($request['order'])) {
                    $this->generateOrderBy($request['order']);
                }
            }
        }
    }


    /**
     * The Function generate the Where Section
     *
     * @param bool $showAllEntries Show all Entries
     * @return Criteria
     */
    public function generateFilter(bool $showAllEntries = false): Criteria
    {
        $criteria = new Criteria();
        $expressionBuilder = Criteria::expr();
        $allColumns = [];

        if (count($this->where) !== 0) {
            foreach ($this->where as $index => $filter) {
                $column = $filter['column'];
                $text = is_int($filter['text']) ? (int)$filter['text'] : (string)$filter['text'];
                $matchMode = $filter['matchMode'];

                // Wenn Datum, dann nur Datum ohne Uhrzeit
                if (
                    $matchMode === "dateIs" ||
                    $matchMode === "dateIsNot" ||
                    $matchMode === "dateBefore" ||
                    $matchMode === "dateAfter"
                ) {
                    $split = explode("T", $text);
                    $text = $split[0];
                }

                // Globale Suche
                if ($column === "global") {
                    foreach ($this->globalFilter as $key => $item) {
                        if ($key === 0) {
                            $criteria->where($expressionBuilder->contains($item, $text));
                        } else {
                            $criteria->orWhere($expressionBuilder->contains($item, $text));
                        }
                    }
                } else {
                    if ($index === 0) {
                        match ($matchMode) {
                            "contains" => $criteria->where($expressionBuilder->contains($column, $text)),
                            "startsWith", "dateIs" => $criteria->where($expressionBuilder->startsWith($column, $text)),
                            "notContains", "notEquals", "dateIsNot" => $criteria->where($expressionBuilder->neq($column, $text)),
                            "endsWith" => $criteria->where($expressionBuilder->endsWith($column, $text)),
                            "equals" => $criteria->where($expressionBuilder->eq($column, $text)),
                            "lt", "dateBefore" => $criteria->where($expressionBuilder->lt($column, $text)),
                            "lte" => $criteria->where($expressionBuilder->lte($column, $text)),
                            "gt", "dateAfter" => $criteria->where($expressionBuilder->gt($column, $text)),
                            "gte" => $criteria->where($expressionBuilder->gte($column, $text)),
                            default => ""
                        };
                    } else if (in_array($column, $allColumns)) {
                        match ($matchMode) {
                            "contains", "dateIs" => $criteria->orWhere($expressionBuilder->contains($column, $text)),
                            "startsWith" => $criteria->orWhere($expressionBuilder->startsWith($column, $text)),
                            "notContains", "notEquals", "dateIsNot" => $criteria->orWhere($expressionBuilder->neq($column, $text)),
                            "endsWith" => $criteria->orWhere($expressionBuilder->endsWith($column, $text)),
                            "equals" => $criteria->orWhere($expressionBuilder->eq($column, $text)),
                            "lt", "dateBefore" => $criteria->orWhere($expressionBuilder->lt($column, $text)),
                            "lte" => $criteria->orWhere($expressionBuilder->lte($column, $text)),
                            "gt", "dateAfter" => $criteria->orWhere($expressionBuilder->gt($column, $text)),
                            "gte" => $criteria->orWhere($expressionBuilder->gte($column, $text)),
                            default => ""
                        };
                    } else {
                        match ($matchMode) {
                            "contains", "dateIs" => $criteria->andWhere($expressionBuilder->contains($column, $text)),
                            "startsWith" => $criteria->andWhere($expressionBuilder->startsWith($column, $text)),
                            "notContains", "notEquals", "dateIsNot" => $criteria->andWhere($expressionBuilder->neq($column, $text)),
                            "endsWith" => $criteria->andWhere($expressionBuilder->endsWith($column, $text)),
                            "equals" => $criteria->andWhere($expressionBuilder->eq($column, $text)),
                            "lt", "dateBefore" => $criteria->andWhere($expressionBuilder->lt($column, $text)),
                            "lte" => $criteria->andWhere($expressionBuilder->lte($column, $text)),
                            "gt", "dateAfter" => $criteria->andWhere($expressionBuilder->gt($column, $text)),
                            "gte" => $criteria->andWhere($expressionBuilder->gte($column, $text)),
                            default => ""
                        };
                    }
                }

                # Für Multiselect Abfragen (eine Spalte doppelt)
                $allColumns[] = $filter['column'];
            }
        }

        return $criteria;
    }

    /**
     * The Function generate the Order BY Section
     *
     * @param string[] $orderBy
     * @return void
     */
    public function generateOrderBy(array $orderBy): void
    {
        foreach ($orderBy as $order) {
            $orderExplode = str_contains(';', $order) ? explode(';', $order) : explode('&', $order);
            if (count($orderExplode) === 1) {
                $orderExplode = str_contains(';', $order) ? explode('&', $order) : explode(';', $order);
            }
            if (count($orderExplode) > 1) {
                $newOrder = new Criteria();
                $this->orderBy[] = $newOrder->orderBy([$orderExplode[0] => $orderExplode[1] === 'DESC' ? Criteria::DESC : Criteria::ASC]);
            }
        }
    }

    /**
     * The Function generate the Where Section
     *
     * @param bool $showAllEntries Show all Entries
     * @return Criteria
     */
    public function generateFilterShowAllEntries(bool $showAllEntries = false): Criteria
    {
        $criteria = new Criteria();
        $expressionBuilder = Criteria::expr();

        // Anzeigen der Verstecken-Einträge
        if (!$showAllEntries) {
            $criteria->where($expressionBuilder->contains('isVisibility', false));
        }

        return $criteria;
    }

    /**
     * The Function generate the Where Section
     *
     * @param bool $showOnlyMyDepartment Show all Entries
     * @param string $departmentUuid
     * @return Criteria
     */
    public function generateFilterShowOnlyMyDepartmentEntries(string $departmentUuid, bool $showOnlyMyDepartment = true,): Criteria
    {
        $criteria = new Criteria();
        $expressionBuilder = Criteria::expr();

        // Anzeigen der Verstecken-Einträge
        if ($showOnlyMyDepartment) {
            $criteria->where($expressionBuilder->eq('department', $departmentUuid));
        }

        return $criteria;
    }
}