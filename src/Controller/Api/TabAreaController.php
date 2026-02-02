<?php
declare(strict_types=1);
namespace App\Controller\Api;

use App\Entity\TabArea;
use App\Repository\TabAreaRepository;
use App\Service\CheckEntityService;
use App\Service\DataTableService;
use Doctrine\Common\Collections\Criteria;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/tab-area/', name: 'api_tab_area_')]
class TabAreaController extends AbstractController
{
    public function __construct(
        public CheckEntityService            $checkEntity,
        public DataTableService              $dataTableService,
        private readonly SerializerInterface $serializer,
        private readonly TabAreaRepository   $tabAreaRepository)
    {
    }

    /**
     * List all Entries from the Database,
     * Optimize for PrimeVue Datatable
     * with Filter, Search, Paginate function
     *
     * @param Request $request
     * @return Response
     * @throws JsonException
     */
    #[Route('get-for-datatable', name: 'get_for_datatable', methods: ['GET'])]
    public function getForDatatable(Request $request): Response
    {
        // Auslesen aller Einträge
        $items = $this->tabAreaRepository->findByDataTableService($request, $this->dataTableService, []);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items['items'],
            'json',
            ['groups' => ['tabArea:datatable', 'bookmarkCategory:datatable' ,'bookmark:minimal', 'timestamp:datatable'], AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true,
                AbstractNormalizer::CIRCULAR_REFERENCE_LIMIT => 2]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'items' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR),
            'filterCount' => $items['filterCount'],
            'totalCount' => $items['totalCount']
        ]);
    }

    /**
     * List all Entries from the Database,
     * Optimize for thr Dashboard
     *
     * @param Request $request
     * @return Response
     * @throws JsonException
     */
    #[Route('get-for-dashboard', name: 'get_for_dashboard', methods: ['GET'])]
    public function getForDashboard(Request $request): Response
    {
        // Auslesen aller Einträge
        $items = $this->tabAreaRepository->findBy([], [
            'sorting' => Criteria::ASC,
//            'bookmarkCategories' => Criteria::ASC,
//            'bookmarks' => Criteria::ASC,
        ]);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['tabArea:dashboard', 'bookmarkCategory:dashboard' ,'bookmark:dashboard'], AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true,
                AbstractNormalizer::CIRCULAR_REFERENCE_LIMIT => 2]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'items' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR)
        ]);
    }

    /**
     * List all Entries from the Database,
     * Optimize for PrimeVue Dropdown
     *
     * @param Request $request
     * @param string $id
     * @return Response
     * @throws JsonException
     */
    #[Route('get-for-dropdown/{id}', name: 'get_for_dropdown', methods: ['GET'])]
    public function getForDropdown(Request $request, string $id = ""): Response
    {
        $criteria = [];
        if ($request->get('id') && $request->get('id') !== "null"){
            $criteria = [
                "id" =>$request->get('id')
            ];
        }

        // Auslesen aller Einträge
        $items = $this->tabAreaRepository->findBy($criteria, ['sorting' => Criteria::ASC]);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['tabArea:dropdown']]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'items' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR),
            'totalCount' => count($items)
        ]);
    }

    /**
     * Get one Entry by ID
     *
     * @param Request $request
     * @return Response
     * @throws JsonException
     */
    #[Route('get-by-id/{id}', name: 'get_by_id', methods: ['GET'])]
    public function getById(Request $request): Response
    {
        // Auslesen aller Einträge
        $items = $this->tabAreaRepository->find($request->get('id'));
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['tabArea:item']]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'item' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR),
            'totalCount' => $items ? 1: 0
        ]);
    }

    /**
     * Get the Last Sorting Value
     *
     * @param Request $request
     * @return Response
     * @throws JsonException
     */
    #[Route('get-last-sorting/{id}', name: 'get_last_sorting', methods: ['GET'])]
    public function getLastSorting(Request $request): Response
    {
        // Auslesen aller Einträge
        $items = $this->tabAreaRepository->findOneBy([],['sorting' => Criteria::DESC]);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['tabArea:minimal']]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'item' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR),
            'totalCount' => $items ? 1: 0
        ]);
    }

    /**
     * Create a new Entry to save in the Database
     *
     * @param Request $request
     * @return Response
     */
    #[Route('new', name: 'new', methods: ['POST'])]
    public function new(Request $request): Response
    {
        // Übermittelte Daten
        $requestEntry = $request->toArray();

        // Anlegen eines neuen Eintrages
        $item = (new TabArea())
            ->setDesignation(trim((string)$requestEntry['designation']))
            ->setSorting((int)$requestEntry['sorting'])
            ->setComment(trim((string)$requestEntry['comment']));

        // Prüfen von doppelten Einträgen sowie leeren Feldern, ...
        return $this->checkEntity->validation($item, ['tabArea:datatable']);
    }

    /**
     * Edit one Entry to Update in the Database
     *
     * @param Request $request
     * @return Response
     */
    #[Route('edit/{id}', name: 'edit', methods: ['PUT'])]
    public function edit(Request $request): Response
    {
        // Suchen des Eintrages in der Datenbank
        $item = $this->tabAreaRepository->find($request->get('id'));
        // Übermittelte Daten
        $requestEntry = $request->toArray();

        if ($item) {
            $item
                ->setDesignation(trim((string)$requestEntry['designation']))
                ->setSorting((int)$requestEntry['sorting'])
                ->setComment(trim((string)$requestEntry['comment']));
        }

        // Prüfen von doppelten Einträgen sowie leeren Feldern, ...
        return $this->checkEntity->validation($item, ['tabArea:datatable']);
    }

    /**
     * Delete the Entry with ID in the Database
     *
     * @param Request $request
     * @return Response
     */
    #[Route('delete/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Request $request): Response
    {
        // Suchen des Eintrages in der Datenbank
        $item = $this->tabAreaRepository->find($request->get('id'));
        // Prüfen, ob der Eintrag vorhanden ist, ...
        return $this->checkEntity->validationDelete($item, ['tabArea:datatable']);
    }
}
