<?php
declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Bookmark;
use App\Repository\BookmarkCategoryRepository;
use App\Repository\BookmarkRepository;
use App\Repository\TabAreaRepository;
use App\Service\CheckEntityService;
use App\Service\DataTableService;
use Doctrine\Common\Collections\Criteria;
use DOMDocument;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/bookmark/', name: 'api_bookmark_')]
class BookmarkController extends AbstractController
{
    public function __construct(
        public CheckEntityService                   $checkEntity,
        public DataTableService                     $dataTableService,
        private readonly SerializerInterface        $serializer,
        private readonly TabAreaRepository          $tabAreaRepository,
        private readonly BookmarkCategoryRepository $bookmarkCategoryRepository,
        private readonly BookmarkRepository         $bookmarkRepository
    )
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
    public function getForDatatables(Request $request): Response
    {
        // Auslesen aller Einträge
        $items = $this->bookmarkRepository->findByDataTableService($request, $this->dataTableService, []);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items['items'],
            'json',
            ['groups' => ['bookmark:datatable', 'bookmarkCategory:minimal', 'tabArea:minimal', 'timestamp:datatable'], AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true,
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
        if ($request->get('id') && $request->get('id') !== "null") {
            $criteria = [
                "id" => $request->get('id')
            ];
        }

        // Auslesen aller Einträge
        $items = $this->bookmarkRepository->findBy($criteria, ['sorting' => Criteria::ASC]);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['bookmark:dropdown']]
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
        $items = $this->bookmarkRepository->find($request->get('id'));
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['bookmark:item', 'bookmarkCategory:minimal', 'tabArea:minimal'], AbstractObjectNormalizer::ENABLE_MAX_DEPTH => true,
                AbstractNormalizer::CIRCULAR_REFERENCE_LIMIT => 2]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'item' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR),
            'totalCount' => $items ? 1 : 0
        ]);
    }

    /**
     * Get the Last Sorting Value
     *
     * @param Request $request
     * @return Response
     * @throws JsonException
     */
    #[Route('get-last-sorting/{idBookmarkCategory}', name: 'get_last_sorting', methods: ['GET'])]
    public function getLastSorting(Request $request): Response
    {
        // Auslesen aller Einträge
        $items = $this->bookmarkRepository->findOneBy(['bookmarkCategory' => $request->get('idBookmarkCategory')], ['sorting' => Criteria::DESC]);
        // Objekte Konvertieren
        $serialize = $this->serializer->serialize(
            $items,
            'json',
            ['groups' => ['bookmark:minimal']]
        );
        // Ausgabe als JSON
        return new JsonResponse([
            'item' => json_decode($serialize, false, 512, JSON_THROW_ON_ERROR),
            'totalCount' => $items ? 1 : 0
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
        $item = (new Bookmark())
            ->setTabArea($this->tabAreaRepository->find(trim((string)$requestEntry['tabArea']['id'])))
            ->setBookmarkCategory($this->bookmarkCategoryRepository->find(trim((string)$requestEntry['bookmarkCategory']['id'])))
            ->setHyperlinkUrl(trim((string)$requestEntry['hyperlinkUrl']))
            ->setHyperlinkDescription(trim((string)$requestEntry['hyperlinkDescription']))
            ->setSorting((int)$requestEntry['sorting'])
            ->setComment(trim((string)$requestEntry['comment']));

        // Prüfen von doppelten Einträgen sowie leeren Feldern, ...
        return $this->checkEntity->validation($item, ['bookmark:datatable']);
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
        $item = $this->bookmarkRepository->find($request->get('id'));
        // Übermittelte Daten
        $requestEntry = $request->toArray();

        if ($item) {
            $item
                ->setTabArea($this->tabAreaRepository->find(trim((string)$requestEntry['tabArea']['id'])))
                ->setBookmarkCategory($this->bookmarkCategoryRepository->find(trim((string)$requestEntry['bookmarkCategory']['id'])))
                ->setHyperlinkUrl(trim((string)$requestEntry['hyperlinkUrl']))
                ->setHyperlinkDescription(trim((string)$requestEntry['hyperlinkDescription']))
                ->setSorting((int)$requestEntry['sorting'])
                ->setComment(trim((string)$requestEntry['comment']));
        }

        // Prüfen von doppelten Einträgen sowie leeren Feldern, ...
        return $this->checkEntity->validation($item, ['bookmark:datatable']);
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
        $item = $this->bookmarkRepository->find($request->get('id'));
        // Prüfen, ob der Eintrag vorhanden ist, ...
        return $this->checkEntity->validationDelete($item, ['bookmark:datatable']);
    }

    /**
     * @param Request $request
     * @return Response
     */
    #[Route('get-site-title', name: 'get_site_title', methods: ['POST'])]
    public function getSiteTitle(Request $request): Response
    {
        $requestEntry = $request->toArray();

        $contextOptions = [
            'ssl' => [
                // 'verify_peer' => false, set to false, if you want to disable SSL cert verification
                'verify_peer' => false,
                // 'verify_peer_name' => false, set to false, if you want to disable SSL hostname verification
                'verify_peer_name' => false,
            ],
        ];
        $context = stream_context_create($contextOptions);

        if ($requestEntry) {
            $html = file_get_contents($requestEntry['url'], false, $context);

            $dom = new DOMDocument;

            @$dom->loadHTML($html);

            $title = $dom->getElementsByTagName('title')[0]->nodeValue;

            return new Response($title);
        }
        return new Response('');

    }


}
