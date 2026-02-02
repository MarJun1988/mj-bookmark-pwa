<?php

namespace App\Test\Controller;

use App\Entity\BookmarkCategory;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BookmarkCategoryControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $manager;
    private EntityRepository $repository;
    private string $path = '/bookmark/category/';

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->manager = static::getContainer()->get('doctrine')->getManager();
        $this->repository = $this->manager->getRepository(BookmarkCategory::class);

        foreach ($this->repository->findAll() as $object) {
            $this->manager->remove($object);
        }

        $this->manager->flush();
    }

    public function testIndex(): void
    {
        $crawler = $this->client->request('GET', $this->path);

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('BookmarkCategory index');

        // Use the $crawler to perform additional assertions e.g.
        // self::assertSame('Some text on the page', $crawler->filter('.p')->first());
    }

    public function testNew(): void
    {
        $this->markTestIncomplete();
        $this->client->request('GET', sprintf('%snew', $this->path));

        self::assertResponseStatusCodeSame(200);

        $this->client->submitForm('Save', [
            'bookmark_category[designation]' => 'Testing',
            'bookmark_category[sorting]' => 'Testing',
            'bookmark_category[viewClasses]' => 'Testing',
            'bookmark_category[comment]' => 'Testing',
            'bookmark_category[createdAt]' => 'Testing',
            'bookmark_category[updatedAt]' => 'Testing',
            'bookmark_category[tabArea]' => 'Testing',
        ]);

        self::assertResponseRedirects('/sweet/food/');

        self::assertSame(1, $this->getRepository()->count([]));
    }

    public function testShow(): void
    {
        $this->markTestIncomplete();
        $fixture = new BookmarkCategory();
        $fixture->setDesignation('My Title');
        $fixture->setSorting('My Title');
        $fixture->setViewClasses('My Title');
        $fixture->setComment('My Title');
        $fixture->setCreatedAt('My Title');
        $fixture->setUpdatedAt('My Title');
        $fixture->setTabArea('My Title');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('BookmarkCategory');

        // Use assertions to check that the properties are properly displayed.
    }

    public function testEdit(): void
    {
        $this->markTestIncomplete();
        $fixture = new BookmarkCategory();
        $fixture->setDesignation('Value');
        $fixture->setSorting('Value');
        $fixture->setViewClasses('Value');
        $fixture->setComment('Value');
        $fixture->setCreatedAt('Value');
        $fixture->setUpdatedAt('Value');
        $fixture->setTabArea('Value');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s/edit', $this->path, $fixture->getId()));

        $this->client->submitForm('Update', [
            'bookmark_category[designation]' => 'Something New',
            'bookmark_category[sorting]' => 'Something New',
            'bookmark_category[viewClasses]' => 'Something New',
            'bookmark_category[comment]' => 'Something New',
            'bookmark_category[createdAt]' => 'Something New',
            'bookmark_category[updatedAt]' => 'Something New',
            'bookmark_category[tabArea]' => 'Something New',
        ]);

        self::assertResponseRedirects('/bookmark/category/');

        $fixture = $this->repository->findAll();

        self::assertSame('Something New', $fixture[0]->getDesignation());
        self::assertSame('Something New', $fixture[0]->getSorting());
        self::assertSame('Something New', $fixture[0]->getViewClasses());
        self::assertSame('Something New', $fixture[0]->getComment());
        self::assertSame('Something New', $fixture[0]->getCreatedAt());
        self::assertSame('Something New', $fixture[0]->getUpdatedAt());
        self::assertSame('Something New', $fixture[0]->getTabArea());
    }

    public function testRemove(): void
    {
        $this->markTestIncomplete();
        $fixture = new BookmarkCategory();
        $fixture->setDesignation('Value');
        $fixture->setSorting('Value');
        $fixture->setViewClasses('Value');
        $fixture->setComment('Value');
        $fixture->setCreatedAt('Value');
        $fixture->setUpdatedAt('Value');
        $fixture->setTabArea('Value');

        $this->manager->remove($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));
        $this->client->submitForm('Delete');

        self::assertResponseRedirects('/bookmark/category/');
        self::assertSame(0, $this->repository->count([]));
    }
}
