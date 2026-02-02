<?php
declare(strict_types=1);

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CheckEntityService
{

    public function __construct(
        public ValidatorInterface     $validator,
        public EntityManagerInterface $entityManager,
        public TranslatorInterface    $translator,
        public SerializerInterface    $serializer
    )
    {
    }

    public function validation($entity, $groups = ''): Response
    {
        $this->entityManager->persist($entity);
        $result = $this->validator->validate($entity);
        // Für die Validation Fehler
        $errors = [];

        // Gibt es Fehler bei der Validierung?
        if ($result->count() === 0) {
            $this->entityManager->flush();
        } else {
            foreach ($result as $item) {
                $errors[] = [
                    'field' => $item->getPropertyPath(),
                    'message' => $item->getMessage()
                ];
            }
            // Ausgabe der Fehler Meldung
            return new JsonResponse([
                'status' => 'error',
                'summary' => $this->translator->trans('entityMessage.failed'),
                'message' => $this->translator->trans('entityMessage.failed'),
                'errors' => $errors,
                'item' => null
            ], Response::HTTP_BAD_REQUEST);
        }

        // Ausgabe der Meldung
        return new JsonResponse([
            'status' => 'success',
            'message' => $this->translator->trans('entityMessage.success'),
            'errors' => $errors,
            'item' => $this->serializer->normalize($entity, null, [AbstractNormalizer::GROUPS => $groups])
        ], Response::HTTP_OK);
    }

    public function validationDelete($entity, $groups = ''): Response
    {
//        dd($entity->hasRelations());

        if ($entity && !$entity->hasRelations()) {
            $this->entityManager->remove($entity);
            $this->entityManager->flush();

            // Ausgabe der Meldung
            return new JsonResponse([
                'status' => 'success',
                'message' => $this->translator->trans('entityMessage.success'),
                'errors' => [],
                'item' => $this->serializer->normalize($entity, null, [AbstractNormalizer::GROUPS => $groups])
            ], Response::HTTP_OK);
        }

        if ($entity) {
            // Ausgabe der Meldung
            return new JsonResponse([
                'status' => 'warning',
                'message' => $this->translator->trans('entityMessage.relationsFound'),
                'errors' => [],
                'item' => $this->serializer->normalize($entity, null, [AbstractNormalizer::GROUPS => $groups])
            ], Response::HTTP_CONFLICT);
        }

        // Ausgabe der Fehler Meldung, kein Eintrag mit der ID gefunden
        return new JsonResponse([
            'status' => 'error',
            'message' => $this->translator->trans('entityMessage.notFound'),
            'errors' => [],
            'item' => null
        ], Response::HTTP_CONFLICT);
    }
}