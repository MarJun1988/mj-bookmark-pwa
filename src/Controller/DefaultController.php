<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DefaultController extends AbstractController
{
    #[Route('/', name: 'app_default')]
    public function index(): Response
    {
        return $this->redirectToRoute('app_vue_js', ['route' => 'dashboard']);
    }

    #[Route('/{route}', name: 'app_vue_js', requirements: ['route' => '^(?!.*_wdt|_profiler|api).+'])]
    public function indexToVueJS(): Response
    {
        return $this->render('default/index.html.twig');
    }
}
