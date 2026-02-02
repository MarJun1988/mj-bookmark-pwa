<?php

namespace App\Test\Controller;

use App\Entity\Bookmark;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BookmarkControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $manager;
    private EntityRepository $repository;
    private string $path = '/bookmark/';

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->manager = static::getContainer()->get('doctrine')->getManager();
        $this->repository = $this->manager->getRepository(Bookmark::class);

        foreach ($this->repository->findAll() as $object) {
            $this->manager->remove($object);
        }

        $this->manager->flush();
    }

    public function testIndex(): void
    {
        $crawler = $this->client->request('GET', $this->path);

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('Bookmark index');

        // Use the $crawler to perform additional assertions e.g.
        // self::assertSame('Some text on the page', $crawler->filter('.p')->first());
    }

    public function testNew(): void
    {
        $this->markTestIncomplete();
        $this->client->request('GET', sprintf('%snew', $this->path));

        self::assertResponseStatusCodeSame(200);

        $this->client->submitForm('Save', [
            'bookmark[hyperlinkUrl]' => 'Testing',
            'bookmark[hyperlinkDescription]' => 'Testing',
            'bookmark[sorting]' => 'Testing',
            'bookmark[comment]' => 'Testing',
            'bookmark[createdAt]' => 'Testing',
            'bookmark[updatedAt]' => 'Testing',
            'bookmark[bookmarkCategory]' => 'Testing',
        ]);

        self::assertResponseRedirects('/sweet/food/');

        self::assertSame(1, $this->getRepository()->count([]));
    }

    public function testShow(): void
    {
        $this->markTestIncomplete();
        $fixture = new Bookmark();
        $fixture->setHyperlinkUrl('My Title');
        $fixture->setHyperlinkDescription('My Title');
        $fixture->setSorting('My Title');
        $fixture->setComment('My Title');
        $fixture->setCreatedAt('My Title');
        $fixture->setUpdatedAt('My Title');
        $fixture->setBookmarkCategory('My Title');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('Bookmark');

        // Use assertions to check that the properties are properly displayed.
    }

    public function testEdit(): void
    {
        $this->markTestIncomplete();
        $fixture = new Bookmark();
        $fixture->setHyperlinkUrl('Value');
        $fixture->setHyperlinkDescription('Value');
        $fixture->setSorting('Value');
        $fixture->setComment('Value');
        $fixture->setCreatedAt('Value');
        $fixture->setUpdatedAt('Value');
        $fixture->setBookmarkCategory('Value');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s/edit', $this->path, $fixture->getId()));

        $this->client->submitForm('Update', [
            'bookmark[hyperlinkUrl]' => 'Something New',
            'bookmark[hyperlinkDescription]' => 'Something New',
            'bookmark[sorting]' => 'Something New',
            'bookmark[comment]' => 'Something New',
            'bookmark[createdAt]' => 'Something New',
            'bookmark[updatedAt]' => 'Something New',
            'bookmark[bookmarkCategory]' => 'Something New',
        ]);

        self::assertResponseRedirects('/bookmark/');

        $fixture = $this->repository->findAll();

        self::assertSame('Something New', $fixture[0]->getHyperlinkUrl());
        self::assertSame('Something New', $fixture[0]->getHyperlinkDescription());
        self::assertSame('Something New', $fixture[0]->getSorting());
        self::assertSame('Something New', $fixture[0]->getComment());
        self::assertSame('Something New', $fixture[0]->getCreatedAt());
        self::assertSame('Something New', $fixture[0]->getUpdatedAt());
        self::assertSame('Something New', $fixture[0]->getBookmarkCategory());
    }

    public function testRemove(): void
    {
        $this->markTestIncomplete();
        $fixture = new Bookmark();
        $fixture->setHyperlinkUrl('Value');
        $fixture->setHyperlinkDescription('Value');
        $fixture->setSorting('Value');
        $fixture->setComment('Value');
        $fixture->setCreatedAt('Value');
        $fixture->setUpdatedAt('Value');
        $fixture->setBookmarkCategory('Value');

        $this->manager->remove($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));
        $this->client->submitForm('Delete');

        self::assertResponseRedirects('/bookmark/');
        self::assertSame(0, $this->repository->count([]));
    }
}
