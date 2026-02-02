<?php

namespace App\Controller;

use App\Entity\BookmarkCategory;
use App\Form\BookmarkCategoryType;
use App\Repository\BookmarkCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/bookmark-categor')]
class BookmarkCategoryController extends AbstractController
{
    #[Route('ies/', name: 'app_bookmark_category_index', methods: ['GET'])]
    public function index(BookmarkCategoryRepository $bookmarkCategoryRepository): Response
    {
        return $this->render('bookmark_category/index.html.twig', [
            'bookmark_categories' => $bookmarkCategoryRepository->findAll(),
        ]);
    }

    #[Route('y/new', name: 'app_bookmark_category_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $bookmarkCategory = new BookmarkCategory();
        $form = $this->createForm(BookmarkCategoryType::class, $bookmarkCategory);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($bookmarkCategory);
            $entityManager->flush();

            return $this->redirectToRoute('app_bookmark_category_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('bookmark_category/new.html.twig', [
            'bookmark_category' => $bookmarkCategory,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_bookmark_category_show', methods: ['GET'])]
    public function show(BookmarkCategory $bookmarkCategory): Response
    {
        return $this->render('bookmark_category/show.html.twig', [
            'bookmark_category' => $bookmarkCategory,
        ]);
    }

    #[Route('y/{id}/edit', name: 'app_bookmark_category_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, BookmarkCategory $bookmarkCategory, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(BookmarkCategoryType::class, $bookmarkCategory);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_bookmark_category_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('bookmark_category/edit.html.twig', [
            'bookmark_category' => $bookmarkCategory,
            'form' => $form,
        ]);
    }

    #[Route('y/{id}', name: 'app_bookmark_category_delete', methods: ['POST'])]
    public function delete(Request $request, BookmarkCategory $bookmarkCategory, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$bookmarkCategory->getId(), $request->request->get('_token'))) {
            $entityManager->remove($bookmarkCategory);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_bookmark_category_index', [], Response::HTTP_SEE_OTHER);
    }
}
